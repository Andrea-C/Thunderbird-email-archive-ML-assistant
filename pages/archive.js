let currentAccount = null;
let currentAlgorithm = null;  // Currently selected algorithm
let messages = [];
let currentSort = { column: 'date', direction: 'desc' };
let availableFolders = []; // Folders available for selection

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

// ============================================================================
// EMAIL PREVIEW FEATURE
// ============================================================================

// Fetch email body with simple caching
async function getEmailBody(message) {
  // Check cache
  if (message.bodyText !== undefined) return message.bodyText;
  
  try {
    const fullMessage = await browser.messages.getFull(message.id);
    const body = extractBodyText(fullMessage);
    message.bodyText = body; // Cache it
    return body;
  } catch (error) {
    console.error('Error fetching email body:', error);
    return '(Unable to load email content)';
  }
}

// Extract plain text from message parts
function extractBodyText(fullMessage) {
  if (!fullMessage || !fullMessage.parts) return '';
  
  let plainText = '';
  let htmlText = '';
  
  function extractFromParts(parts) {
    for (const part of parts) {
      if (part.contentType === 'text/plain' && part.body) {
        plainText += part.body + ' ';
      } else if (part.contentType === 'text/html' && part.body) {
        htmlText += part.body + ' ';
      }
      if (part.parts) {
        extractFromParts(part.parts);
      }
    }
  }
  
  extractFromParts(fullMessage.parts);
  
  // Prefer plain text, fall back to stripped HTML
  if (plainText.trim()) {
    return plainText.trim();
  } else if (htmlText.trim()) {
    return stripHtml(htmlText);
  }
  return '';
}

// Strip HTML tags to get plain text
function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  // Remove script and style elements
  div.querySelectorAll('script, style').forEach(el => el.remove());
  return (div.textContent || div.innerText || '').trim();
}

// Truncate text for preview
function truncateText(text, maxLength = 500) {
  if (!text) return '(No content)';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength) + '...';
}

// Create and show preview tooltip
let previewTooltip = null;

function createPreviewTooltip() {
  if (previewTooltip) return previewTooltip;
  
  previewTooltip = document.createElement('div');
  previewTooltip.className = 'email-preview-tooltip';
  previewTooltip.style.display = 'none';
  document.body.appendChild(previewTooltip);
  
  return previewTooltip;
}

async function showPreviewTooltip(message, anchorElement) {
  const tooltip = createPreviewTooltip();
  
  // Get email body (cached or fetch)
  const body = await getEmailBody(message);
  const preview = truncateText(body);
  
  // Set content
  tooltip.textContent = preview;
  tooltip.style.display = 'block';
  
  // Position tooltip
  const rect = anchorElement.getBoundingClientRect();
  const tooltipWidth = 450;
  const tooltipMaxHeight = 350;
  
  // Position below the icon, aligned left
  let left = rect.left;
  let top = rect.bottom + 5;
  
  // Adjust if goes off right edge
  if (left + tooltipWidth > window.innerWidth) {
    left = window.innerWidth - tooltipWidth - 10;
  }
  
  // Adjust if goes off bottom edge
  if (top + tooltipMaxHeight > window.innerHeight) {
    top = rect.top - tooltipMaxHeight - 5;
  }
  
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}

function hidePreviewTooltip() {
  if (previewTooltip) {
    previewTooltip.style.display = 'none';
  }
}

// ============================================================================
// END EMAIL PREVIEW FEATURE
// ============================================================================

