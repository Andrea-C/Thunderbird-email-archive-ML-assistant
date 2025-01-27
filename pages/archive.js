let currentAccount = null;
let messages = [];

document.addEventListener('DOMContentLoaded', async () => {
  const accountSelect = document.getElementById('accountSelect');
  const classifyButton = document.getElementById('classifyButton');
  const moveButton = document.getElementById('moveButton');
  const selectAll = document.getElementById('selectAll');
  const messageList = document.getElementById('messageList');
  const status = document.getElementById('status');
  
  // Load accounts
  const accounts = await browser.accounts.list();
  for (const account of accounts) {
    const option = document.createElement('option');
    option.value = account.id;
    option.textContent = account.name;
    accountSelect.appendChild(option);
  }
  
  // Account selection handler
  accountSelect.addEventListener('change', async () => {
    const accountId = accountSelect.value;
    if (!accountId) return;
    
    currentAccount = accounts.find(a => a.id === accountId);
    await loadInboxMessages();
  });
  
  // Select all checkbox handler
  selectAll.addEventListener('change', () => {
    const checkboxes = messageList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = selectAll.checked);
    updateMoveButton();
  });
  
  // Classify button handler
  classifyButton.addEventListener('click', async () => {
    const checkboxes = messageList.querySelectorAll('input[type="checkbox"]:checked');
    const selectedMessages = Array.from(checkboxes).map(cb => messages[cb.dataset.index]);
    
    if (selectedMessages.length === 0) {
      status.textContent = 'Please select messages to classify';
      status.className = 'error';
      return;
    }
    
    try {
      status.textContent = 'Classifying messages...';
      status.className = '';
      classifyButton.disabled = true;
      
      const background = await browser.runtime.getBackgroundPage();
      
      for (const message of selectedMessages) {
        const targetFolder = await background.emailArchive.classifyMessage(message, currentAccount.id);
        const row = messageList.querySelector(`tr[data-message-id="${message.id}"]`);
        if (row) {
          const folderCell = row.querySelector('.target-folder');
          folderCell.textContent = targetFolder;
          folderCell.dataset.folder = targetFolder;
        }
      }
      
      moveButton.disabled = false;
      status.textContent = 'Classification completed!';
      status.className = 'success';
    } catch (error) {
      status.textContent = `Error: ${error.message}`;
      status.className = 'error';
    } finally {
      classifyButton.disabled = false;
    }
  });
  
  // Move button handler
  moveButton.addEventListener('click', async () => {
    const checkboxes = messageList.querySelectorAll('input[type="checkbox"]:checked');
    const selectedRows = Array.from(checkboxes).map(cb => cb.closest('tr'));
    
    try {
      status.textContent = 'Moving messages...';
      status.className = '';
      moveButton.disabled = true;
      
      for (const row of selectedRows) {
        const messageId = row.dataset.messageId;
        const targetFolder = row.querySelector('.target-folder').dataset.folder;
        if (messageId && targetFolder) {
          await browser.messages.move([messageId], targetFolder);
          row.remove();
        }
      }
      
      status.textContent = 'Messages moved successfully!';
      status.className = 'success';
    } catch (error) {
      status.textContent = `Error: ${error.message}`;
      status.className = 'error';
    } finally {
      moveButton.disabled = false;
      updateMoveButton();
    }
  });
});

// Load inbox messages for selected account
async function loadInboxMessages() {
  const messageList = document.getElementById('messageList');
  messageList.innerHTML = '';
  messages = [];
  
  try {
    const inbox = await browser.folders.getInboxFolder(currentAccount);
    messages = await browser.messages.list(inbox);
    
    messages.forEach((message, index) => {
      const row = document.createElement('tr');
      row.dataset.messageId = message.id;
      
      row.innerHTML = `
        <td><input type="checkbox" data-index="${index}"></td>
        <td>${escapeHtml(message.author)}</td>
        <td>${escapeHtml(message.subject)}</td>
        <td>${new Date(message.date).toLocaleDateString()}</td>
        <td class="target-folder"></td>
      `;
      
      messageList.appendChild(row);
    });
    
    // Add change listeners to checkboxes
    const checkboxes = messageList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', updateMoveButton);
    });
  } catch (error) {
    console.error('Error loading messages:', error);
  }
}

// Update move button state
function updateMoveButton() {
  const hasClassified = document.querySelector('.target-folder:not(:empty)');
  const hasSelected = document.querySelector('input[type="checkbox"]:checked');
  moveButton.disabled = !(hasClassified && hasSelected);
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
} 