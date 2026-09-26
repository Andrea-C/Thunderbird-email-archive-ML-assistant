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
          
          infoDiv.appendChild(nameSpan);
          infoDiv.appendChild(algorithmSpan);
          
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Delete';
          deleteBtn.onclick = async () => {
            if (confirm(`Delete ${getAlgorithmDisplayName(algorithmType)} model for ${account.name}?`)) {
              try {
                await background.emailArchive.deleteModel(accountId, algorithmType);
                updateModelsList();
              } catch (e) {
                console.error('Error deleting model:', e);
                status.textContent = 'Error deleting model: ' + e.message;
                status.className = 'error';
              }
            }
          };
          
          div.appendChild(infoDiv);
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
        
        // Add change listener to save state when checkbox changes
        checkbox.addEventListener('change', async () => {
          try {
            // Update the folder's selected state in our data structure
            const folderData = folderMap.get(folder.path);
            if (folderData) {
              folderData.selected = checkbox.checked;
            }
            
            // Save the updated structure
            const updatedStructure = Array.from(folderMap.values())
              .map(f => ({
                path: f.path,
                name: f.name,
                selected: f.selected
              }));
            
            await background.emailArchive.saveFolderStructure(account.id, updatedStructure);
          } catch (e) {
            console.error('Error saving folder state:', e);
          }
        });
        
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
    const selectedAccount = accounts.find(acc => acc.id === accountSelect.value);
    if (selectedAccount) {
      currentAccount = selectedAccount;
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
      status.className = '';
      
      // Reset progress display
      folderCount.textContent = '-';
      messageCount.textContent = '-';
      currentFolderEl.textContent = '';
      
      // Get selected folders
      const selectedFolders = Array.from(folderTreeElement.querySelectorAll('input[type="checkbox"]:checked'))
        .map(checkbox => ({
          path: checkbox.value,
          name: checkbox.nextElementSibling ? checkbox.nextElementSibling.textContent : '',
          selected: true
        }));
      
      if (selectedFolders.length === 0) {
        status.textContent = 'Please select at least one folder.';
        status.className = 'error';
        trainButton.disabled = false;
        return;
      }
      
      // Save current folder selection
      await background.emailArchive.saveFolderStructure(currentAccount.id, selectedFolders);
      
      // Train the model with selected algorithm and options
      const includeBody = document.getElementById('includeBody').checked;
      const result = await background.emailArchive.trainModel(
        currentAccount, 
        selectedFolders.map(f => f.path),
        algorithmType,
        { includeBody }
      );
      
      if (result.success) {
        status.textContent = `Training complete! Processed ${result.messagesProcessed} messages using ${algorithmName} (${getFeaturesDisplayName(result.features)}).`;
        status.className = 'success';
        
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
    const checkboxes = folderTreeElement.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = true);
    
    // Trigger change event on one checkbox to save the state
    if (checkboxes.length > 0) {
      checkboxes[0].dispatchEvent(new Event('change'));
    }
  });

  document.getElementById('deselectAllFolders').addEventListener('click', async () => {
    const checkboxes = folderTreeElement.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    
    // Trigger change event on one checkbox to save the state
    if (checkboxes.length > 0) {
      checkboxes[0].dispatchEvent(new Event('change'));
    }
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
