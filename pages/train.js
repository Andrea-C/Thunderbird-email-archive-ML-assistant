let currentAccount = null;
let folderTree = {};

document.addEventListener('DOMContentLoaded', async () => {
  const accountSelect = document.getElementById('accountSelect');
  const folderTreeElement = document.getElementById('folderTree');
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
  
  // Build folder tree
  async function buildFolderTree(account) {
    const background = await browser.runtime.getBackgroundPage();
    const savedFolders = await background.emailArchive.getSavedFolders(account.id);
    
    folderTreeElement.innerHTML = '';
    folderTree = {};
    
    // Get all folders including subfolders
    const folders = await background.emailArchive.getAllFolders(account);
    
    for (const folder of folders) {
      const div = document.createElement('div');
      div.className = 'folder-item';
      div.style.marginLeft = `${folder.level * 20}px`;
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.path = folder.path;
      // Default folders are shown but unchecked by default
      checkbox.checked = folder.isDefault ? false : (savedFolders ? savedFolders.includes(folder.path) : true);
      
      const label = document.createElement('label');
      label.textContent = folder.name;
      if (folder.isDefault) {
        label.style.fontWeight = 'bold';
      }
      
      div.appendChild(checkbox);
      div.appendChild(label);
      
      folderTreeElement.appendChild(div);
      folderTree[folder.path] = checkbox;
    }
  }
  
  // Account selection handler
  accountSelect.addEventListener('change', async () => {
    const accountId = accountSelect.value;
    if (!accountId) return;
    
    currentAccount = accounts.find(a => a.id === accountId);
    await buildFolderTree(currentAccount);
  });
  
  // Select/Deselect all handlers
  selectAllBtn.addEventListener('click', () => {
    Object.values(folderTree).forEach(checkbox => checkbox.checked = true);
  });
  
  deselectAllBtn.addEventListener('click', () => {
    Object.values(folderTree).forEach(checkbox => checkbox.checked = false);
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
  
  // Training handler
  trainButton.addEventListener('click', async () => {
    const selectedFolders = Object.entries(folderTree)
      .filter(([_, checkbox]) => checkbox.checked)
      .map(([path]) => path);
    
    if (selectedFolders.length === 0) {
      status.textContent = 'Please select at least one folder';
      status.className = 'error';
      return;
    }
    
    try {
      trainButton.disabled = true;
      accountSelect.disabled = true;
      status.textContent = 'Preparing training...';
      status.className = '';
      
      const background = await browser.runtime.getBackgroundPage();
      const result = await background.emailArchive.trainModel(currentAccount, selectedFolders);
      
      if (result.success) {
        status.textContent = `Training completed successfully! Processed ${result.messagesProcessed} messages.`;
        status.className = 'success';
        await updateModelsList();
      } else {
        throw new Error('Training failed');
      }
    } catch (error) {
      status.textContent = `Error: ${error.message}`;
      status.className = 'error';
    } finally {
      trainButton.disabled = false;
      accountSelect.disabled = false;
      
      // Reset progress displays
      folderCount.textContent = '-';
      messageCount.textContent = '-';
      currentFolder.textContent = '';
    }
  });
}); 