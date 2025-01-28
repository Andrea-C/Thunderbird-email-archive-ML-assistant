// Menu creation
browser.menus.create({
  id: "train-model",
  title: "Archive Model Training",
  contexts: ["tools_menu"]
});

browser.menus.create({
  id: "archive-emails",
  title: "E-mail Archive",
  contexts: ["tools_menu"]
});

// Menu click handlers
browser.menus.onClicked.addListener(async (info) => {
  if (info.menuItemId === "train-model") {
    await openTrainingDialog();
  } else if (info.menuItemId === "archive-emails") {
    await openArchiveTab();
  }
});

// Simple Naive Bayes implementation for text classification
class NaiveBayesClassifier {
  constructor() {
    this.wordCounts = {};
    this.folderCounts = {};
    this.totalDocs = 0;
  }

  // Tokenize text into words
  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  // Train the classifier with a document and its folder
  train(text, folder) {
    const words = this.tokenize(text);
    
    if (!this.wordCounts[folder]) {
      this.wordCounts[folder] = {};
      this.folderCounts[folder] = 0;
    }
    
    this.folderCounts[folder]++;
    this.totalDocs++;
    
    for (const word of words) {
      this.wordCounts[folder][word] = (this.wordCounts[folder][word] || 0) + 1;
    }
  }

  // Predict the most likely folder for a document
  predict(text) {
    const words = this.tokenize(text);
    let bestFolder = null;
    let bestScore = -Infinity;
    
    for (const folder in this.folderCounts) {
      let score = Math.log(this.folderCounts[folder] / this.totalDocs);
      
      for (const word of words) {
        const wordCount = this.wordCounts[folder][word] || 0;
        const totalWords = Object.values(this.wordCounts[folder]).reduce((a, b) => a + b, 0);
        score += Math.log((wordCount + 1) / (totalWords + Object.keys(this.wordCounts[folder]).length));
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestFolder = folder;
      }
    }
    
    return bestFolder;
  }
}

// Global classifier instance
let classifier = new NaiveBayesClassifier();

// Open training dialog
async function openTrainingDialog() {
  const trainingUrl = browser.runtime.getURL("pages/train.html");
  await browser.tabs.create({
    url: trainingUrl
  });
}

// Open archive tab
async function openArchiveTab() {
  const archiveUrl = browser.runtime.getURL("pages/archive.html");
  await browser.tabs.create({
    url: archiveUrl
  });
}

// Training function
async function trainModel(account, selectedFolders) {
  try {
    classifier = new NaiveBayesClassifier();
    const folders = await browser.folders.getSubFolders(account);
    let totalFolders = selectedFolders.length;
    let processedFolders = 0;
    let totalMessages = 0;
    let processedMessages = 0;
    
    // First, count total messages for progress tracking
    for (const folder of folders) {
      if (selectedFolders.includes(folder.path)) {
        // Sync folder first
        await browser.runtime.sendMessage({
          type: 'folder-sync-start',
          folder: folder.path
        });
        
        await browser.folders.synchronizeMessages(folder);
        
        await browser.runtime.sendMessage({
          type: 'folder-sync-complete',
          folder: folder.path
        });
        
        const messages = await browser.messages.list(folder);
        if (messages && Array.isArray(messages)) {
          totalMessages += messages.length;
        }
      }
    }
    
    if (totalMessages === 0) {
      throw new Error("No messages found in selected folders");
    }
    
    // Now process messages
    for (const folder of folders) {
      if (selectedFolders.includes(folder.path)) {
        processedFolders++;
        const messages = await browser.messages.list(folder);
        
        if (messages && Array.isArray(messages)) {
          for (const message of messages) {
            try {
              const fullText = `${message.author || ''} ${message.subject || ''} ${message.body || ''}`;
              classifier.train(fullText, folder.path);
              processedMessages++;
              
              // Send progress update
              browser.runtime.sendMessage({
                type: 'training-progress',
                folderProgress: {
                  current: processedFolders,
                  total: totalFolders,
                  currentFolder: folder.path
                },
                messageProgress: {
                  current: processedMessages,
                  total: totalMessages,
                  currentFolder: folder.path
                }
              });
            } catch (err) {
              console.error('Error processing message:', err);
            }
          }
        }
      }
    }
    
    if (processedMessages === 0) {
      throw new Error("No messages could be processed");
    }
    
    // Save trained model
    await browser.storage.local.set({
      [`model_${account.id}`]: JSON.stringify(classifier)
    });
    
    // Save folder selection for future use
    await browser.storage.local.set({
      [`folders_${account.id}`]: JSON.stringify(selectedFolders)
    });
    
    // Also save the account ID in a list of trained accounts
    const trainedAccounts = await browser.storage.local.get('trainedAccounts');
    const accounts = trainedAccounts.trainedAccounts || [];
    if (!accounts.includes(account.id)) {
      accounts.push(account.id);
      await browser.storage.local.set({ trainedAccounts: accounts });
    }
    
    return { success: true, messagesProcessed: processedMessages };
  } catch (error) {
    console.error('Training error:', error);
    throw error;
  }
}

// Helper function to get trained accounts
async function getTrainedAccounts() {
  const data = await browser.storage.local.get('trainedAccounts');
  return data.trainedAccounts || [];
}

// Helper function to get saved folder selection
async function getSavedFolders(accountId) {
  const data = await browser.storage.local.get(`folders_${accountId}`);
  return data[`folders_${accountId}`] ? JSON.parse(data[`folders_${accountId}`]) : null;
}

// Helper function to delete a model
async function deleteModel(accountId) {
  await browser.storage.local.remove(`model_${accountId}`);
  await browser.storage.local.remove(`folders_${accountId}`);
  
  const trainedAccounts = await browser.storage.local.get('trainedAccounts');
  const accounts = trainedAccounts.trainedAccounts || [];
  const index = accounts.indexOf(accountId);
  if (index > -1) {
    accounts.splice(index, 1);
    await browser.storage.local.set({ trainedAccounts: accounts });
  }
}

// Helper function to check if folder is user-created
function isUserFolder(folder) {
  const systemFolders = ['Inbox', 'Sent', 'Drafts', 'Trash', 'Templates', 'Archives', 'Junk'];
  return !systemFolders.includes(folder.name);
}

// Message classification function
async function classifyMessage(message, accountId) {
  const modelData = await browser.storage.local.get(`model_${accountId}`);
  if (!modelData[`model_${accountId}`]) {
    throw new Error("No trained model found for this account");
  }
  
  classifier = Object.assign(new NaiveBayesClassifier(), JSON.parse(modelData[`model_${accountId}`]));
  const fullText = `${message.author} ${message.subject} ${message.body}`;
  return classifier.predict(fullText);
}

// Export functions for use in UI pages
window.emailArchive = {
  trainModel,
  classifyMessage,
  isUserFolder,
  getTrainedAccounts,
  getSavedFolders,
  deleteModel
}; 