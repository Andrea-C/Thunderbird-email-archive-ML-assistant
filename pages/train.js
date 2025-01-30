let currentAccount = null;
let folderTree = {};

document.addEventListener('DOMContentLoaded', async () => {
  const accountSelect = document.getElementById('accountSelect');
  const folderTree = document.getElementById('folderTree');
  const selectAllBtn = document.getElementById('selectAllFolders');
  const deselectAllBtn = document.getElementById('deselectAllFolders');
  const trainButton = document.getElementById('trainButton');
  const modelsList = document.getElementById('modelsList');
  const status = document.getElementById('status');
  const folderCount = document.getElementById('folderCount');
  const messageCount = document.getElementById('messageCount');
  const currentFolder = document.getElementById('currentFolder');
  
  // Load accounts with subfolders
  const accounts = await browser.accounts.list(true);
  for (const account of accounts) {
    const option = document.createElement('option');
    option.value = account.id;
    option.textContent = account.name;
    accountSelect.appendChild(option);
  }
  
  // Load trained models list
  async function updateModelsList() {
    const background = await browser.runtime.getBackgroundPage();
    const trainedAccountIds = await background.emailArchive.getTrainedAccounts();
    
    modelsList.innerHTML = '';
    
    if (trainedAccountIds.length === 0) {
      modelsList.innerHTML = '<div class="model-item">No trained models yet</div>';
      return;
    }
    
    for (const accountId of trainedAccountIds) {
      const account = accounts.find(a => a.id === accountId);
      if (account) {
        const div = document.createElement('div');
        div.className = 'model-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = account.name;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async () => {
          await background.emailArchive.deleteModel(accountId);
          updateModelsList();
        };
        
        div.appendChild(nameSpan);
        div.appendChild(deleteBtn);
        modelsList.appendChild(div);
      }
    }
  }
  
  await updateModelsList();
  
  // Load folders for selected account
  async function loadFolders(account) {
    try {
      const background = await browser.runtime.getBackgroundPage();
      
      // Get current folders with their states (includes saved state handling)
      const folders = await background.emailArchive.getFoldersWithState(account);
      
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
      folderTree.innerHTML = '';
      
      // Recursive function to render folder hierarchy
      function renderFolder(folder, level = 0) {
        const div = document.createElement('div');
        div.className = 'folder-item';
        div.style.paddingLeft = `${level * 20}px`; // Indent based on level
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = folder.path;
        checkbox.checked = folder.selected;
        checkbox.id = `folder-${folder.path}`;
        
        // Add change listener to save state when checkbox changes
        checkbox.addEventListener('change', async () => {
          // Update the folder's selected state in our data structure
          const folderData = folderMap.get(folder.path);
          if (folderData) {
            folderData.selected = checkbox.checked;
          }
          
          // Save the updated structure
          const updatedStructure = Array.from(folderMap.values())
            .filter(f => !f.children || f.children.length === 0) // Only save leaf folders
            .map(f => ({
              path: f.path,
              name: f.name,
              selected: f.selected
            }));
          
          await background.emailArchive.saveFolderStructure(account.id, updatedStructure);
        });
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = folder.name;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        folderTree.appendChild(div);
        
        // Recursively render children
        if (folder.children) {
          folder.children.forEach(child => renderFolder(child, level + 1));
        }
      }
      
      // Render the folder tree
      rootFolders.forEach(folder => renderFolder(folder));
      
    } catch (error) {
      console.error('Error loading folders:', error);
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
    }
  });
  
  // Handle train button click
  trainButton.addEventListener('click', async () => {
    try {
      trainButton.disabled = true;
      status.textContent = 'Training in progress...';
      status.className = '';
      
      // Get selected folders
      const selectedFolders = Array.from(folderTree.querySelectorAll('input[type="checkbox"]:checked'))
        .map(checkbox => ({
          path: checkbox.value,
          name: checkbox.nextElementSibling.textContent,
          selected: true
        }));
      
      if (selectedFolders.length === 0) {
        status.textContent = 'Please select at least one folder.';
        status.className = 'error';
        return;
      }
      
      // Save current folder selection
      const background = await browser.runtime.getBackgroundPage();
      await background.emailArchive.saveFolderStructure(currentAccount.id, selectedFolders);
      
      // Train the model
      const result = await background.emailArchive.trainModel(currentAccount, selectedFolders.map(f => f.path));
      
      if (result.success) {
        status.textContent = `Training complete! Processed ${result.messagesProcessed} messages.`;
        status.className = 'success';
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
      currentFolder.textContent = `Current folder: ${folderProgress.currentFolder}`;
    } else if (message.type === 'folder-sync-start') {
      currentFolder.textContent = `Syncing folder: ${message.folder}...`;
      currentFolder.className = 'sync-status warning';
    } else if (message.type === 'folder-sync-complete') {
      currentFolder.textContent = `Sync complete: ${message.folder}`;
      currentFolder.className = 'sync-status success';
    }
  });

  // Add handlers for select/deselect all buttons
  document.getElementById('selectAllFolders').addEventListener('click', async () => {
    const checkboxes = folderTree.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = true);
    
    // Trigger change event on one checkbox to save the state
    if (checkboxes.length > 0) {
      checkboxes[0].dispatchEvent(new Event('change'));
    }
  });

  document.getElementById('deselectAllFolders').addEventListener('click', async () => {
    const checkboxes = folderTree.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    
    // Trigger change event on one checkbox to save the state
    if (checkboxes.length > 0) {
      checkboxes[0].dispatchEvent(new Event('change'));
    }
  });
}); 