// Load available algorithms for the current account
async function loadAvailableAlgorithms() {
  const algorithmSelect = document.getElementById('algorithmSelect');
  
  if (!currentAccount) {
    algorithmSelect.innerHTML = '<option value="">Select Algorithm</option>';
    algorithmSelect.disabled = true;
    currentAlgorithm = null;
    return;
  }
  
  try {
    const background = await browser.runtime.getBackgroundPage();
    const algorithms = await background.emailArchive.getAvailableModels(currentAccount.id);
    
    algorithmSelect.innerHTML = '';
    
    if (algorithms.length === 0) {
      algorithmSelect.innerHTML = '<option value="">No models trained</option>';
      algorithmSelect.disabled = true;
      currentAlgorithm = null;
      return;
    }
    
    // Add options for each available algorithm
    for (const algo of algorithms) {
      const option = document.createElement('option');
      option.value = algo;
      option.textContent = getAlgorithmDisplayName(algo);
      algorithmSelect.appendChild(option);
    }
    
    algorithmSelect.disabled = false;
    
    // Select first algorithm by default
    currentAlgorithm = algorithms[0];
    algorithmSelect.value = currentAlgorithm;
    
  } catch (error) {
    console.error('Error loading available algorithms:', error);
    console.error('Error stack:', error.stack);
    algorithmSelect.innerHTML = `<option value="">Error: ${error.message}</option>`;
    algorithmSelect.disabled = true;
    currentAlgorithm = null;
  }
}

// Helper function to get confidence class
function getConfidenceClass(confidence) {
  if (confidence >= 80) return 'confidence-high';
  if (confidence >= 50) return 'confidence-medium';
  return 'confidence-low';
}

// Get current confidence threshold value
function getConfidenceThreshold() {
  const slider = document.getElementById('confidenceSlider');
  return slider ? parseInt(slider.value) : 50;
}

// Load available folders for the current account
async function loadAvailableFolders() {
  if (!currentAccount) {
    availableFolders = [];
    return;
  }
  
  try {
    const background = await browser.runtime.getBackgroundPage();
    const savedFolders = await background.emailArchive.getSavedFolders(currentAccount.id);
    
    if (savedFolders && Array.isArray(savedFolders)) {
      // Extract folder paths from saved structure
      availableFolders = savedFolders
        .filter(f => f.selected !== false) // Only include selected folders
        .map(f => f.path || f)
        .sort((a, b) => a.localeCompare(b));
    } else {
      availableFolders = [];
    }
  } catch (error) {
    console.error('Error loading available folders:', error);
    availableFolders = [];
  }
}

// Create folder dropdown element
function createFolderDropdown(messageIndex, currentFolder) {
  const container = document.createElement('div');
  container.className = 'folder-dropdown-container';
  
  // Input field for search/display
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'folder-dropdown-input';
  input.value = currentFolder || '';
  input.placeholder = 'Type to search folders...';
  
  // Dropdown list (appended to body for fixed positioning)
  const dropdown = document.createElement('div');
  dropdown.className = 'folder-dropdown-list';
  dropdown.style.display = 'none';
  document.body.appendChild(dropdown);
  
  // Populate dropdown with filtered folders
  function populateDropdown(filter = '') {
    dropdown.innerHTML = '';
    const filterLower = filter.toLowerCase();
    
    const filteredFolders = availableFolders.filter(folder => 
      folder.toLowerCase().includes(filterLower)
    );
    
    if (filteredFolders.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'folder-dropdown-item no-results';
      noResults.textContent = 'No folders found';
      dropdown.appendChild(noResults);
      return;
    }
    
    filteredFolders.forEach(folder => {
      const item = document.createElement('div');
      item.className = 'folder-dropdown-item';
      item.textContent = folder;
      item.dataset.folder = folder;
      
      // Highlight matching text
      if (filter) {
        const matchIndex = folder.toLowerCase().indexOf(filterLower);
        if (matchIndex >= 0) {
          item.innerHTML = 
            escapeHtml(folder.substring(0, matchIndex)) +
            '<strong>' + escapeHtml(folder.substring(matchIndex, matchIndex + filter.length)) + '</strong>' +
            escapeHtml(folder.substring(matchIndex + filter.length));
        }
      }
      
      item.addEventListener('click', () => {
        selectFolder(messageIndex, folder);
        closeAllDropdowns();
      });
      
      dropdown.appendChild(item);
    });
  }
  
  // Position dropdown using fixed coordinates (to escape table overflow)
  function positionDropdown() {
    const rect = input.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + 2) + 'px';
    dropdown.style.left = rect.left + 'px';
    dropdown.style.width = Math.max(rect.width, 250) + 'px';
    
    // Check if dropdown would go off-screen at bottom
    const dropdownHeight = Math.min(300, dropdown.scrollHeight);
    if (rect.bottom + dropdownHeight > window.innerHeight) {
      // Position above the input instead
      dropdown.style.top = (rect.top - dropdownHeight - 2) + 'px';
    }
  }
  
  // Initial population
  populateDropdown();
  
  // Filter on input
  input.addEventListener('input', () => {
    populateDropdown(input.value);
    dropdown.style.display = 'block';
    positionDropdown();
  });
  
  // Show dropdown on focus
  input.addEventListener('focus', () => {
    populateDropdown(input.value);
    dropdown.style.display = 'block';
    positionDropdown();
  });
  
  // Keyboard navigation
  let selectedIndex = -1;
  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.folder-dropdown-item:not(.no-results)');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        selectFolder(messageIndex, items[selectedIndex].dataset.folder);
        closeAllDropdowns();
      }
    } else if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });
  
  function updateSelection(items) {
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === selectedIndex);
    });
    if (selectedIndex >= 0 && items[selectedIndex]) {
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }
  
  container.appendChild(input);
  // Note: dropdown is appended to body, not container
  
  // Store reference to dropdown for cleanup
  container.dropdown = dropdown;
  
  return container;
}

