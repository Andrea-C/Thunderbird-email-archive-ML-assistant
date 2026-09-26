let currentAccount = null;

// Get algorithm display name
function getAlgorithmDisplayName(algorithmType) {
  switch (algorithmType) {
    case 'svm':
      return 'SVM';
    case 'tfidf_naive_bayes':
      return 'TF-IDF Naive Bayes';
    case 'naive_bayes':
      return 'Naive Bayes';
    default:
      return algorithmType || 'Unknown';
  }
}

// Get display name of a model's feature set
function getFeaturesDisplayName(features) {
  return features === 'headers+body' ? 'sender + subject + body' : 'sender + subject';
}

// Format a 0-1 ratio as a percentage ('–' when not available)
function formatPercent(value) {
  return value === null || value === undefined ? '–' : `${(value * 100).toFixed(1)}%`;
}

// Build a table element; rows are { className, cells: [{ text, num }] }
function buildEvaluationTable(headers, rows) {
  const table = document.createElement('table');
  table.className = 'evaluation-table';
  const headRow = table.createTHead().insertRow();
  for (const header of headers) {
    const th = document.createElement('th');
    th.textContent = header;
    headRow.appendChild(th);
  }
  const body = table.createTBody();
  for (const row of rows) {
    const tr = body.insertRow();
    if (row.className) tr.className = row.className;
    for (const cell of row.cells) {
      const td = tr.insertCell();
      td.textContent = cell.text;
      if (cell.num) td.className = 'num';
    }
  }
  return table;
}

