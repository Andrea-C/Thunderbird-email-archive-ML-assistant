document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab');
  const frames = document.querySelectorAll('iframe');
  
  function switchTab(targetId) {
    // Hide all frames
    frames.forEach(frame => {
      frame.style.display = 'none';
    });
    
    // Remove active class from all tabs
    tabs.forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Show selected frame and activate tab
    const selectedFrame = document.getElementById(targetId + '-frame');
    const selectedTab = document.querySelector(`[data-target="${targetId}"]`);
    
    if (selectedFrame && selectedTab) {
      selectedFrame.style.display = 'block';
      selectedTab.classList.add('active');
    }
  }
  
  // Add click handlers to tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const targetId = tab.dataset.target;
      switchTab(targetId);
    });
  });
  
  // Show first tab by default
  if (tabs.length > 0) {
    switchTab(tabs[0].dataset.target);
  }
}); 