// Select a folder for a message
function selectFolder(messageIndex, folderPath) {
  const message = messages[messageIndex];
  if (!message) return;
  
  // Update the message object
  message.predictedFolder = folderPath;
  message.manuallySet = true; // Flag to indicate manual override
  
  // If no confidence was set (manually setting before classification), set a placeholder
  if (message.confidence === undefined) {
    message.confidence = 100; // Manual selection = 100% confidence
  }
  
  // Save current selections before updating table
  const selectedIds = new Set();
  document.querySelectorAll('#messageList input[type="checkbox"]:checked').forEach(cb => {
    const row = cb.closest('tr');
    if (row && row.dataset.messageId) {
      selectedIds.add(parseInt(row.dataset.messageId));
    }
  });
  
  // Update the table, preserving selections
  updateTable(selectedIds);
  updateMoveButton();
}

// Close all open dropdowns
function closeAllDropdowns() {
  // Remove all dropdown lists from body
  document.querySelectorAll('body > .folder-dropdown-list').forEach(dropdown => {
    dropdown.remove();
  });
  
  document.querySelectorAll('.folder-dropdown-container').forEach(container => {
    // Clean up dropdown reference if it exists
    if (container.dropdown) {
      container.dropdown.remove();
    }
    
    const cell = container.closest('.target-folder');
    if (cell) {
      const messageIndex = parseInt(container.closest('tr').querySelector('input[type="checkbox"]').dataset.index);
      const message = messages[messageIndex];
      restoreTargetFolderCell(cell, messageIndex, message);
    }
  });
}

// Restore target folder cell to display mode
function restoreTargetFolderCell(cell, messageIndex, message) {
  const confidenceThreshold = getConfidenceThreshold();
  const lowConfidenceClass = (message.confidence !== undefined && message.confidence < confidenceThreshold) 
    ? 'low-confidence' : '';
  const manualClass = message.manuallySet ? 'manually-set' : '';
  
  cell.innerHTML = '';
  cell.className = `col-target target-folder ${lowConfidenceClass} ${manualClass}`;
  
  const display = document.createElement('span');
  display.className = 'target-folder-display';
  display.textContent = message.predictedFolder || '';
  display.title = message.manuallySet ? 'Manually set (click to change)' : 'Click to change';
  
  cell.appendChild(display);
  
  // Re-add click handler
  cell.addEventListener('click', (e) => {
    if (e.target.closest('.folder-dropdown-container')) return;
    activateTargetFolderEdit(cell, messageIndex);
  }, { once: true });
}

