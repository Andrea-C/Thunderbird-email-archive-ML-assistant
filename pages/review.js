// Review Folders - Analyze folder content for potential misplacements

let currentAccount = null;
let currentAlgorithm = null;
let currentFolder = null;
let emails = [];
let filteredEmails = [];
let availableFolders = [];

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

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

// Show status message
function showStatus(message, type = 'info') {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `show ${type}`;
}

// Hide status message
function hideStatus() {
  document.getElementById('status').className = '';
}

// Get confidence class
function getConfidenceClass(confidence) {
  if (confidence >= 80) return 'confidence-high';
  if (confidence >= 50) return 'confidence-medium';
  return 'confidence-low';
}

// Load accounts
async function loadAccounts() {
  const accountSelect = document.getElementById('accountSelect');
  
  try {
    const accounts = await browser.accounts.list(true);
    const background = await browser.runtime.getBackgroundPage();
    const trainedAccounts = await background.emailArchive.getTrainedAccounts();
    
    accountSelect.innerHTML = '<option value="">Select Account</option>';
    
    for (const account of accounts) {
      // Only show accounts with trained models
      if (trainedAccounts.includes(account.id)) {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = account.name;
        accountSelect.appendChild(option);
      }
    }
    
    if (accountSelect.options.length === 1) {
      showStatus('No trained accounts found. Please train a model first in the Training tab.', 'error');
    }
  } catch (error) {
    console.error('Error loading accounts:', error);
    showStatus('Error loading accounts: ' + error.message, 'error');
  }
}

// Load available algorithms for account
async function loadAlgorithms(accountId) {
  const algorithmSelect = document.getElementById('algorithmSelect');
  
  if (!accountId) {
    algorithmSelect.innerHTML = '<option value="">Select Algorithm</option>';
    algorithmSelect.disabled = true;
    return;
  }
  
  try {
    const background = await browser.runtime.getBackgroundPage();
    const algorithms = await background.emailArchive.getAvailableModels(accountId);
    
    algorithmSelect.innerHTML = '';
    
    if (algorithms.length === 0) {
      algorithmSelect.innerHTML = '<option value="">No models</option>';
      algorithmSelect.disabled = true;
      return;
    }
    
    for (const algo of algorithms) {
      const option = document.createElement('option');
      option.value = algo;
      option.textContent = getAlgorithmDisplayName(algo);
      algorithmSelect.appendChild(option);
    }
    
    algorithmSelect.disabled = false;
    currentAlgorithm = algorithms[0];
  } catch (error) {
    console.error('Error loading algorithms:', error);
    algorithmSelect.innerHTML = '<option value="">Error</option>';
    algorithmSelect.disabled = true;
  }
}

// Load folders for account
async function loadFolders(accountId) {
  const folderSelect = document.getElementById('folderSelect');
  
  if (!accountId) {
    folderSelect.innerHTML = '<option value="">Select Folder</option>';
    folderSelect.disabled = true;
    availableFolders = [];
    return;
  }
  
  try {
    const background = await browser.runtime.getBackgroundPage();
    const savedFolders = await background.emailArchive.getSavedFolders(accountId);
    
    folderSelect.innerHTML = '<option value="">Select Folder</option>';
    availableFolders = [];
    
    if (savedFolders && Array.isArray(savedFolders)) {
      // Sort folders alphabetically
      const sortedFolders = savedFolders
        .filter(f => f.selected !== false)
        .map(f => f.path || f)
        .sort((a, b) => a.localeCompare(b));
      
      availableFolders = sortedFolders;
      
      for (const folder of sortedFolders) {
        const option = document.createElement('option');
        option.value = folder;
        option.textContent = folder;
        folderSelect.appendChild(option);
      }
    }
    
    folderSelect.disabled = false;
    document.getElementById('analyzeButton').disabled = false;
  } catch (error) {
    console.error('Error loading folders:', error);
    folderSelect.innerHTML = '<option value="">Error</option>';
    folderSelect.disabled = true;
  }
}

