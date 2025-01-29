let currentAccount = null;
let messages = [];

document.addEventListener('DOMContentLoaded', async () => {
  const accountSelect = document.getElementById('accountSelect');
  const classifyButton = document.getElementById('classifyButton');
  const moveButton = document.getElementById('moveButton');
  const selectAll = document.getElementById('selectAll');
  const messageList = document.getElementById('messageList');
  const status = document.getElementById('status');
  const confidenceSlider = document.getElementById('confidenceSlider');
  const confidenceValue = document.getElementById('confidenceValue');
  
  // Load only trained accounts
  const accounts = await browser.accounts.list();
  const background = await browser.runtime.getBackgroundPage();
  const trainedAccountIds = await background.emailArchive.getTrainedAccounts();
  
  const trainedAccounts = accounts.filter(account => trainedAccountIds.includes(account.id));
  
  if (trainedAccounts.length === 0) {
    status.textContent = 'No trained accounts found. Please train a model first.';
    status.className = 'error';
    accountSelect.disabled = true;
    classifyButton.disabled = true;
    return;
  }
  
  for (const account of trainedAccounts) {
    const option = document.createElement('option');
    option.value = account.id;
    option.textContent = account.name;
    accountSelect.appendChild(option);
  }
  
  // Load messages for the first account automatically
  if (trainedAccounts.length > 0) {
    accountSelect.value = trainedAccounts[0].id;
    currentAccount = trainedAccounts[0];
    await loadInboxMessages();
  }
  
  // Account selection handler
  accountSelect.addEventListener('change', async () => {
    const accountId = accountSelect.value;
    if (!accountId) return;
    
    currentAccount = trainedAccounts.find(a => a.id === accountId);
    await loadInboxMessages();
  });
  
  // Select all checkbox handler
  selectAll.addEventListener('change', () => {
    const checkboxes = messageList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = selectAll.checked);
    updateMoveButton();
  });
  
  // Update confidence value display
  confidenceSlider.addEventListener('input', () => {
    confidenceValue.textContent = `${confidenceSlider.value}%`;
  });
  
  // Classify button handler - now classifies all messages
  classifyButton.addEventListener('click', async () => {
    try {
      status.textContent = 'Classifying all messages...';
      status.className = '';
      classifyButton.disabled = true;
      
      const background = await browser.runtime.getBackgroundPage();
      const confidenceThreshold = parseFloat(confidenceSlider.value);
      
      for (const message of messages) {
        console.log('Classifying message:', {
          id: message.id,
          subject: message.subject,
          author: message.author
        });
        
        const result = await background.emailArchive.classifyMessage(message, currentAccount.id);
        console.log('Classification result:', {
          messageId: message.id,
          result: result
        });
        
        const row = messageList.querySelector(`tr[data-message-id="${message.id}"]`);
        if (row) {
          const folderCell = row.querySelector('.target-folder');
          if (result && result.confidence >= confidenceThreshold) {
            folderCell.textContent = result.folder;
            folderCell.dataset.folder = result.folder;
            folderCell.title = `Confidence: ${result.confidence.toFixed(1)}%`;
            folderCell.classList.remove('low-confidence');
          } else {
            folderCell.textContent = 'Low confidence';
            folderCell.dataset.folder = '';
            folderCell.title = result ? `Confidence: ${result.confidence.toFixed(1)}%` : '';
            folderCell.classList.add('low-confidence');
          }
        }
      }
      
      moveButton.disabled = false;
      status.textContent = `Classification completed! ${messages.length} messages processed.`;
      status.className = 'success';
    } catch (error) {
      console.error('Classification error:', error);
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
    
    if (selectedRows.length === 0) {
      status.textContent = 'Please select messages to move';
      status.className = 'error';
      return;
    }
    
    try {
      status.textContent = 'Moving messages...';
      status.className = '';
      moveButton.disabled = true;
      
      let movedCount = 0;
      let skippedCount = 0;
      
      for (const row of selectedRows) {
        const messageId = row.dataset.messageId;
        const targetFolder = row.querySelector('.target-folder').dataset.folder;
        if (messageId && targetFolder && targetFolder !== '') {
          await browser.messages.move([messageId], targetFolder);
          row.remove();
          movedCount++;
        } else {
          skippedCount++;
        }
      }
      
      status.textContent = `Messages processed: ${movedCount} moved, ${skippedCount} skipped (low confidence)`;
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
    // Get all folders for the account
    const folders = await browser.folders.query({
      accountId: currentAccount.id,
      specialUse: ['inbox']
    });
    
    if (!folders || folders.length === 0) {
      throw new Error('Inbox folder not found');
    }
    
    const inbox = folders[0];
    let page = await browser.messages.list(inbox.id);
    
    if (!page || !page.messages) {
      messageList.innerHTML = '<tr><td colspan="5">No messages in Inbox</td></tr>';
      return;
    }
    
    // Process first page
    messages = [...page.messages];
    
    // Get remaining pages if they exist
    while (page.id) {
      page = await browser.messages.continueList(page.id);
      if (page && page.messages) {
        messages = [...messages, ...page.messages];
      }
    }
    
    if (messages.length === 0) {
      messageList.innerHTML = '<tr><td colspan="5">No messages in Inbox</td></tr>';
      return;
    }
    
    // Clear existing content and add messages
    messageList.innerHTML = '';
    messages.forEach((message, index) => {
      const row = document.createElement('tr');
      row.dataset.messageId = message.id;
      
      row.innerHTML = `
        <td><input type="checkbox" data-index="${index}"></td>
        <td>${escapeHtml(message.author || '')}</td>
        <td>${escapeHtml(message.subject || '')}</td>
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
    
    // Update status
    const status = document.getElementById('status');
    status.textContent = `Loaded ${messages.length} messages from Inbox`;
    status.className = 'success';
  } catch (error) {
    console.error('Error loading messages:', error);
    messageList.innerHTML = '<tr><td colspan="5">Error loading messages</td></tr>';
    const status = document.getElementById('status');
    status.textContent = `Error: ${error.message}`;
    status.className = 'error';
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
  return (unsafe || '')
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
} 