// Activate edit mode on target folder cell
function activateTargetFolderEdit(cell, messageIndex) {
  // Close any other open dropdowns first
  closeAllDropdowns();
  
  const message = messages[messageIndex];
  const currentFolder = message.predictedFolder || '';
  
  // Replace cell content with dropdown
  cell.innerHTML = '';
  const dropdown = createFolderDropdown(messageIndex, currentFolder);
  cell.appendChild(dropdown);
  
  // Focus the input
  const input = dropdown.querySelector('.folder-dropdown-input');
  input.focus();
  input.select();
  
  // Close dropdown when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeHandler(e) {
      if (!cell.contains(e.target)) {
        closeAllDropdowns();
        document.removeEventListener('click', closeHandler);
      }
    });
  }, 0);
}

// Update target folder styling based on confidence threshold
function updateTargetFolderStyling() {
  const confidenceThreshold = getConfidenceThreshold();
  const rows = document.getElementById('messageList').getElementsByTagName('tr');
  
  for (let i = 0; i < rows.length; i++) {
    const message = messages[i];
    if (!message || message.confidence === undefined) continue;
    
    const targetCell = rows[i].querySelector('.target-folder');
    if (targetCell) {
      if (message.confidence < confidenceThreshold) {
        targetCell.classList.add('low-confidence');
      } else {
        targetCell.classList.remove('low-confidence');
      }
    }
  }
}

// Sort messages function - preserves selection state
function sortMessages(field, ascending = true) {
  // Save current selection state before sorting
  const selectedIds = new Set();
  const checkboxes = document.getElementById('messageList').querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox, index) => {
    if (checkbox.checked && messages[index]) {
      selectedIds.add(messages[index].id);
    }
  });
  
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
  
  // Update table and restore selection
  updateTable(selectedIds);
}

// Update table display - optionally restore selection from provided set
function updateTable(selectedIds = null) {
  const messageList = document.getElementById('messageList');
  const confidenceThreshold = getConfidenceThreshold();
  messageList.innerHTML = '';
  
  messages.forEach((message, index) => {
    const row = document.createElement('tr');
    row.dataset.messageId = message.id;
    
    const confidenceClass = message.confidence ? 
      getConfidenceClass(message.confidence) : '';
    const confidenceDisplay = message.confidence ? 
      `${message.confidence.toFixed(1)}%` : '';
    
    // Check if this message was previously selected
    const isSelected = selectedIds ? selectedIds.has(message.id) : false;
    
    // Check if target folder should show low confidence styling
    const lowConfidenceClass = (message.confidence !== undefined && message.confidence < confidenceThreshold) 
      ? 'low-confidence' : '';
    
    // Check if manually set
    const manualClass = message.manuallySet ? 'manually-set' : '';
    
    row.innerHTML = `
      <td><input type="checkbox" data-index="${index}" ${isSelected ? 'checked' : ''}></td>
      <td class="col-confidence confidence-value ${confidenceClass}">${confidenceDisplay}</td>
      <td class="col-target target-folder ${lowConfidenceClass} ${manualClass}">
        <span class="target-folder-display" title="${message.manuallySet ? 'Manually set (click to change)' : 'Click to change'}">${message.predictedFolder || ''}</span>
      </td>
      <td class="col-from">${escapeHtml(message.author || '')}</td>
      <td class="col-subject"><span class="preview-icon" data-index="${index}">👁</span> ${escapeHtml(message.subject || '')}</td>
      <td class="col-date">${new Date(message.date).toLocaleDateString()}</td>
    `;
    
    messageList.appendChild(row);
  });
  
  // Add preview icon hover listeners
  const previewIcons = messageList.querySelectorAll('.preview-icon');
  previewIcons.forEach(icon => {
    const index = parseInt(icon.dataset.index);
    const message = messages[index];
    
    icon.addEventListener('mouseenter', () => {
      showPreviewTooltip(message, icon);
    });
    
    icon.addEventListener('mouseleave', () => {
      hidePreviewTooltip();
    });
  });
  
  // Add change listeners to checkboxes
  const checkboxes = messageList.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateMoveButton();
      updateSelectAllState();
    });
  });
  
  // Add click listeners to target folder cells
  const targetCells = messageList.querySelectorAll('.target-folder');
  targetCells.forEach((cell, index) => {
    cell.style.cursor = 'pointer';
    cell.addEventListener('click', (e) => {
      if (e.target.closest('.folder-dropdown-container')) return;
      activateTargetFolderEdit(cell, index);
    }, { once: true });
  });
  
  // Update select all checkbox state
  updateSelectAllState();
  
  // Initialize resizing after table is created
  initializeColumnResizing();
}