// Analyze folder - classify all emails and find misplacements
async function analyzeFolder() {
  const accountSelect = document.getElementById('accountSelect');
  const folderSelect = document.getElementById('folderSelect');
  const analyzeButton = document.getElementById('analyzeButton');
  
  const accountId = accountSelect.value;
  const folderPath = folderSelect.value;
  
  if (!accountId || !folderPath) {
    showStatus('Please select an account and folder', 'error');
    return;
  }
  
  currentFolder = folderPath;
  
  try {
    analyzeButton.disabled = true;
    showStatus('Analyzing folder... This may take a while for large folders.', 'info');
    
    const background = await browser.runtime.getBackgroundPage();
    const accounts = await browser.accounts.list(true);
    currentAccount = accounts.find(a => a.id === accountId);
    
    if (!currentAccount) {
      throw new Error('Account not found');
    }
    
    // Find the folder
    const allFolders = await browser.folders.getSubFolders(currentAccount, true);
    const targetFolder = findFolderByPath(allFolders, folderPath);
    
    if (!targetFolder) {
      throw new Error(`Folder not found: ${folderPath}`);
    }
    
    // Get all messages in the folder
    showStatus(`Loading messages from ${folderPath}...`, 'info');
    
    let page = await browser.messages.list(targetFolder);
    let allMessages = [...page.messages];
    
    while (page.id) {
      page = await browser.messages.continueList(page.id);
      allMessages = allMessages.concat(page.messages);
      showStatus(`Loaded ${allMessages.length} messages...`, 'info');
    }
    
    if (allMessages.length === 0) {
      showStatus('No messages found in this folder', 'info');
      emails = [];
      updateTable();
      return;
    }
    
    // Classify each message
    showStatus(`Classifying ${allMessages.length} messages...`, 'info');
    emails = [];
    let classifiedCount = 0;
    
    // Classify in parallel (body models need one getFull() per message);
    // results keep the folder order, failed messages become null
    const results = await background.emailArchive.mapWithConcurrency(allMessages, background.emailArchive.BODY_FETCH_CONCURRENCY, async (message) => {
      try {
        const messageData = {
          id: message.id,
          author: message.author || '',
          subject: message.subject || '(No Subject)',
          date: new Date(message.date)
        };
        
        // Classify the message (the background reads the body if the model
        // was trained with it)
        // Pass the raw subject: '(No Subject)' is a display placeholder
        // that training never sees
        const prediction = await background.emailArchive.classifyMessage(
          { ...messageData, subject: message.subject || '' }, 
          accountId, 
          currentAlgorithm
        );
        
        return {
          ...messageData,
          currentFolder: folderPath,
          suggestedFolder: prediction.folder,
          confidence: prediction.confidence,
          isMisplaced: prediction.folder !== folderPath,
          selected: false
        };
      } catch (err) {
        console.warn('Error classifying message:', message.id, err);
        return null;
      } finally {
        // Update progress every 50 messages
        classifiedCount++;
        if (classifiedCount % 50 === 0) {
          showStatus(`Classifying: ${classifiedCount} / ${allMessages.length}`, 'info');
        }
      }
    });
    emails = results.filter(Boolean);
    
    showStatus(`Analysis complete. Found ${emails.filter(e => e.isMisplaced).length} potential misplacements.`, 'success');
    updateStats();
    applyFilters();
    
  } catch (error) {
    console.error('Error analyzing folder:', error);
    showStatus('Error analyzing folder: ' + error.message, 'error');
  } finally {
    analyzeButton.disabled = false;
  }
}

// Find folder by path recursively
function findFolderByPath(folders, targetPath) {
  for (const folder of folders) {
    if (folder.path === targetPath) {
      return folder;
    }
    if (folder.subFolders && folder.subFolders.length > 0) {
      const found = findFolderByPath(folder.subFolders, targetPath);
      if (found) return found;
    }
  }
  return null;
}

// Update statistics
function updateStats() {
  const statsBar = document.getElementById('statsBar');
  statsBar.style.display = 'flex';
  
  document.getElementById('statTotal').textContent = emails.length;
  document.getElementById('statMisplaced').textContent = emails.filter(e => e.isMisplaced).length;
  document.getElementById('statCorrect').textContent = emails.filter(e => !e.isMisplaced).length;
  document.getElementById('statSelected').textContent = emails.filter(e => e.selected).length;
}

// Apply filters and update table
function applyFilters() {
  const showFilter = document.querySelector('input[name="showFilter"]:checked').value;
  const threshold = parseInt(document.getElementById('thresholdSlider').value);
  
  if (showFilter === 'misplaced') {
    // Show only misplaced emails with confidence below threshold
    filteredEmails = emails.filter(e => e.isMisplaced && e.confidence < threshold);
  } else {
    // Show all emails
    filteredEmails = [...emails];
  }
  
  updateTable();
}