// Build a section title element
function buildHeading(text) {
  const heading = document.createElement('h4');
  heading.textContent = text;
  return heading;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const accountSelect = document.getElementById('accountSelect');
  const folderTreeElement = document.getElementById('folderTree');
  const trainButton = document.getElementById('trainButton');
  const modelsList = document.getElementById('modelsList');
  const status = document.getElementById('status');
  const folderCount = document.getElementById('folderCount');
  const messageCount = document.getElementById('messageCount');
  const currentFolderEl = document.getElementById('currentFolder');
  const evaluationPanel = document.getElementById('evaluationPanel');
  const evaluationTitle = document.getElementById('evaluationTitle');
  const evaluationContent = document.getElementById('evaluationContent');
  const copyReportButton = document.getElementById('copyReportButton');
  const reportFallback = document.getElementById('reportFallback');
  let currentReportMarkdown = '';
  let shownReportModel = null;  // { accountId, algorithmType } of the report on screen
  
  // Hide the report panel (optionally only if it shows the given model)
  function hideEvaluationReport(accountId = null, algorithmType = null) {
    if (accountId && shownReportModel &&
        (shownReportModel.accountId !== accountId || shownReportModel.algorithmType !== algorithmType)) {
      return;
    }
    evaluationPanel.hidden = true;
    shownReportModel = null;
  }

  // Show the evaluation report stored in a model's metadata
  function showEvaluationReport(meta, accountName, accountId) {
    shownReportModel = { accountId, algorithmType: meta.algorithmType };
    const report = meta && meta.evaluation;
    evaluationContent.replaceChildren();
    reportFallback.hidden = true;
    evaluationPanel.hidden = false;
    evaluationPanel.open = true;
    evaluationTitle.textContent = `Evaluation report — ${accountName} · ${getAlgorithmDisplayName(meta.algorithmType)} · ${getFeaturesDisplayName(meta.features)}`;
    currentReportMarkdown = background.emailArchive.evaluationToMarkdown(meta, accountName);

    if (!report) {
      const note = document.createElement('p');
      note.textContent = meta.trainedAt
        ? 'No evaluation report: too few messages to hold some out for testing.'
        : 'No evaluation report: this model was trained before version 3.0, train it again to get one.';
      evaluationContent.appendChild(note);
      copyReportButton.hidden = true;
      return;
    }
    copyReportButton.hidden = false;

    const summary = document.createElement('p');
    summary.className = 'evaluation-summary';
    const dateFilterNote = meta.trainingMonths ? ` · last ${meta.trainingMonths} months` : (meta.trainingMonths === 0 ? ' · all dates' : '');
    summary.textContent = `Accuracy ${formatPercent(report.accuracy)} · macro-F1 ${formatPercent(report.macroF1)}${dateFilterNote} · ` +
      `${report.testSize} test messages (${report.holdoutPercent}% hold-out, evaluation model trained on ${report.trainSize})`;
    evaluationContent.appendChild(summary);

    const calibrationNote = document.createElement('p');
    calibrationNote.textContent = report.calibration
      ? `Confidence calibrated on ${report.calibration.samples} test messages (score: ${report.calibration.score}, ` +
        `separates right from wrong with AUC ${report.calibration.auc.toFixed(3)}); the threshold table is measured on the other ${report.thresholdSampleSize}.`
      : 'Confidence not calibrated (too few test messages): the percentages are the classifier\'s own and tend to be overconfident.';
    evaluationContent.appendChild(calibrationNote);

    // Threshold table: the numbers that matter for "Move Selected"
    evaluationContent.appendChild(buildHeading('Confidence threshold — share of messages above it, and how often they are right'));
    evaluationContent.appendChild(buildEvaluationTable(
      ['Threshold', 'Coverage', 'Messages', 'Precision above threshold'],
      report.thresholds.map(t => ({
        className: t.threshold === report.defaultThreshold ? 'highlight' : '',
        cells: [
          { text: `≥ ${t.threshold}%` },
          { text: formatPercent(t.coverage), num: true },
          { text: String(t.count), num: true },
          { text: formatPercent(t.precision), num: true }
        ]
      }))
    ));

    evaluationContent.appendChild(buildHeading('Top confusions (actual → predicted)'));
    if (report.topConfusions.length === 0) {
      const none = document.createElement('p');
      none.textContent = 'None.';
      evaluationContent.appendChild(none);
    } else {
      evaluationContent.appendChild(buildEvaluationTable(
        ['Actual folder', 'Predicted folder', 'Count'],
        report.topConfusions.map(c => ({
          cells: [{ text: c.actual }, { text: c.predicted }, { text: String(c.count), num: true }]
        }))
      ));
    }

    // Per-folder details (long list): collapsed by default
    const perFolder = document.createElement('details');
    const perFolderSummary = document.createElement('summary');
    perFolderSummary.textContent = `Per folder (${report.perFolder.length} folders; grey ⚠ = fewer than ${report.minTestSupport} test messages)`;
    perFolder.appendChild(perFolderSummary);
    perFolder.appendChild(buildEvaluationTable(
      ['Folder', 'Train', 'Test', 'Precision', 'Recall', 'F1'],
      report.perFolder.map(f => ({
        className: f.insufficient ? 'insufficient' : '',
        cells: [
          { text: f.folder + (f.insufficient ? ' ⚠' : '') },
          { text: String(f.trainCount), num: true },
          { text: String(f.support), num: true },
          { text: formatPercent(f.precision), num: true },
          { text: formatPercent(f.recall), num: true },
          { text: formatPercent(f.f1), num: true }
        ]
      }))
    ));
    evaluationContent.appendChild(perFolder);
  }

  // Copy the current report as Markdown (fallback: show it for manual copy)
  copyReportButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentReportMarkdown);
      status.textContent = 'Report copied to the clipboard as Markdown.';
      status.className = 'success';
    } catch (error) {
      console.warn('Clipboard write failed, showing the report for manual copy:', error);
      reportFallback.value = currentReportMarkdown;
      reportFallback.hidden = false;
      reportFallback.select();
    }
  });
  
  let accounts = [];
  let background = null;
  
  // Initialize - get background page
  try {
    background = await browser.runtime.getBackgroundPage();
    if (!background || !background.emailArchive) {
      throw new Error('Background page not available');
    }
  } catch (error) {
    console.error('Failed to get background page:', error);
    status.textContent = 'Error: Could not connect to background page. ' + error.message;
    status.className = 'error';
    return;
  }
  
  // Load accounts
  try {
    accounts = await browser.accounts.list(true);
    for (const account of accounts) {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = account.name;
      accountSelect.appendChild(option);
    }
  } catch (error) {
    console.error('Failed to load accounts:', error);
    status.textContent = 'Error loading accounts: ' + error.message;
    status.className = 'error';
  }
  
  // Load trained models list
  async function updateModelsList() {
    try {
      // Get all accounts with their trained algorithms
      const accountModels = await background.emailArchive.getTrainedAccountsWithAlgorithms();
      
      modelsList.innerHTML = '';
      
      const accountIds = Object.keys(accountModels);
      if (accountIds.length === 0) {
        modelsList.innerHTML = '<div class="model-item">No trained models yet</div>';
        return;
      }
      
      for (const accountId of accountIds) {
        const account = accounts.find(a => a.id === accountId);
        if (!account) continue;
        
        const algorithms = accountModels[accountId];
        
        // Create one entry per algorithm for this account
        for (const algorithmType of algorithms) {
          const div = document.createElement('div');
          div.className = 'model-item';
          
          const infoDiv = document.createElement('div');
          infoDiv.style.flex = '1';
          
          const nameSpan = document.createElement('span');
          nameSpan.textContent = account.name;
          nameSpan.style.display = 'block';
          
          const algorithmSpan = document.createElement('span');
          algorithmSpan.className = 'model-algorithm';
          algorithmSpan.textContent = getAlgorithmDisplayName(algorithmType);
          
          // Show which features the model was trained with
          const meta = await background.emailArchive.getModelMeta(accountId, algorithmType);
          algorithmSpan.textContent += ` · ${getFeaturesDisplayName(meta.features)}`;
          if (meta.trainedAt) {
            algorithmSpan.textContent += ` · ${meta.messagesUsed} msgs · ${new Date(meta.trainedAt).toLocaleString()}`;
          }
          if (meta.trainingMonths !== undefined) {
            algorithmSpan.textContent += meta.trainingMonths ? ` · last ${meta.trainingMonths} months` : ' · all dates';
          }
          if (meta.evaluation) {
            algorithmSpan.textContent += ` · accuracy ${formatPercent(meta.evaluation.accuracy)}`;
          }
          
          infoDiv.appendChild(nameSpan);
          infoDiv.appendChild(algorithmSpan);
          
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Delete';
          deleteBtn.onclick = async () => {
            if (confirm(`Delete ${getAlgorithmDisplayName(algorithmType)} model for ${account.name}?`)) {
              try {
                await background.emailArchive.deleteModel(accountId, algorithmType);
                hideEvaluationReport(accountId, algorithmType);
                updateModelsList();
              } catch (e) {
                console.error('Error deleting model:', e);
                status.textContent = 'Error deleting model: ' + e.message;
                status.className = 'error';
              }
            }
          };
          
          const reportBtn = document.createElement('button');
          reportBtn.textContent = 'Report';
          reportBtn.disabled = !meta.evaluation;
          reportBtn.title = meta.evaluation ? 'Show the evaluation report' : 'No report: train this model again';
          reportBtn.onclick = () => showEvaluationReport({ algorithmType, ...meta }, account.name, accountId);

          div.appendChild(infoDiv);
          div.appendChild(reportBtn);
          div.appendChild(deleteBtn);
          modelsList.appendChild(div);
        }
      }
    } catch (error) {
      console.error('Error updating models list:', error);
      console.error('Error stack:', error.stack);
      modelsList.innerHTML = `<div class="model-item">Error loading models: ${error.message}</div>`;
    }
  }
  
  // Initial models list load
  await updateModelsList();
  
  // Read every folder checkbox of the tree (checked and unchecked)
  function collectFolderSelection() {
    return Array.from(folderTreeElement.querySelectorAll('input[type="checkbox"]'))
      .map(checkbox => ({ path: checkbox.value, selected: checkbox.checked }));
  }
  
  // Persist the current tree selection (unchecked folders included, so they
  // stay unchecked next time)
  async function saveFolderSelection(accountId) {
    try {
      const saved = await background.emailArchive.saveFolderStructure(accountId, collectFolderSelection());
      if (!saved) throw new Error('storage error');
    } catch (e) {
      console.error('Error saving folder selection:', e);
      status.textContent = 'Could not save the folder selection: ' + e.message;
      status.className = 'error';
    }
  }
  
  // Date filter input (R3-2): load / save the per-account value
  const trainingMonthsInput = document.getElementById('trainingMonths');

  async function loadTrainingSettings(accountId) {
    try {
      const settings = await background.emailArchive.getTrainingSettings(accountId);
      trainingMonthsInput.value = settings.trainingMonths;
    } catch (e) {
      console.error('Error loading training settings:', e);
      trainingMonthsInput.value = background.emailArchive.DEFAULT_TRAINING_MONTHS;
    }
  }

  // Read the input as an integer >= 0 (invalid -> default)
  function getTrainingMonths() {
    const months = Math.floor(Number(trainingMonthsInput.value));
    return Number.isFinite(months) && months >= 0 ? months : background.emailArchive.DEFAULT_TRAINING_MONTHS;
  }

  trainingMonthsInput.addEventListener('change', async () => {
    trainingMonthsInput.value = getTrainingMonths();
    if (!currentAccount) return;
    try {
      await background.emailArchive.saveTrainingSettings(currentAccount.id, { trainingMonths: getTrainingMonths() });
    } catch (e) {
      console.error('Error saving training settings:', e);
    }
  });

  // Load folders for selected account
  async function loadFolders(account) {
    try {
      // Show loading state
      folderTreeElement.innerHTML = '<div style="padding: 10px; color: #666;">Loading folders...</div>';
      
      // Get current folders with their states
      const folders = await background.emailArchive.getFoldersWithState(account);
      
      if (!folders || folders.length === 0) {
        folderTreeElement.innerHTML = '<div style="padding: 10px; color: #666;">No folders found</div>';
        return;
      }
      
      // Build folder hierarchy
      const folderMap = new Map();
      const rootFolders = [];
      
      folders.forEach(folder => {
        // Split path to get parent-child relationships
        const pathParts = folder.path.split('/');
        const folderName = pathParts[pathParts.length - 1];
        const parentPath = pathParts.slice(0, -1).join('/');
        
        // Create folder node
        const folderNode = {
          ...folder,
          name: folderName,
          children: [],
          level: pathParts.length - 1
        };
        
        folderMap.set(folder.path, folderNode);
        
        if (parentPath) {
          const parentNode = folderMap.get(parentPath);
          if (parentNode) {
            parentNode.children.push(folderNode);
          }
        } else {
          rootFolders.push(folderNode);
        }
      });
      
      // Clear existing folders
      folderTreeElement.innerHTML = '';
      
      // Recursive function to render folder hierarchy
      function renderFolder(folder, level = 0) {
        const div = document.createElement('div');
        div.className = 'folder-item';
        div.style.paddingLeft = `${level * 20}px`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = folder.path;
        checkbox.checked = folder.selected;
        checkbox.id = `folder-${folder.path.replace(/[\/\s]/g, '_')}`;
        
        // Save the whole tree's state whenever a checkbox changes
        checkbox.addEventListener('change', () => saveFolderSelection(account.id));
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = folder.name;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        folderTreeElement.appendChild(div);
        
        // Recursively render children
        if (folder.children) {
          folder.children.forEach(child => renderFolder(child, level + 1));
        }
      }
      
      // Render the folder tree
      rootFolders.forEach(folder => renderFolder(folder));
      
      // Show count
      status.textContent = `Found ${folders.length} folders`;
      status.className = 'success';
      
    } catch (error) {
      console.error('Error loading folders:', error);
      folderTreeElement.innerHTML = '<div style="padding: 10px; color: #c00;">Error loading folders</div>';
      status.textContent = 'Error loading folders: ' + error.message;
      status.className = 'error';
    }
  }
  
  // Handle account selection change
  accountSelect.addEventListener('change', async () => {
    hideEvaluationReport();
    const selectedAccount = accounts.find(acc => acc.id === accountSelect.value);
    if (selectedAccount) {
      currentAccount = selectedAccount;
      await loadTrainingSettings(selectedAccount.id);
      await loadFolders(selectedAccount);
    } else {
      currentAccount = null;
      folderTreeElement.innerHTML = '';
    }
  });
  
  // Get selected algorithm
  function getSelectedAlgorithm() {
    const selected = document.querySelector('input[name="algorithm"]:checked');
    return selected ? selected.value : 'tfidf_naive_bayes';
  }
  
  // Handle train button click
  trainButton.addEventListener('click', async () => {
    if (!currentAccount) {
      status.textContent = 'Please select an account first.';
      status.className = 'error';
      return;
    }
    
    try {
      trainButton.disabled = true;
      
      // Get selected algorithm
      const algorithmType = getSelectedAlgorithm();
      const algorithmName = getAlgorithmDisplayName(algorithmType);
      
      status.textContent = `Training with ${algorithmName}...`;
      hideEvaluationReport();
      status.className = '';
      
      // Reset progress display
      folderCount.textContent = '-';
      messageCount.textContent = '-';
      currentFolderEl.textContent = '';
      
      // Get selected folders
      const selectedFolders = collectFolderSelection().filter(f => f.selected);
      
      if (selectedFolders.length === 0) {
        status.textContent = 'Please select at least one folder.';
        status.className = 'error';
        trainButton.disabled = false;
        return;
      }
      
      // Save current folder selection (all folders with their state)
      await saveFolderSelection(currentAccount.id);
      
      // Train the model with selected algorithm and options
      const includeBody = document.getElementById('includeBody').checked;
      const trainingMonths = getTrainingMonths();
      await background.emailArchive.saveTrainingSettings(currentAccount.id, { trainingMonths });
      const result = await background.emailArchive.trainModel(
        currentAccount, 
        selectedFolders.map(f => f.path),
        algorithmType,
        { includeBody, trainingMonths }
      );
      
      if (result.success) {
        const dateFilterText = result.trainingMonths
          ? ` ${result.messagesSkipped} older messages skipped (before ${new Date(result.cutoffDate).toLocaleDateString()}).`
          : '';
        status.textContent = `Training complete! Processed ${result.messagesProcessed} messages using ${algorithmName} (${getFeaturesDisplayName(result.features)}).${dateFilterText}`;
        status.className = 'success';
        
        // Show the evaluation report of the new model
        try {
          const meta = await background.emailArchive.getModelMeta(currentAccount.id, algorithmType);
          showEvaluationReport({ algorithmType, ...meta }, currentAccount.name, currentAccount.id);
        } catch (reportError) {
          console.error('Could not show the evaluation report:', reportError);
        }
        
        // Update the models list
        await updateModelsList();
      }
    } catch (error) {
      console.error('Training error:', error);
      status.textContent = 'Training error: ' + error.message;
      status.className = 'error';
    } finally {
      trainButton.disabled = false;
    }
  });
  
  // Progress message handler
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'training-progress') {
      const { folderProgress, messageProgress } = message;
      folderCount.textContent = `${folderProgress.current} / ${folderProgress.total}`;
      messageCount.textContent = `${messageProgress.current} / ${messageProgress.total}`;
      currentFolderEl.textContent = `Current folder: ${folderProgress.currentFolder}`;
    } else if (message.type === 'evaluation-progress') {
      currentFolderEl.textContent = `Evaluating on held-out messages: ${message.current} / ${message.total}`;
      currentFolderEl.className = 'sync-status';
    } else if (message.type === 'folder-sync-start') {
      currentFolderEl.textContent = `Syncing folder: ${message.folder}...`;
      currentFolderEl.className = 'sync-status warning';
    } else if (message.type === 'folder-sync-complete') {
      currentFolderEl.textContent = `Sync complete: ${message.folder}`;
      currentFolderEl.className = 'sync-status success';
    }
  });

  // Add handlers for select/deselect all buttons
  document.getElementById('selectAllFolders').addEventListener('click', async () => {
    if (!currentAccount) return;
    folderTreeElement.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = true);
    await saveFolderSelection(currentAccount.id);
  });

  document.getElementById('deselectAllFolders').addEventListener('click', async () => {
    if (!currentAccount) return;
    folderTreeElement.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    await saveFolderSelection(currentAccount.id);
  });
  
  // Make algorithm options clickable on the entire row
  document.querySelectorAll('.algorithm-option').forEach(option => {
    option.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        const radio = option.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
        }
      }
    });
  });
  
  console.log('Training page initialized successfully');
});
