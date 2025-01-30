// Menu creation
browser.menus.create({
  id: "email-archive-assistant",
  title: "Email Archive ML Assistant",
  contexts: ["tools_menu"]
});

// Menu click handlers
browser.menus.onClicked.addListener(async (info) => {
  if (info.menuItemId === "email-archive-assistant") {
    await openAssistant();
  }
});

// Simple Naive Bayes implementation for text classification
class NaiveBayesClassifier {
  constructor() {
    this.wordCounts = {};
    this.folderCounts = {};
    this.totalDocs = 0;
    this.vocabulary = new Set();
    this.folderTotalWords = {};
  }

  // Add method to convert classifier to JSON-friendly format
  toJSON() {
    return {
      wordCounts: this.wordCounts,
      folderCounts: this.folderCounts,
      totalDocs: this.totalDocs,
      vocabulary: Array.from(this.vocabulary),
      folderTotalWords: this.folderTotalWords
    };
  }

  // Add method to restore classifier from JSON
  static fromJSON(json) {
    const classifier = new NaiveBayesClassifier();
    classifier.wordCounts = json.wordCounts;
    classifier.folderCounts = json.folderCounts;
    classifier.totalDocs = json.totalDocs;
    classifier.vocabulary = new Set(json.vocabulary);
    classifier.folderTotalWords = json.folderTotalWords;
    return classifier;
  }