// Update the email table
function updateTable() {
  const emailList = document.getElementById('emailList');
  emailList.innerHTML = '';
  
  if (filteredEmails.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6" style="text-align: center; padding: 20px; color: #666;">No emails to display</td>';
    emailList.appendChild(row);
    return;
  }
  
  for (let i = 0; i < filteredEmails.length; i++) {
    const email = filteredEmails[i];
    const row = document.createElement('tr');
    
    if (email.isMisplaced) {
      row.classList.add('misplaced');
    }
    if (email.selected) {
      row.classList.add('selected');
    }
    
    const dateStr = email.date.toLocaleDateString() + ' ' + email.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const folderClass = email.isMisplaced ? 'suggested-folder' : 'match-folder';
    
    row.innerHTML = `
      <td class="col-checkbox">
        <input type="checkbox" data-index="${i}" ${email.selected ? 'checked' : ''}>
      </td>
      <td class="col-confidence">
        <span class="${getConfidenceClass(email.confidence)}">${email.confidence}%</span>
      </td>
      <td class="col-target ${folderClass}" title="${escapeHtml(email.suggestedFolder)}">
        ${email.isMisplaced ? '→ ' : '✓ '}${escapeHtml(email.suggestedFolder)}
      </td>
      <td class="col-from" title="${escapeHtml(email.author)}">${escapeHtml(email.author)}</td>
      <td class="col-subject" title="${escapeHtml(email.subject)}">${escapeHtml(email.subject)}</td>
      <td class="col-date">${dateStr}</td>
    `;
    
    // Add checkbox change handler
    const checkbox = row.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
      email.selected = checkbox.checked;
      row.classList.toggle('selected', email.selected);
      updateStats();
      updateActionButtons();
    });
    
    emailList.appendChild(row);
  }
  
  updateActionButtons();
}

// Update action buttons based on selection
function updateActionButtons() {
  const selectedCount = filteredEmails.filter(e => e.selected).length;
  const hasMisplacedSelected = filteredEmails.some(e => e.selected && e.isMisplaced);
  
  document.getElementById('moveToSuggestedButton').disabled = !hasMisplacedSelected;
  document.getElementById('moveToOtherButton').disabled = selectedCount === 0;
  document.getElementById('keepInFolderButton').disabled = selectedCount === 0;
}

// Move selected emails to their suggested folders
async function moveToSuggested() {
  const selectedEmails = filteredEmails.filter(e => e.selected && e.isMisplaced);
  
  if (selectedEmails.length === 0) {
    showStatus('No misplaced emails selected', 'error');
    return;
  }
  
  try {
    showStatus(`Moving ${selectedEmails.length} emails to suggested folders...`, 'info');
    
    const background = await browser.runtime.getBackgroundPage();
    let movedCount = 0;
    let errorCount = 0;
    
    // Group by destination folder
    const byFolder = {};
    for (const email of selectedEmails) {
      if (!byFolder[email.suggestedFolder]) {
        byFolder[email.suggestedFolder] = [];
      }
      byFolder[email.suggestedFolder].push(email);
    }
    
    // Move each group
    for (const [destFolder, emailGroup] of Object.entries(byFolder)) {
      try {
        const messageIds = emailGroup.map(e => e.id);
        await background.emailArchive.moveMessages(messageIds, destFolder, currentAccount.id);
        movedCount += emailGroup.length;
        
        // Remove moved emails from the list
        for (const email of emailGroup) {
          const index = emails.findIndex(e => e.id === email.id);
          if (index >= 0) {
            emails.splice(index, 1);
          }
        }
      } catch (err) {
        console.error('Error moving to folder:', destFolder, err);
        errorCount += emailGroup.length;
      }
    }
    
    showStatus(`Moved ${movedCount} emails. ${errorCount > 0 ? `${errorCount} failed.` : ''}`, 
               errorCount > 0 ? 'error' : 'success');
    
    updateStats();
    applyFilters();
    
  } catch (error) {
    console.error('Error moving emails:', error);
    showStatus('Error moving emails: ' + error.message, 'error');
  }
}

