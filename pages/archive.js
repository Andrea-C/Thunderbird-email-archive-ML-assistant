let currentAccount = null;
let messages = [];
let currentSort = { column: 'date', direction: 'desc' };

// Helper function to get confidence class
function getConfidenceClass(confidence) {
  if (confidence >= 80) return 'confidence-high';
  if (confidence >= 50) return 'confidence-medium';
  return 'confidence-low';
}

// Sort messages function
function sortMessages(field, ascending = true) {
  messages.sort((a, b) => {
    let aValue, bValue;
    
    // Get the correct values based on field
    switch (field) {
      case 'from':
        aValue = (a.author || '').toLowerCase();
        bValue = (b.author || '').toLowerCase();
        break;
      case 'subject':
        aValue = (a.subject || '').toLowerCase();
        bValue = (b.subject || '').toLowerCase();
        break;
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'target':
        aValue = (a.predictedFolder || '').toLowerCase();
        bValue = (b.predictedFolder || '').toLowerCase();
        break;
      case 'confidence':
        aValue = isNaN(a.confidence) ? -1 : a.confidence;
        bValue = isNaN(b.confidence) ? -1 : b.confidence;
        break;
      default:
        return 0;
    }
    
    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';
    
    // Compare values
    if (aValue < bValue) return ascending ? -1 : 1;
    if (aValue > bValue) return ascending ? 1 : -1;
    return 0;
  });
  
  updateTable();
}

