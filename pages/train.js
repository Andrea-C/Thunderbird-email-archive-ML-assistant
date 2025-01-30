let currentAccount = null;
let folderTree = {};

document.addEventListener('DOMContentLoaded', async () => {
  const accountSelect = document.getElementById('accountSelect');
  const folderList = document.getElementById('folderList');
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
      const folders = await background.emailArchive.getFoldersWithState(account);
      
      // Clear existing folders
      folderList.innerHTML = '';
      
      // Create folder checkboxes
      folders.forEach(folder => {
        const div = document.createElement('div');
        div.className = 'folder-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = folder.path;
        checkbox.checked = folder.selected;
        checkbox.id = `folder-${folder.path}`;
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = folder.name;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        folderList.appendChild(div);
      });
      
      // Save initial state when changing accounts
      const selectedFolders = folders
        .filter(f => f.selected)
        .map(f => ({ path: f.path, name: f.name, selected: true }));
      
      await background.emailArchive.saveFolderStructure(account.id, selectedFolders);
      
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
      const selectedFolders = Array.from(folderList.querySelectorAll('input[type="checkbox"]:checked'))
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
}); 