// Update the "select all" checkbox state based on individual checkboxes
function updateSelectAllState() {
  const messageList = document.getElementById('messageList');
  const selectAll = document.getElementById('selectAll');
  const checkboxes = messageList.querySelectorAll('input[type="checkbox"]');
  
  if (checkboxes.length === 0) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
    return;
  }
  
  const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
  
  if (checkedCount === 0) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  } else if (checkedCount === checkboxes.length) {
    selectAll.checked = true;
    selectAll.indeterminate = false;
  } else {
    selectAll.checked = false;
    selectAll.indeterminate = true;
  }
}

// Load accounts and check for trained models - defined at module scope
async function loadAccounts() {
  const accountSelect = document.getElementById('accountSelect');
  const refreshButton = document.getElementById('refreshAccounts');
  const classifyButton = document.getElementById('classifyButton');
  const moveButton = document.getElementById('moveButton');
  const messageList = document.getElementById('messageList');
  const status = document.getElementById('status');
  
  try {
    refreshButton.disabled = true;
    refreshButton.textContent = '⌛'; // Show loading state
    
    const background = await browser.runtime.getBackgroundPage();
    const accounts = await browser.accounts.list();
    const trainedAccounts = await background.emailArchive.getTrainedAccounts();
    
    // Clear and populate account select
    accountSelect.innerHTML = '<option value="">Select Account</option>';
    
    for (const account of accounts) {
      // Only show accounts that have trained models
      if (trainedAccounts.includes(account.id)) {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = account.name;
        accountSelect.appendChild(option);
      }
    }
    
    // If we have a current account and it's still trained, keep it selected
    if (currentAccount && trainedAccounts.includes(currentAccount.id)) {
      accountSelect.value = currentAccount.id;
    } else {
      currentAccount = null;
      accountSelect.value = '';
    }
    
    // Update UI state
    classifyButton.disabled = !currentAccount;
    moveButton.disabled = true;
    
    // Clear message list if no account selected
    if (!currentAccount) {
      messageList.innerHTML = '<tr><td colspan="6">Please select an account</td></tr>';
      status.textContent = '';
    }
    
  } catch (error) {
    console.error('Error loading accounts:', error);
    status.textContent = 'Error loading accounts: ' + error.message;
    status.className = 'error';
    currentAccount = null;
    classifyButton.disabled = true;
    moveButton.disabled = true;
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = '↻'; // Reset button state
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const messageList = document.getElementById('messageList');
  const accountSelect = document.getElementById('accountSelect');
  const algorithmSelect = document.getElementById('algorithmSelect');
  const refreshButton = document.getElementById('refreshAccounts');
  const classifyButton = document.getElementById('classifyButton');
  const moveButton = document.getElementById('moveButton');
  const selectAll = document.getElementById('selectAll');
  const status = document.getElementById('status');
  const confidenceSlider = document.getElementById('confidenceSlider');
  const confidenceValue = document.getElementById('confidenceValue');
  
  // Load accounts initially
  await loadAccounts();

  // Add refresh button handler
  refreshButton.addEventListener('click', async () => {
    await loadAccounts();
    status.textContent = 'Account list refreshed';
    status.className = 'success';
  });

  // Account selection handler
  accountSelect.addEventListener('change', async () => {
    const accountId = accountSelect.value;
    if (!accountId) {
      currentAccount = null;
      currentAlgorithm = null;
      availableFolders = [];
      algorithmSelect.innerHTML = '<option value="">Select Algorithm</option>';
      algorithmSelect.disabled = true;
      return;
    }
    
    try {
      const accounts = await browser.accounts.list();
      currentAccount = accounts.find(a => a.id === accountId);
      
      if (!currentAccount) {
        throw new Error('Selected account not found');
      }
      
      // Load available algorithms for this account
      await loadAvailableAlgorithms();
      
      // Load available folders for the dropdown
      await loadAvailableFolders();
      
      classifyButton.disabled = !currentAlgorithm;
      moveButton.disabled = true;
      await loadInboxMessages();
      
    } catch (error) {
      console.error('Error selecting account:', error);
      status.textContent = 'Error selecting account: ' + error.message;
      status.className = 'error';
      currentAccount = null;
      currentAlgorithm = null;
      classifyButton.disabled = true;
      moveButton.disabled = true;
    }
  });
  
  // Algorithm selection handler
  algorithmSelect.addEventListener('change', () => {
    currentAlgorithm = algorithmSelect.value || null;
    classifyButton.disabled = !currentAlgorithm;
    status.textContent = currentAlgorithm 
      ? `Selected algorithm: ${getAlgorithmDisplayName(currentAlgorithm)}`
      : '';
    status.className = currentAlgorithm ? 'success' : '';
  });
  
  // Select all checkbox handler
  selectAll.addEventListener('change', () => {
    const checkboxes = messageList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = selectAll.checked);
    updateMoveButton();
  });
  
  // Update confidence value display and target folder styling
  confidenceSlider.addEventListener('input', () => {
    confidenceValue.textContent = `${confidenceSlider.value}%`;
    // Dynamically update target folder styling based on new threshold
    updateTargetFolderStyling();
    updateMoveButton();
  });
  
  // Add sort handlers
  const headers = document.querySelectorAll('th[data-sort]');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const field = header.dataset.sort;
      const ascending = header.dataset.order !== 'asc';
      
      // Update sort indicators
      headers.forEach(h => {
        h.classList.remove('sort-asc', 'sort-desc');
        h.dataset.order = h === header ? (ascending ? 'asc' : 'desc') : '';
        if (h === header) {
          h.classList.add(ascending ? 'sort-asc' : 'sort-desc');
        }
      });
      
      sortMessages(field, ascending);
    });
  });
  
  // Handle classify button click
  classifyButton.addEventListener('click', async () => {
    if (!currentAccount) return;
    if (!currentAlgorithm) {
      status.textContent = 'Please select an algorithm';
      status.className = 'warning';
      return;
    }
    
    const background = await browser.runtime.getBackgroundPage();
    const confidenceThreshold = getConfidenceThreshold();
    const rows = messageList.getElementsByTagName('tr');
    
    try {
      status.textContent = `Classifying messages using ${getAlgorithmDisplayName(currentAlgorithm)}...`;
      status.className = '';
      classifyButton.disabled = true;
      moveButton.disabled = true;
      
      // Get selected messages
      const selectedCheckboxes = messageList.querySelectorAll('input[type="checkbox"]:checked');
      if (selectedCheckboxes.length === 0) {
        status.textContent = 'Please select messages to classify';
        status.className = 'warning';
        classifyButton.disabled = false;
        return;
      }
      
      // Verify trained model exists for selected algorithm
      const availableAlgorithms = await background.emailArchive.getAvailableModels(currentAccount.id);
      if (!availableAlgorithms.includes(currentAlgorithm)) {
        throw new Error(`No ${getAlgorithmDisplayName(currentAlgorithm)} model found for this account`);
      }
      
      // Classify selected messages using the selected algorithm
      for (let index = 0; index < messages.length; index++) {
        const checkbox = rows[index].querySelector('input[type="checkbox"]');
        if (!checkbox || !checkbox.checked) continue;
        
        const message = messages[index];
        
        // Skip if manually set - don't overwrite user's choice
        if (message.manuallySet) continue;
        
        try {
          // Pass the selected algorithm to classifyMessage
          const prediction = await background.emailArchive.classifyMessage(message, currentAccount.id, currentAlgorithm);
          
          // Store the prediction in the message object
          message.predictedFolder = prediction.folder;
          message.confidence = prediction.confidence;
          message.manuallySet = false;
          
          // Update the UI
          const targetCell = rows[index].querySelector('.target-folder');
          const confidenceCell = rows[index].querySelector('.confidence-value');
          
          // Update target folder display
          const displaySpan = targetCell.querySelector('.target-folder-display');
          if (displaySpan) {
            displaySpan.textContent = prediction.folder;
          } else {
            targetCell.innerHTML = `<span class="target-folder-display" title="Click to change">${prediction.folder}</span>`;
          }
          
          confidenceCell.textContent = `${prediction.confidence.toFixed(1)}%`;
          confidenceCell.className = `col-confidence confidence-value ${getConfidenceClass(prediction.confidence)}`;
          
          targetCell.classList.remove('manually-set');
          if (prediction.confidence < confidenceThreshold) {
            targetCell.classList.add('low-confidence');
          } else {
            targetCell.classList.remove('low-confidence');
          }
        } catch (error) {
          console.error(`Error classifying message ${message.id}:`, error);
          const targetCell = rows[index].querySelector('.target-folder');
          targetCell.innerHTML = '<span class="target-folder-display">Classification failed</span>';
          targetCell.classList.add('error');
        }
      }
      
      status.textContent = 'Classification complete.';
      status.className = 'success';
      moveButton.disabled = false;
      
    } catch (error) {
      console.error('Classification error:', error);
      status.textContent = 'Error classifying messages: ' + error.message;
      status.className = 'error';
    } finally {
      classifyButton.disabled = false;
    }
  });
  
  // Handle move button
  moveButton.addEventListener('click', async () => {
    if (!currentAccount) return;
    
    const confidenceThreshold = getConfidenceThreshold();
    const checkboxes = messageList.querySelectorAll('input[type="checkbox"]');
    
    // For manually set folders, always include them (they have 100% "confidence")
    // For ML-predicted folders, check against threshold
    const selectedMessages = Array.from(checkboxes)
      .map((checkbox, index) => checkbox.checked ? messages[index] : null)
      .filter(message => {
        if (!message || !message.predictedFolder) return false;
        // Always include manually set folders
        if (message.manuallySet) return true;
        // For ML predictions, check threshold
        return message.confidence >= confidenceThreshold;
      });
    
    if (selectedMessages.length === 0) {
      status.textContent = 'No messages selected with target folder set.';
      status.className = 'error';
      return;
    }

    const totalSelected = Array.from(checkboxes).filter(cb => cb.checked).length;
    const skippedCount = totalSelected - selectedMessages.length;
    
    status.textContent = 'Moving messages...';
    status.className = '';
    moveButton.disabled = true;
    
    try {
      const background = await browser.runtime.getBackgroundPage();
      const results = await background.emailArchive.moveMessages(currentAccount.id, selectedMessages);
      await loadInboxMessages();
      
      // Process results
      let successCount = results.reduce((sum, r) => sum + (r.success ? r.count : 0), 0);
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
        statusMessage.push(`${skippedCount} messages skipped (no folder or low confidence)`);
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
  
  // Listen for training complete message
  browser.runtime.onMessage.addListener(async (message) => {
    if (message.type === 'training-complete') {
      console.log('Training complete, refreshing accounts');
      await loadAccounts();
    }
  });
});

// Load inbox messages for selected account
async function loadInboxMessages() {
  const messageList = document.getElementById('messageList');
  const status = document.getElementById('status');
  const confidenceThreshold = getConfidenceThreshold();
  
  if (!currentAccount) {
    messageList.innerHTML = '<tr><td colspan="6">Please select an account</td></tr>';
    status.textContent = 'No account selected';
    status.className = 'warning';
    return;
  }
  
  try {
    status.textContent = 'Loading messages...';
    status.className = '';
    messageList.innerHTML = '';
    messages = [];
    
    // Ensure folders are loaded
    if (availableFolders.length === 0) {
      await loadAvailableFolders();
    }
    
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
      messageList.innerHTML = '<tr><td colspan="6">No messages in Inbox</td></tr>';
      status.textContent = 'Inbox is empty';
      status.className = 'warning';
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
      messageList.innerHTML = '<tr><td colspan="6">No messages in Inbox</td></tr>';
      status.textContent = 'Inbox is empty';
      status.className = 'warning';
      return;
    }
    
    // Sort by date descending (most recent first) by default
    messages.sort((a, b) => new Date(b.date) - new Date(a.date));
    
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
      
      // Check if target folder should show low confidence styling
      const lowConfidenceClass = (message.confidence !== undefined && message.confidence < confidenceThreshold) 
        ? 'low-confidence' : '';
      
      // Check if manually set
      const manualClass = message.manuallySet ? 'manually-set' : '';
      
      row.innerHTML = `
        <td><input type="checkbox" data-index="${index}"></td>
        <td class="col-confidence confidence-value ${confidenceClass}">${confidenceDisplay}</td>
        <td class="col-target target-folder ${lowConfidenceClass} ${manualClass}">
          <span class="target-folder-display" title="Click to change">${message.predictedFolder || ''}</span>
        </td>
        <td class="col-from">${escapeHtml(message.author || '')}</td>
        <td class="col-subject"><span class="preview-icon" data-index="${index}">👁</span> ${escapeHtml(message.subject || '')}</td>
        <td class="col-date">${new Date(message.date).toLocaleDateString()}</td>
      `;
      
      messageList.appendChild(row);
    });
    
    // Add preview icon hover listeners
    const previewIcons = messageList.querySelectorAll('.preview-icon');
    previewIcons.forEach(icon => {
      const index = parseInt(icon.dataset.index);
      const message = messages[index];
      
      icon.addEventListener('mouseenter', () => {
        showPreviewTooltip(message, icon);
      });
      
      icon.addEventListener('mouseleave', () => {
        hidePreviewTooltip();
      });
    });
    
    // Add change listeners to checkboxes
    const checkboxes = messageList.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        updateMoveButton();
        updateSelectAllState();
      });
    });
    
    // Add click listeners to target folder cells
    const targetCells = messageList.querySelectorAll('.target-folder');
    targetCells.forEach((cell, index) => {
      cell.style.cursor = 'pointer';
      cell.addEventListener('click', (e) => {
        if (e.target.closest('.folder-dropdown-container')) return;
        activateTargetFolderEdit(cell, index);
      }, { once: true });
    });
    
    // Update status
    status.textContent = `Loaded ${messages.length} messages from Inbox`;
    status.className = 'success';
    
  } catch (error) {
    console.error('Error loading messages:', error);
    messageList.innerHTML = '<tr><td colspan="6">Error loading messages</td></tr>';
    status.textContent = `Error: ${error.message}`;
    status.className = 'error';
  }
}