// Move selected emails to a specific folder
async function moveToFolder(destFolder) {
  const selectedEmails = filteredEmails.filter(e => e.selected);
  
  if (selectedEmails.length === 0) {
    showStatus('No emails selected', 'error');
    return;
  }
  
  try {
    showStatus(`Moving ${selectedEmails.length} emails to ${destFolder}...`, 'info');
    
    const background = await browser.runtime.getBackgroundPage();
    const messageIds = selectedEmails.map(e => e.id);
    
    await background.emailArchive.moveMessages(messageIds, destFolder, currentAccount.id);
    
    // Remove moved emails from the list
    for (const email of selectedEmails) {
      const index = emails.findIndex(e => e.id === email.id);
      if (index >= 0) {
        emails.splice(index, 1);
      }
    }
    
    showStatus(`Moved ${selectedEmails.length} emails to ${destFolder}`, 'success');
    
    updateStats();
    applyFilters();
    
  } catch (error) {
    console.error('Error moving emails:', error);
    showStatus('Error moving emails: ' + error.message, 'error');
  }
}

// Deselect all (keep in current folder)
function keepInFolder() {
  for (const email of filteredEmails) {
    email.selected = false;
  }
  updateTable();
  updateStats();
}

// Populate move dropdown
function populateMoveDropdown(filter = '') {
  const list = document.getElementById('moveDropdownList');
  list.innerHTML = '';
  
  const filterLower = filter.toLowerCase();
  const filtered = availableFolders.filter(f => f.toLowerCase().includes(filterLower));
  
  if (filtered.length === 0) {
    list.innerHTML = '<div class="move-dropdown-item" style="color: #999;">No folders found</div>';
    return;
  }
  
  for (const folder of filtered) {
    const item = document.createElement('div');
    item.className = 'move-dropdown-item';
    item.textContent = folder;
    item.addEventListener('click', () => {
      moveToFolder(folder);
      closeMoveDropdown();
    });
    list.appendChild(item);
  }
}

// Toggle move dropdown
function toggleMoveDropdown() {
  const dropdown = document.getElementById('moveDropdown');
  dropdown.classList.toggle('show');
  
  if (dropdown.classList.contains('show')) {
    populateMoveDropdown();
    document.getElementById('moveSearchInput').focus();
  }
}

// Close move dropdown
function closeMoveDropdown() {
  document.getElementById('moveDropdown').classList.remove('show');
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadAccounts();
  
  // Account selection
  document.getElementById('accountSelect').addEventListener('change', async (e) => {
    currentAccount = null;
    currentAlgorithm = null;
    currentFolder = null;
    emails = [];
    filteredEmails = [];
    
    const accountId = e.target.value;
    await loadAlgorithms(accountId);
    await loadFolders(accountId);
    
    document.getElementById('statsBar').style.display = 'none';
    document.getElementById('emailList').innerHTML = '';
  });
  
  // Algorithm selection
  document.getElementById('algorithmSelect').addEventListener('change', (e) => {
    currentAlgorithm = e.target.value;
  });
  
  // Folder selection
  document.getElementById('folderSelect').addEventListener('change', (e) => {
    currentFolder = e.target.value;
    document.getElementById('analyzeButton').disabled = !e.target.value;
  });
  
  // Analyze button
  document.getElementById('analyzeButton').addEventListener('click', analyzeFolder);
  
  // Move to suggested
  document.getElementById('moveToSuggestedButton').addEventListener('click', moveToSuggested);
  
  // Move to other
  document.getElementById('moveToOtherButton').addEventListener('click', toggleMoveDropdown);
  
  // Move dropdown search
  document.getElementById('moveSearchInput').addEventListener('input', (e) => {
    populateMoveDropdown(e.target.value);
  });
  
  // Keep in folder
  document.getElementById('keepInFolderButton').addEventListener('click', keepInFolder);
  
  // Filter changes
  document.querySelectorAll('input[name="showFilter"]').forEach(radio => {
    radio.addEventListener('change', applyFilters);
  });
  
  // Threshold slider
  const thresholdSlider = document.getElementById('thresholdSlider');
  const thresholdValue = document.getElementById('thresholdValue');
  thresholdSlider.addEventListener('input', () => {
    thresholdValue.textContent = thresholdSlider.value + '%';
    applyFilters();
  });
  
  // Select all checkbox
  document.getElementById('selectAll').addEventListener('change', (e) => {
    for (const email of filteredEmails) {
      email.selected = e.target.checked;
    }
    updateTable();
    updateStats();
  });
  
  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.move-dropdown-container')) {
      closeMoveDropdown();
    }
  });
});

