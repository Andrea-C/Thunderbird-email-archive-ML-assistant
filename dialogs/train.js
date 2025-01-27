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
  
  trainButton.addEventListener('click', async () => {
    const accountId = accountSelect.value;
    if (!accountId) {
      status.textContent = 'Please select an account';
      status.className = 'error';
      return;
    }
    
    try {
      trainButton.disabled = true;
      status.textContent = 'Training in progress...';
      status.className = '';
      
      const account = accounts.find(a => a.id === accountId);
      await browser.runtime.getBackgroundPage()
        .then(background => background.emailArchive.trainModel(account));
      
      status.textContent = 'Training completed successfully!';
      status.className = 'success';
    } catch (error) {
      status.textContent = `Error: ${error.message}`;
      status.className = 'error';
    } finally {
      trainButton.disabled = false;
    }
  });
}); 