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
    let totalFolders = selectedFolders.length;
    let processedFolders = 0;
    let totalMessages = 0;
    let processedMessages = 0;
    
    // First, get all folders for this account
    const allFolders = await browser.folders.query({
      accountId: account.id,
      hasMessages: true
    });
    
    // Create a map of folder paths to folder objects
    const folderMap = new Map();
    for (const folder of allFolders) {
      folderMap.set(folder.path, folder);
    }
    
    // First, count total messages for progress tracking
    for (const folderPath of selectedFolders) {
      // Get folder by path from our map
      const folder = folderMap.get(folderPath);
      if (!folder) {
        console.warn(`Folder not found: ${folderPath}`);
        continue;
      }
      
      // Sync folder first and notify UI
      await browser.runtime.sendMessage({
        type: 'folder-sync-start',
        folder: folderPath
      });
      
      try {
        // Get folder info to check message count
        const folderInfo = await browser.folders.getFolderInfo(folder.id);
        if (folderInfo && folderInfo.totalMessageCount) {
          totalMessages += folderInfo.totalMessageCount;
        }
      } catch (error) {
        console.warn(`Folder info warning for ${folderPath}:`, error);
      }
      
      await browser.runtime.sendMessage({
        type: 'folder-sync-complete',
        folder: folderPath
      });
    }
    
    if (totalMessages === 0) {
      throw new Error("No messages found in selected folders");
    }
    
    // Now process messages using pagination
    for (const folderPath of selectedFolders) {
      const folder = folderMap.get(folderPath);
      if (!folder) continue;
      
      processedFolders++;
      let page = await browser.messages.list(folder.id);
      
      while (page) {
        if (page.messages && Array.isArray(page.messages)) {
          for (const message of page.messages) {
            try {
              const fullText = `${message.author || ''} ${message.subject || ''} ${message.body || ''}`;
              classifier.train(fullText, folderPath);
              processedMessages++;
              
              // Send progress update
              browser.runtime.sendMessage({
                type: 'training-progress',
                folderProgress: {
                  current: processedFolders,
                  total: totalFolders,
                  currentFolder: folderPath
                },
                messageProgress: {
                  current: processedMessages,
                  total: totalMessages,
                  currentFolder: folderPath
                }
              });
            } catch (err) {
              console.error('Error processing message:', err);
            }
          }
        }
        
        // Get next page if available
        if (page.id) {
          page = await browser.messages.continueList(page.id);
        } else {
          page = null;
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

// Helper function to check if folder is a default folder
function isDefaultFolder(folder) {
  const systemFolders = ['Inbox', 'Sent', 'Drafts', 'Trash', 'Templates', 'Archives', 'Junk'];
  return systemFolders.includes(folder.name);
}

// Helper function to get all folders recursively
async function getAllFolders(account) {
  const rootFolder = account.rootFolder;
  const allFolders = [];
  
  async function processFolder(folder, level = 0) {
    allFolders.push({
      ...folder,
      level,
      isDefault: isDefaultFolder(folder)
    });
    
    if (folder.subFolders) {
      for (const subFolder of folder.subFolders) {
        await processFolder(subFolder, level + 1);
      }
    }
  }
  
  await processFolder(rootFolder);
  return allFolders;
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
  isDefaultFolder,
  getAllFolders,
  getTrainedAccounts,
  getSavedFolders,
  deleteModel
}; 