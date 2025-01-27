document.addEventListener('DOMContentLoaded', async () => {
  const accountSelect = document.getElementById('accountSelect');
  const trainButton = document.getElementById('trainButton');
  const status = document.getElementById('status');
  
  // Load accounts
  const accounts = await browser.accounts.list();
  for (const account of accounts) {
    const option = document.createElement('option');
    option.value = account.id;
    option.textContent = account.name;
    accountSelect.appendChild(option);
  }
  
  // Listen for progress updates
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'training-progress') {
      status.textContent = `Training in progress: ${message.progress}%`;
      status.className = '';
    }
  });
  
  trainButton.addEventListener('click', async () => {
    const accountId = accountSelect.value;
    if (!accountId) {
      status.textContent = 'Please select an account';
      status.className = 'error';
      return;
    }
    
    try {
      trainButton.disabled = true;
      accountSelect.disabled = true;
      status.textContent = 'Analyzing folders...';
      status.className = '';
      
      const account = accounts.find(a => a.id === accountId);
      const result = await browser.runtime.getBackgroundPage()
        .then(background => background.emailArchive.trainModel(account));
      
      if (result.success) {
        status.textContent = `Training completed successfully! Processed ${result.messagesProcessed} messages.`;
        status.className = 'success';
      } else {
        throw new Error('Training failed');
      }
    } catch (error) {
      status.textContent = `Error: ${error.message}`;
      status.className = 'error';
    } finally {
      trainButton.disabled = false;
      accountSelect.disabled = false;
    }
  });
}); 