  // Tokenize text into words, preserving important features
  tokenize(text) {
    // Preserve email addresses and domains
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const emails = text.match(emailPattern) || [];
    
    // Extract domains from email addresses
    const domains = emails.map(email => email.split('@')[1]);
    
    // Basic word tokenization
    const words = text.toLowerCase()
      .replace(/[^a-z0-9@._+-\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // Combine all features
    return [...new Set([...words, ...emails, ...domains])];
  }

  // Train the classifier with a document and its folder
  train(text, folder) {
    const words = this.tokenize(text);
    
    if (!this.wordCounts[folder]) {
      this.wordCounts[folder] = {};
      this.folderCounts[folder] = 0;
      this.folderTotalWords[folder] = 0;
    }
    
    this.folderCounts[folder]++;
    this.totalDocs++;
    
    for (const word of words) {
      this.vocabulary.add(word);
      this.wordCounts[folder][word] = (this.wordCounts[folder][word] || 0) + 1;
      this.folderTotalWords[folder]++;
    }
  }

  // Calculate probability scores with proper smoothing
  calculateFolderScore(words, folder) {
    // Ensure we have valid counts
    const folderCount = this.folderCounts[folder] || 0;
    if (folderCount === 0 || this.totalDocs === 0) {
      return -Infinity;
    }

    // Calculate prior probability in log space
    const priorProb = Math.log(folderCount / this.totalDocs);
    let score = priorProb;
    
    const debugInfo = {
      folder,
      folderCount,
      totalDocs: this.totalDocs,
      priorProb,
      wordScores: []
    };
    
    // Get total words in folder with proper fallback
    const totalWordsInFolder = this.folderTotalWords[folder] || 0;
    const vocabularySize = this.vocabulary.size || 1;  // Avoid division by zero
    
    // Calculate word probabilities
    for (const word of words) {
      // Get word count with proper fallback
      const wordCount = (this.wordCounts[folder] || {})[word] || 0;
      
      // Apply Laplace smoothing
      const smoothedCount = wordCount + 1;
      const smoothedTotal = totalWordsInFolder + vocabularySize;
      const probability = smoothedCount / smoothedTotal;
      
      // Convert to log space
      const logProb = Math.log(probability);
      
      // Only add if we got a valid probability
      if (isFinite(logProb)) {
        score += logProb;
      }
      
      debugInfo.wordScores.push({
        word,
        wordCount,
        totalWords: totalWordsInFolder,
        vocabSize: vocabularySize,
        smoothedCount,
        smoothedTotal,
        probability,
        logProb
      });
    }
    
    debugInfo.finalScore = score;
    
    // Only log detailed info for the first few folders to avoid console spam
    if (debugInfo.wordScores.length > 0 && Object.keys(this.folderCounts).indexOf(folder) < 3) {
      console.log('Debug - Folder Score Calculation:', debugInfo);
    }
    
    return isFinite(score) ? score : -Infinity;
  }

  // Predict the most likely folder for a document
  predictWithConfidence(text) {
    const words = this.tokenize(text);
    let scores = {};
    
    console.log('Debug - Words:', {
      wordCount: words.length,
      sampleWords: words.slice(0, 10)
    });
    
    // Calculate scores for each folder
    for (const folder in this.folderCounts) {
      const score = this.calculateFolderScore(words, folder);
      if (isFinite(score)) {  // Only include valid scores
        scores[folder] = score;
      }
    }
    
    // Find maximum score for numerical stability
    const maxScore = Math.max(...Object.values(scores));
    
    console.log('Debug - Raw Scores:', {
      maxScore,
      sampleScores: Object.fromEntries(
        Object.entries(scores).slice(0, 5)
      )
    });
    
    // Convert log probabilities to regular probabilities and normalize
    let totalProb = 0;
    const expScores = {};
    
    for (const folder in scores) {
      // Subtract maxScore for numerical stability
      const adjustedScore = scores[folder] - maxScore;
      const expScore = Math.exp(adjustedScore);
      if (isFinite(expScore)) {  // Only include valid exponential scores
        expScores[folder] = expScore;
        totalProb += expScore;
      }
    }
    
    console.log('Debug - Exp Scores:', {
      totalProb,
      sampleExpScores: Object.fromEntries(
        Object.entries(expScores).slice(0, 5)
      )
    });
    
    // Find best folder and calculate confidence
    let bestFolder = null;
    let bestProb = 0;
    const normalizedScores = {};
    
    if (totalProb > 0) {  // Only normalize if we have valid probabilities
      for (const folder in expScores) {
        const normalizedProb = expScores[folder] / totalProb;
        normalizedScores[folder] = normalizedProb;
        if (normalizedProb > bestProb) {
          bestProb = normalizedProb;
          bestFolder = folder;
        }
      }
    }
    
    console.log('Debug - Final Scores:', {
      bestFolder,
      bestProb,
      totalProb,
      confidence: totalProb > 0 ? Math.round(bestProb * 100) : 0,
      sampleNormalizedScores: Object.fromEntries(
        Object.entries(normalizedScores).slice(0, 5)
      )
    });
    
    // Ensure we don't return NaN confidence
    const confidence = totalProb > 0 ? Math.round(bestProb * 100) : 0;
    
    return {
      folder: bestFolder,
      confidence: confidence
    };
  }

  // For backward compatibility
  predict(text) {
    const result = this.predictWithConfidence(text);
    return result.folder;
  }
}

// Initialize models map to cache loaded models
const loadedModels = new Map();

// Load model for an account
async function loadModel(accountId) {
  // Check cache first
  if (loadedModels.has(accountId)) {
    return loadedModels.get(accountId);
  }

  // Load from storage
  const modelData = await browser.storage.local.get(`model_${accountId}`);
  if (!modelData[`model_${accountId}`]) {
    throw new Error("No trained model found for this account");
  }

  // Parse and cache the model
  const classifier = NaiveBayesClassifier.fromJSON(JSON.parse(modelData[`model_${accountId}`]));
  loadedModels.set(accountId, classifier);
  return classifier;
}

// Save model for an account
async function saveModel(accountId, classifier) {
  // Save to storage
  await browser.storage.local.set({
    [`model_${accountId}`]: JSON.stringify(classifier.toJSON())
  });
  
  // Update cache
  loadedModels.set(accountId, classifier);
}

// Delete model for an account
async function deleteModel(accountId) {
  // Remove from storage
  await browser.storage.local.remove(`model_${accountId}`);
  
  // Remove from cache
  loadedModels.delete(accountId);
}

// Save folder structure for an account
async function saveFolderStructure(accountId, folderStructure) {
  await browser.storage.local.set({
    [`folders_${accountId}`]: JSON.stringify(folderStructure)
  });
}

// Load folder structure for an account
async function loadFolderStructure(accountId) {
  const data = await browser.storage.local.get(`folders_${accountId}`);
  return data[`folders_${accountId}`] ? JSON.parse(data[`folders_${accountId}`]) : null;
}

// Get all folders for an account with their selection state
async function getFoldersWithState(account) {
  // Get current folder structure
  const allFolders = await getAllFolders(account);
  if (!allFolders || allFolders.length === 0) {
    throw new Error('No folders found');
  }
  
  try {
    // Try to load saved folder structure
    const savedStructure = await loadFolderStructure(account.id);
    
    // If we have a saved structure, merge it with current folders
    if (savedStructure) {
      const folderMap = new Map(savedStructure.map(f => [f.path, f.selected]));
      
      // Update folder structure with saved selection states
      return allFolders.map(folder => ({
        path: folder.path,
        name: folder.name,
        // If folder exists in saved structure, use saved selection state
        // If it's a new folder, select it if it's not a default folder
        selected: folderMap.has(folder.path) ? 
          folderMap.get(folder.path) : 
          !folder.isDefault
      }));
    }
    
    // For new accounts, select non-default folders by default
    return allFolders.map(folder => ({
      path: folder.path,
      name: folder.name,
      selected: !folder.isDefault
    }));
  } catch (error) {
    console.error('Error loading folder structure:', error);
    // On error, return all folders with default selection
    return allFolders.map(folder => ({
      path: folder.path,
      name: folder.name,
      selected: !folder.isDefault
    }));
  }
}

// Helper function to get all folders
async function getAllFolders(account) {
  const folders = [];
  
  async function traverseFolder(folder) {
    // Skip virtual folders
    if (folder.type === 'virtual') return;
    
    folders.push({
      path: folder.path,
      name: folder.name,
      isDefault: isDefaultFolder(folder)
    });
    
    // Process subfolders if they exist
    if (folder.subFolders) {
      for (const subFolder of folder.subFolders) {
        await traverseFolder(subFolder);
      }
    }
  }
  
  // Get account with full folder structure
  const accountInfo = await browser.accounts.get(account.id, true);
  if (accountInfo && accountInfo.folders) {
    for (const folder of accountInfo.folders) {
      await traverseFolder(folder);
    }
  }
  
  return folders;
}

// Helper function to check if folder is a default system folder
function isDefaultFolder(folder) {
  const systemFolders = ['Inbox', 'Sent', 'Drafts', 'Trash', 'Templates', 'Archives', 'Junk'];
  return systemFolders.includes(folder.name) || folder.type === 'special';
}

// Open assistant in a new tab
async function openAssistant() {
  const url = browser.runtime.getURL("pages/container.html");
  await browser.tabs.create({
    url: url
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
    await saveModel(account.id, classifier);
    
    // Save folder selection for future use
    await saveFolderStructure(account.id, selectedFolders);
    
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

// Get list of accounts that have trained models
async function getTrainedAccounts() {
  const data = await browser.storage.local.get(null);
  const trainedAccounts = [];
  
  // Look for model_* keys in storage
  for (const key of Object.keys(data)) {
    if (key.startsWith('model_')) {
      const accountId = key.replace('model_', '');
      trainedAccounts.push(accountId);
    }
  }
  
  return trainedAccounts;
}

// Check if account has a trained model
async function hasTrainedModel(accountId) {
  const modelData = await browser.storage.local.get(`model_${accountId}`);
  return !!modelData[`model_${accountId}`];
}

// Message classification function
async function classifyMessage(message, accountId) {
  try {
    console.log('Classifying message:', {
      id: message.id,
      subject: message.subject
    });
    
    // Load and verify the model exists
    const classifier = await loadModel(accountId);
    
    // Get message text and classify
    const fullText = `${message.author || ''} ${message.subject || ''}`;
    const words = classifier.tokenize(fullText);
    const prediction = classifier.predictWithConfidence(words);
    
    console.log('Classification result:', {
      messageId: message.id,
      predictedFolder: prediction.folder,
      confidence: prediction.confidence
    });
    
    return prediction;
  } catch (error) {
    console.error('Classification error:', error);
    throw error;
  }
}

// Move messages to their target folders
async function moveMessages(accountId, messages) {
  try {
    console.log('Moving messages:', {
      accountId,
      messageCount: messages.length
    });
    
    // Group messages by target folder for efficiency
    const messagesByFolder = {};
    for (const message of messages) {
      if (!message.predictedFolder) {
        console.warn(`Message ${message.id} has no predicted folder, skipping`);
        continue;
      }
      
      // Get folder info to get the folderId
      try {
        const folders = await browser.folders.query({
          path: message.predictedFolder,
          accountId: accountId
        });
        
        if (folders.length === 0) {
          console.warn(`Target folder not found: ${message.predictedFolder}`);
          continue;
        }
        
        const folderId = folders[0].id;
        if (!messagesByFolder[folderId]) {
          messagesByFolder[folderId] = [];
        }
        messagesByFolder[folderId].push(message.id);
      } catch (error) {
        console.error(`Error getting folder info for ${message.predictedFolder}:`, error);
        continue;
      }
    }
    
    // Move messages in batches by folder
    const results = [];
    for (const [folderId, messageIds] of Object.entries(messagesByFolder)) {
      console.log(`Moving ${messageIds.length} messages to folder: ${folderId}`);
      try {
        await browser.messages.move(messageIds, folderId);
        results.push({
          success: true,
          count: messageIds.length,
          folderId
        });
      } catch (error) {
        // Handle case where messages can't be moved (they might be external)
        console.error(`Error moving messages to folder ${folderId}:`, error);
        if (error.message.includes('ExtensionError')) {
          results.push({
            success: false,
            error: 'Cannot move external messages',
            count: messageIds.length,
            folderId
          });
        } else {
          // Try copying instead as per documentation
          try {
            await browser.messages.copy(messageIds, folderId);
            results.push({
              success: true,
              copied: true,
              count: messageIds.length,
              folderId
            });
          } catch (copyError) {
            results.push({
              success: false,
              error: copyError.message,
              count: messageIds.length,
              folderId
            });
          }
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('Move error:', error);
    throw error;
  }
}

// Get saved folder selection
async function getSavedFolders(accountId) {
  const data = await browser.storage.local.get(`folders_${accountId}`);
  return data[`folders_${accountId}`] ? JSON.parse(data[`folders_${accountId}`]) : null;
}

// Helper function to check if folder is user-created
function isUserFolder(folder) {
  const systemFolders = ['Inbox', 'Sent', 'Drafts', 'Trash', 'Templates', 'Archives', 'Junk'];
  return !systemFolders.includes(folder.name);
}

// Export functions for use in UI pages
window.emailArchive = {
  trainModel,
  classifyMessage,
  moveMessages,
  isUserFolder,
  isDefaultFolder,
  getAllFolders,
  getTrainedAccounts,
  getSavedFolders,
  deleteModel,
  saveFolderStructure,
  loadFolderStructure,
  getFoldersWithState
}; 