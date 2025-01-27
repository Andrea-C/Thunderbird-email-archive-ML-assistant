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
  const accounts = await browser.accounts.list();
  // Create and open training dialog
  const dialogUrl = browser.runtime.getURL("dialogs/train.html");
  await browser.windows.create({
    url: dialogUrl,
    type: "popup",
    width: 400,
    height: 600
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
async function trainModel(account) {
  classifier = new NaiveBayesClassifier();
  const folders = await browser.folders.getSubFolders(account);
  
  for (const folder of folders) {
    if (isUserFolder(folder)) {
      const messages = await browser.messages.list(folder);
      for (const message of messages) {
        const fullText = `${message.author} ${message.subject} ${message.body}`;
        classifier.train(fullText, folder.path);
      }
    }
  }
  
  // Save trained model
  await browser.storage.local.set({
    [`model_${account.id}`]: JSON.stringify(classifier)
  });
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
  isUserFolder
}; 