// Update table display
function updateTable() {
  const messageList = document.getElementById('messageList');
  messageList.innerHTML = '';
  
  messages.forEach((message, index) => {
    const row = document.createElement('tr');
    row.dataset.messageId = message.id;
    
    const confidenceClass = message.confidence ? 
      getConfidenceClass(message.confidence) : '';
    const confidenceDisplay = message.confidence ? 
      `${message.confidence.toFixed(1)}%` : '';
    
    row.innerHTML = `
      <td><input type="checkbox" data-index="${index}"></td>
      <td class="col-date">${new Date(message.date).toLocaleDateString()}</td>
      <td class="col-from">${escapeHtml(message.author || '')}</td>
      <td class="col-subject">${escapeHtml(message.subject || '')}</td>
      <td class="col-confidence confidence-value ${confidenceClass}">${confidenceDisplay}</td>
      <td class="col-target target-folder">${message.predictedFolder || ''}</td>
    `;
    
    messageList.appendChild(row);
  });
  
  // Add change listeners to checkboxes
  const checkboxes = messageList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateMoveButton);
  });
  
  // Initialize resizing after table is created
  initializeColumnResizing();
}

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
  
  // Add sort handlers
  const headers = document.querySelectorAll('th[data-sort]');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const field = header.dataset.sort;
      const ascending = header.dataset.order !== 'asc';
      
      // Update sort indicators
      headers.forEach(h => {
        h.dataset.order = h === header ? (ascending ? 'asc' : 'desc') : '';
      });
      
      sortMessages(field, ascending);
    });
  });
  
  // Classify button handler
  classifyButton.addEventListener('click', async () => {
    try {
      status.textContent = 'Classifying messages...';
      status.className = '';
      classifyButton.disabled = true;
      
      const checkboxes = messageList.querySelectorAll('input[type="checkbox"]');
      const selectedIndices = Array.from(checkboxes)
        .map((checkbox, index) => checkbox.checked ? index : -1)
        .filter(index => index !== -1);
      
      if (selectedIndices.length === 0) {
        status.textContent = 'Please select messages to classify.';
        status.className = 'error';
        classifyButton.disabled = false;
        return;
      }
      
      const selectedMessages = selectedIndices.map(index => messages[index]);
      const background = await browser.runtime.getBackgroundPage();
      
      // Update target folders in the table
      const confidenceThreshold = parseInt(confidenceSlider.value);
      const rows = messageList.getElementsByTagName('tr');
      
      // Process each message individually
      for (let i = 0; i < selectedIndices.length; i++) {
        const index = selectedIndices[i];
        const message = messages[index];
        
        try {
          const prediction = await background.emailArchive.classifyMessage(message, currentAccount.id);
          
          // Store the prediction in the message object
          message.predictedFolder = prediction.folder;
          message.confidence = prediction.confidence;
          
          // Update the UI
          const targetCell = rows[index].querySelector('.target-folder');
          const confidenceCell = rows[index].querySelector('.confidence-value');
          
          targetCell.textContent = prediction.folder;
          confidenceCell.textContent = `${prediction.confidence.toFixed(1)}%`;
          confidenceCell.className = `confidence-value ${getConfidenceClass(prediction.confidence)}`;
          
          if (prediction.confidence < confidenceThreshold) {
            targetCell.classList.add('low-confidence');
          } else {
            targetCell.classList.remove('low-confidence');
          }
        } catch (error) {
          console.error(`Error classifying message ${message.id}:`, error);
          const targetCell = rows[index].querySelector('.target-folder');
          targetCell.textContent = 'Classification failed';
          targetCell.classList.add('low-confidence');
        }
      }
      
      status.textContent = 'Classification complete.';
      status.className = 'success';
      moveButton.disabled = false;
      classifyButton.disabled = false;
      
    } catch (error) {
      console.error('Classification error:', error);
      status.textContent = 'Error classifying messages: ' + error.message;
      status.className = 'error';
      classifyButton.disabled = false;
    }
  });
  
  // Handle move button
  moveButton.addEventListener('click', async () => {
    if (!currentAccount) return;
    
    const confidenceThreshold = parseInt(confidenceSlider.value);
    const checkboxes = messageList.querySelectorAll('input[type="checkbox"]');
    const selectedMessages = Array.from(checkboxes)
      .map((checkbox, index) => checkbox.checked ? messages[index] : null)
      .filter(message => message && message.confidence >= confidenceThreshold);
    
    if (selectedMessages.length === 0) {
      status.textContent = 'No messages selected with confidence above threshold.';
      status.className = 'error';
      return;
    }

    const totalSelected = Array.from(checkboxes).filter(cb => cb.checked).length;
    const skippedCount = totalSelected - selectedMessages.length;
    
    status.textContent = 'Moving messages...';
    status.className = '';
    moveButton.disabled = true;
    
    try {
      const results = await background.emailArchive.moveMessages(currentAccount.id, selectedMessages);
      await loadInboxMessages();
      
      // Process results
      const successCount = results.reduce((sum, r) => sum + (r.success ? r.count : 0), 0);
      const copyCount = results.reduce((sum, r) => sum + (r.success && r.copied ? r.count : 0), 0);
      const failCount = results.reduce((sum, r) => sum + (!r.success ? r.count : 0), 0);
      
      let statusMessage = [];
      if (successCount > 0) {
        if (copyCount > 0) {
          statusMessage.push(`${copyCount} messages copied (could not be moved)`);
          successCount -= copyCount;
        }
        if (successCount > 0) {
          statusMessage.push(`${successCount} messages moved`);
        }
      }
      if (failCount > 0) {
        statusMessage.push(`${failCount} messages failed to move`);
      }
      if (skippedCount > 0) {
        statusMessage.push(`${skippedCount} messages skipped due to low confidence`);
      }
      
      status.textContent = statusMessage.join('. ');
      status.className = failCount > 0 ? 'warning' : 'success';
      
    } catch (error) {
      console.error('Move error:', error);
      status.textContent = 'Error moving messages: ' + error.message;
      status.className = 'error';
    } finally {
      moveButton.disabled = false;
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
      
      // Initialize confidence variables
      const confidenceClass = message.confidence ? 
        getConfidenceClass(message.confidence) : '';
      const confidenceDisplay = message.confidence ? 
        `${message.confidence.toFixed(1)}%` : '';
      
      row.innerHTML = `
        <td><input type="checkbox" data-index="${index}"></td>
        <td class="col-date">${new Date(message.date).toLocaleDateString()}</td>
        <td class="col-from">${escapeHtml(message.author || '')}</td>
        <td class="col-subject">${escapeHtml(message.subject || '')}</td>
        <td class="col-confidence confidence-value ${confidenceClass}">${confidenceDisplay}</td>
        <td class="col-target target-folder">${message.predictedFolder || ''}</td>
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

// Refresh accounts when page becomes visible
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible') {
    await loadAccounts();
  }
});

// Initial load
async function loadAccounts() {
  const accountSelect = document.getElementById('accountSelect');
  const accounts = await browser.accounts.list();
  const background = await browser.runtime.getBackgroundPage();
  const trainedAccountIds = await background.emailArchive.getTrainedAccounts();
  
  const trainedAccounts = accounts.filter(account => trainedAccountIds.includes(account.id));
  
  if (trainedAccounts.length === 0) {
    const status = document.getElementById('status');
    status.textContent = 'No trained accounts found. Please train a model first.';
    status.className = 'error';
    accountSelect.disabled = true;
    return;
  }
  
  accountSelect.innerHTML = '';
  for (const account of trainedAccounts) {
    const option = document.createElement('option');
    option.value = account.id;
    option.textContent = account.name;
    accountSelect.appendChild(option);
  }
}

// Add column resizing
function initializeColumnResizing() {
  const table = document.querySelector('table');
  const headers = table.querySelectorAll('th');
  
  headers.forEach(header => {
    // Create resizer element
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    header.appendChild(resizer);
    let startX, startWidth;
    
    resizer.addEventListener('mousedown', e => {
      startX = e.pageX;
      startWidth = header.offsetWidth;
      
      const mouseMoveHandler = e => {
        const width = startWidth + (e.pageX - startX);
        header.style.width = `${width}px`;
      };
      
      const mouseUpHandler = () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      };
      
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const messageList = document.getElementById('messageList');
  const accountSelect = document.getElementById('accountSelect');
  const classifyButton = document.getElementById('classifyButton');
  const moveButton = document.getElementById('moveButton');
  const status = document.getElementById('status');
  const confidenceSlider = document.getElementById('confidenceSlider');
  const confidenceValue = document.getElementById('confidenceValue');
  
  // Listen for training complete message
  browser.runtime.onMessage.addListener(async (message) => {
    if (message.type === 'training-complete') {
      console.log('Training complete, refreshing accounts');
      await loadAccounts();
    }
  });
  
  // Update confidence threshold display
  confidenceSlider.addEventListener('input', () => {
    confidenceValue.textContent = confidenceSlider.value + '%';
    updateMoveButton();
  });
});