// Update move button state
function updateMoveButton() {
  const moveButton = document.getElementById('moveButton');
  const hasTarget = document.querySelector('.target-folder .target-folder-display:not(:empty)');
  const hasSelected = document.querySelector('#messageList input[type="checkbox"]:checked');
  moveButton.disabled = !(hasTarget && hasSelected);
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

// Add column resizing
function initializeColumnResizing() {
  const table = document.querySelector('table');
  const headers = table.querySelectorAll('th');
  
  headers.forEach(header => {
    // Remove existing resizers to avoid duplicates
    const existingResizer = header.querySelector('.resizer');
    if (existingResizer) {
      existingResizer.remove();
    }
    
    // Create resizer element
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    header.appendChild(resizer);
    let startX, startWidth;
    
    resizer.addEventListener('pointerdown', e => {
      startX = e.pageX;
      startWidth = header.offsetWidth;
      
      // Set pointer capture to track pointer movements even outside the element
      resizer.setPointerCapture(e.pointerId);
      
      const pointerMoveHandler = e => {
        if (e.buttons === 0) {
          // Button was released outside the window
          cleanup();
          return;
        }
        const width = startWidth + (e.pageX - startX);
        header.style.width = `${width}px`;
      };
      
      const cleanup = () => {
        resizer.removeEventListener('pointermove', pointerMoveHandler);
        resizer.removeEventListener('pointerup', pointerUpHandler);
        if (resizer.hasPointerCapture(e.pointerId)) {
          resizer.releasePointerCapture(e.pointerId);
        }
      };
      
      const pointerUpHandler = () => {
        cleanup();
      };
      
      resizer.addEventListener('pointermove', pointerMoveHandler);
      resizer.addEventListener('pointerup', pointerUpHandler);
      resizer.addEventListener('pointercancel', cleanup);
    });
  });
}
