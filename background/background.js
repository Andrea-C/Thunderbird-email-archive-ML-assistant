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

// Algorithm types
const ALGORITHM_TYPES = {
  NAIVE_BAYES: 'naive_bayes',
  TFIDF_NAIVE_BAYES: 'tfidf_naive_bayes',
  SVM: 'svm'
};

// ============================================================================
// BASE CLASSIFIER - Shared tokenization logic
// ============================================================================

class BaseClassifier {
  // Tokenize text into words, preserving important features
  tokenize(text) {
    // Ensure text is a string
    text = String(text || '');
    
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
}

// ============================================================================
// NAIVE BAYES CLASSIFIER (Original)
// ============================================================================

class NaiveBayesClassifier extends BaseClassifier {
  constructor() {
    super();
    this.algorithmType = ALGORITHM_TYPES.NAIVE_BAYES;
    this.wordCounts = {};
    this.folderCounts = {};
    this.totalDocs = 0;
    this.vocabulary = new Set();
    this.folderTotalWords = {};
  }

  // Convert classifier to JSON-friendly format
  toJSON() {
    return {
      algorithmType: this.algorithmType,
      wordCounts: this.wordCounts,
      folderCounts: this.folderCounts,
      totalDocs: this.totalDocs,
      vocabulary: Array.from(this.vocabulary),
      folderTotalWords: this.folderTotalWords
    };
  }

  // Restore classifier from JSON
  static fromJSON(json) {
    const classifier = new NaiveBayesClassifier();
    classifier.wordCounts = json.wordCounts;
    classifier.folderCounts = json.folderCounts;
    classifier.totalDocs = json.totalDocs;
    classifier.vocabulary = new Set(json.vocabulary);
    classifier.folderTotalWords = json.folderTotalWords;
    return classifier;
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
    const folderCount = this.folderCounts[folder] || 0;
    if (folderCount === 0 || this.totalDocs === 0) {
      return -Infinity;
    }

    // Calculate prior probability in log space
    const priorProb = Math.log(folderCount / this.totalDocs);
    let score = priorProb;
    
    const totalWordsInFolder = this.folderTotalWords[folder] || 0;
    const vocabularySize = this.vocabulary.size || 1;
    
    // Calculate word probabilities
    for (const word of words) {
      const wordCount = (this.wordCounts[folder] || {})[word] || 0;
      
      // Apply Laplace smoothing
      const smoothedCount = wordCount + 1;
      const smoothedTotal = totalWordsInFolder + vocabularySize;
      const probability = smoothedCount / smoothedTotal;
      
      const logProb = Math.log(probability);
      
      if (isFinite(logProb)) {
        score += logProb;
      }
    }
    
    return isFinite(score) ? score : -Infinity;
  }

  // Predict the most likely folder for a document
  predictWithConfidence(text) {
    const words = this.tokenize(text);
    let scores = {};
    
    // Calculate scores for each folder
    for (const folder in this.folderCounts) {
      const score = this.calculateFolderScore(words, folder);
      if (isFinite(score)) {
        scores[folder] = score;
      }
    }
    
    // Find maximum score for numerical stability
    const maxScore = Math.max(...Object.values(scores));
    
    // Convert log probabilities to regular probabilities and normalize
    let totalProb = 0;
    const expScores = {};
    
    for (const folder in scores) {
      const adjustedScore = scores[folder] - maxScore;
      const expScore = Math.exp(adjustedScore);
      if (isFinite(expScore)) {
        expScores[folder] = expScore;
        totalProb += expScore;
      }
    }
    
    // Find best folder and calculate confidence
    let bestFolder = null;
    let bestProb = 0;
    
    if (totalProb > 0) {
      for (const folder in expScores) {
        const normalizedProb = expScores[folder] / totalProb;
        if (normalizedProb > bestProb) {
          bestProb = normalizedProb;
          bestFolder = folder;
        }
      }
    }
    
    const confidence = totalProb > 0 ? Math.round(bestProb * 100) : 0;
    
    return {
      folder: bestFolder,
      confidence: confidence
    };
  }

  predict(text) {
    const result = this.predictWithConfidence(text);
    return result.folder;
  }
}

// ============================================================================
// TF-IDF NAIVE BAYES CLASSIFIER (Improved)
// ============================================================================

class TFIDFNaiveBayesClassifier extends BaseClassifier {
  constructor() {
    super();
    this.algorithmType = ALGORITHM_TYPES.TFIDF_NAIVE_BAYES;
    this.wordCounts = {};
    this.folderCounts = {};
    this.totalDocs = 0;
    this.vocabulary = new Set();
    this.folderTotalWords = {};
    
    // TF-IDF specific
    this.documentFrequency = {};  // word -> number of documents containing word
    this.idfScores = {};          // word -> IDF score (calculated after training)
    this.isFinalized = false;     // Flag to track if IDF scores are calculated
  }

  // Convert classifier to JSON-friendly format
  toJSON() {
    return {
      algorithmType: this.algorithmType,
      wordCounts: this.wordCounts,
      folderCounts: this.folderCounts,
      totalDocs: this.totalDocs,
      vocabulary: Array.from(this.vocabulary),
      folderTotalWords: this.folderTotalWords,
      documentFrequency: this.documentFrequency,
      idfScores: this.idfScores,
      isFinalized: this.isFinalized
    };
  }

  // Restore classifier from JSON
  static fromJSON(json) {
    const classifier = new TFIDFNaiveBayesClassifier();
    classifier.wordCounts = json.wordCounts;
    classifier.folderCounts = json.folderCounts;
    classifier.totalDocs = json.totalDocs;
    classifier.vocabulary = new Set(json.vocabulary);
    classifier.folderTotalWords = json.folderTotalWords;
    classifier.documentFrequency = json.documentFrequency || {};
    classifier.idfScores = json.idfScores || {};
    classifier.isFinalized = json.isFinalized || false;
    return classifier;
  }

  // Train the classifier with a document and its folder
  train(text, folder) {
    const words = this.tokenize(text);
    const uniqueWords = new Set(words); // Track unique words in this document
    
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
    
    // Track document frequency for IDF calculation
    // Count each word only once per document
    for (const word of uniqueWords) {
      this.documentFrequency[word] = (this.documentFrequency[word] || 0) + 1;
    }
    
    // Mark as needing finalization
    this.isFinalized = false;
  }

  // Calculate IDF scores - call this after all training is complete
  finalizeTraining() {
    if (this.isFinalized) return;
    
    console.log('Finalizing TF-IDF training, calculating IDF scores...');
    
    for (const word of this.vocabulary) {
      const df = this.documentFrequency[word] || 1;
      // IDF formula: log((total docs + 1) / (docs containing word + 1)) + 1
      // The +1s prevent division by zero and the final +1 ensures IDF is always positive
      this.idfScores[word] = Math.log((this.totalDocs + 1) / (df + 1)) + 1;
    }
    
    this.isFinalized = true;
    console.log(`TF-IDF finalized. Vocabulary size: ${this.vocabulary.size}, Total docs: ${this.totalDocs}`);
  }

  // Calculate TF-IDF weighted score for a folder
  calculateFolderScore(words, folder) {
    const folderCount = this.folderCounts[folder] || 0;
    if (folderCount === 0 || this.totalDocs === 0) {
      return -Infinity;
    }

    // Ensure IDF scores are calculated
    if (!this.isFinalized) {
      this.finalizeTraining();
    }

    // Calculate prior probability in log space
    const priorProb = Math.log(folderCount / this.totalDocs);
    let score = priorProb;
    
    const totalWordsInFolder = this.folderTotalWords[folder] || 0;
    const vocabularySize = this.vocabulary.size || 1;
    
    // Calculate TF-IDF weighted word probabilities
    for (const word of words) {
      const wordCount = (this.wordCounts[folder] || {})[word] || 0;
      
      // Get IDF weight for this word (default to 1 if unknown)
      const idf = this.idfScores[word] || 1;
      
      // Apply Laplace smoothing to get base probability
      const smoothedCount = wordCount + 1;
      const smoothedTotal = totalWordsInFolder + vocabularySize;
      const baseProbability = smoothedCount / smoothedTotal;
      
      // Apply IDF weighting
      // We multiply the log probability by IDF to give more weight to discriminative words
      const logProb = Math.log(baseProbability);
      const weightedLogProb = logProb * idf;
      
      if (isFinite(weightedLogProb)) {
        score += weightedLogProb;
      }
    }
    
    return isFinite(score) ? score : -Infinity;
  }

  // Predict the most likely folder for a document
  predictWithConfidence(text) {
    // Ensure IDF scores are calculated
    if (!this.isFinalized) {
      this.finalizeTraining();
    }
    
    const words = this.tokenize(text);
    let scores = {};
    
    // Calculate scores for each folder
    for (const folder in this.folderCounts) {
      const score = this.calculateFolderScore(words, folder);
      if (isFinite(score)) {
        scores[folder] = score;
      }
    }
    
    // Find maximum score for numerical stability
    const scoreValues = Object.values(scores);
    if (scoreValues.length === 0) {
      return { folder: null, confidence: 0 };
    }
    
    const maxScore = Math.max(...scoreValues);
    
    // Convert log probabilities to regular probabilities and normalize
    let totalProb = 0;
    const expScores = {};
    
    for (const folder in scores) {
      const adjustedScore = scores[folder] - maxScore;
      const expScore = Math.exp(adjustedScore);
      if (isFinite(expScore)) {
        expScores[folder] = expScore;
        totalProb += expScore;
      }
    }
    
    // Find best folder and calculate confidence
    let bestFolder = null;
    let bestProb = 0;
    
    if (totalProb > 0) {
      for (const folder in expScores) {
        const normalizedProb = expScores[folder] / totalProb;
        if (normalizedProb > bestProb) {
          bestProb = normalizedProb;
          bestFolder = folder;
        }
      }
    }
    
    const confidence = totalProb > 0 ? Math.round(bestProb * 100) : 0;
    
    return {
      folder: bestFolder,
      confidence: confidence
    };
  }

  predict(text) {
    const result = this.predictWithConfidence(text);
    return result.folder;
  }
}

// ============================================================================
// SVM CLASSIFIER (Support Vector Machine) - Memory Optimized
// ============================================================================

class SVMClassifier extends BaseClassifier {
  constructor() {
    super();
    this.algorithmType = ALGORITHM_TYPES.SVM;
    
    // Vocabulary settings - LIMIT to prevent memory issues
    this.MAX_VOCABULARY_SIZE = 5000;  // Only keep top 5000 words
    
    // Vocabulary and IDF
    this.vocabulary = [];           // Array of top words (limited size)
    this.vocabularyIndex = {};      // word -> index mapping
    this.idfScores = {};            // word -> IDF score
    this.totalDocs = 0;
    
    // Temporary storage for vocabulary building (cleared after finalization)
    this.documentFrequency = {};    // word -> document count (temporary)
    
    // SVM specific - SPARSE weights (only store non-zero values)
    this.folders = [];              // List of folder names
    this.weights = {};              // folder -> {wordIndex: weight} sparse map
    this.biases = {};               // folder -> bias term
    
    // Training parameters
    this.learningRate = 0.01;
    this.regularization = 0.001;
    this.epochs = 3;                // Reduced epochs for speed
    
    // Training data references (text stored only during training)
    this.trainingDocs = [];         // [{text, folder}, ...] - cleared after training
    this.isFinalized = false;
  }

  // Convert classifier to JSON-friendly format
  toJSON() {
    return {
      algorithmType: this.algorithmType,
      vocabulary: this.vocabulary,
      vocabularyIndex: this.vocabularyIndex,
      idfScores: this.idfScores,
      totalDocs: this.totalDocs,
      folders: this.folders,
      weights: this.weights,
      biases: this.biases,
      isFinalized: this.isFinalized
    };
  }

  // Restore classifier from JSON
  static fromJSON(json) {
    const classifier = new SVMClassifier();
    classifier.vocabulary = json.vocabulary || [];
    classifier.vocabularyIndex = json.vocabularyIndex || {};
    classifier.idfScores = json.idfScores || {};
    classifier.totalDocs = json.totalDocs || 0;
    classifier.folders = json.folders || [];
    classifier.weights = json.weights || {};
    classifier.biases = json.biases || {};
    classifier.isFinalized = json.isFinalized || false;
    return classifier;
  }

  // Store training example (actual training happens in finalizeTraining)
  train(text, folder) {
    this.trainingDocs.push({ text, folder });
    this.totalDocs++;
    
    // Track document frequency for vocabulary selection
    const words = this.tokenize(text);
    const uniqueWords = new Set(words);
    
    for (const word of uniqueWords) {
      this.documentFrequency[word] = (this.documentFrequency[word] || 0) + 1;
    }
    
    // Track folders
    if (!this.folders.includes(folder)) {
      this.folders.push(folder);
    }
    
    this.isFinalized = false;
  }

  // Build limited vocabulary from most frequent words
  buildVocabulary() {
    console.log(`Building vocabulary from ${Object.keys(this.documentFrequency).length} unique words...`);
    
    // Sort words by document frequency (descending)
    const sortedWords = Object.entries(this.documentFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.MAX_VOCABULARY_SIZE)
      .map(entry => entry[0]);
    
    this.vocabulary = sortedWords;
    this.vocabularyIndex = {};
    
    for (let i = 0; i < this.vocabulary.length; i++) {
      this.vocabularyIndex[this.vocabulary[i]] = i;
    }
    
    // Calculate IDF scores for selected vocabulary
    for (const word of this.vocabulary) {
      const df = this.documentFrequency[word] || 1;
      this.idfScores[word] = Math.log((this.totalDocs + 1) / (df + 1)) + 1;
    }
    
    console.log(`Vocabulary limited to ${this.vocabulary.length} words`);
  }

  // Convert text to SPARSE TF-IDF feature vector
  textToSparseVector(text) {
    const words = this.tokenize(text);
    const sparseVector = {};  // {index: value}
    
    // Calculate term frequency
    const wordCounts = {};
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
    
    // Apply TF-IDF weighting (only for words in vocabulary)
    let sumSquares = 0;
    for (const word in wordCounts) {
      const idx = this.vocabularyIndex[word];
      if (idx !== undefined) {
        const tf = wordCounts[word];
        const idf = this.idfScores[word] || 1;
        const value = tf * idf;
        sparseVector[idx] = value;
        sumSquares += value * value;
      }
    }
    
    // L2 normalize
    const norm = Math.sqrt(sumSquares);
    if (norm > 0) {
      for (const idx in sparseVector) {
        sparseVector[idx] /= norm;
      }
    }
    
    return sparseVector;
  }

  // Calculate dot product of sparse weight vector and sparse feature vector
  sparseDot(weights, vector) {
    let sum = 0;
    for (const idx in vector) {
      if (weights[idx]) {
        sum += weights[idx] * vector[idx];
      }
    }
    return sum;
  }

  // Train SVM using Stochastic Gradient Descent with sparse vectors
  finalizeTraining() {
    if (this.isFinalized) return;
    
    console.log('Finalizing SVM training...');
    console.log(`Documents: ${this.totalDocs}, Folders: ${this.folders.length}`);
    
    // Build limited vocabulary
    this.buildVocabulary();
    
    // Clear document frequency (no longer needed)
    this.documentFrequency = {};
    
    // Initialize sparse weights for each folder
    for (const folder of this.folders) {
      this.weights[folder] = {};  // Sparse: only store non-zero weights
      this.biases[folder] = 0;
    }
    
    console.log(`Starting SGD training (${this.epochs} epochs)...`);
    
    // Train using Online SGD (one document at a time)
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      console.log(`Epoch ${epoch + 1}/${this.epochs}`);
      
      // Shuffle training data indices
      const indices = [...Array(this.trainingDocs.length).keys()];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      
      let processed = 0;
      for (const idx of indices) {
        const { text, folder: trueFolder } = this.trainingDocs[idx];
        const vector = this.textToSparseVector(text);
        
        // Update each binary classifier (one-vs-all)
        for (const folder of this.folders) {
          const y = (folder === trueFolder) ? 1 : -1;
          const weights = this.weights[folder];
          
          // Calculate decision: w · x + b
          let decision = this.biases[folder] + this.sparseDot(weights, vector);
          
          // Hinge loss: update if margin violated
          if (y * decision < 1) {
            // Update weights for non-zero features
            for (const i in vector) {
              const oldW = weights[i] || 0;
              const newW = oldW + this.learningRate * (y * vector[i] - this.regularization * oldW);
              if (Math.abs(newW) > 1e-10) {
                weights[i] = newW;
              } else {
                delete weights[i];  // Remove near-zero weights
              }
            }
            this.biases[folder] += this.learningRate * y;
          } else {
            // Apply regularization decay to active weights
            for (const i in vector) {
              if (weights[i]) {
                weights[i] *= (1 - this.learningRate * this.regularization);
                if (Math.abs(weights[i]) < 1e-10) {
                  delete weights[i];
                }
              }
            }
          }
        }
        
        processed++;
        if (processed % 10000 === 0) {
          console.log(`  Processed ${processed}/${this.trainingDocs.length}`);
        }
      }
    }
    
    // Clear training data to save memory
    this.trainingDocs = [];
    this.isFinalized = true;
    
    // Log model size
    let totalWeights = 0;
    for (const folder in this.weights) {
      totalWeights += Object.keys(this.weights[folder]).length;
    }
    console.log(`SVM training complete. Total non-zero weights: ${totalWeights}`);
  }

  // Predict the most likely folder for a document
  predictWithConfidence(text) {
    if (!this.isFinalized) {
      this.finalizeTraining();
    }
    
    const vector = this.textToSparseVector(text);
    const scores = {};
    
    // Calculate decision score for each folder
    for (const folder of this.folders) {
      scores[folder] = this.biases[folder] + this.sparseDot(this.weights[folder], vector);
    }
    
    // Sort folders by score to find top predictions
    const sortedFolders = Object.entries(scores)
      .sort((a, b) => b[1] - a[1]);
    
    const bestFolder = sortedFolders[0][0];
    const bestScore = sortedFolders[0][1];
    const secondScore = sortedFolders.length > 1 ? sortedFolders[1][1] : bestScore - 1;
    
    // Calculate confidence using multiple methods and take the best
    
    // Method 1: Margin-based confidence
    // The gap between best and second-best indicates certainty
    const margin = bestScore - secondScore;
    // Sigmoid transformation: maps margin to 0-100%
    // margin of 0 → 50%, margin of 2 → 88%, margin of 4 → 98%
    const marginConfidence = Math.round(100 / (1 + Math.exp(-margin * 1.5)));
    
    // Method 2: Temperature-scaled softmax
    // Higher temperature = sharper distribution
    const temperature = 0.1;  // Low temperature = more confident predictions
    const scaledScores = sortedFolders.map(([f, s]) => [f, s / temperature]);
    const maxScaled = scaledScores[0][1];
    
    let totalExp = 0;
    let bestExp = 0;
    for (const [folder, score] of scaledScores) {
      const expScore = Math.exp(Math.min(score - maxScaled, 700));
      if (folder === bestFolder) bestExp = expScore;
      totalExp += expScore;
    }
    const softmaxConfidence = totalExp > 0 ? Math.round((bestExp / totalExp) * 100) : 0;
    
    // Use the higher of the two confidence measures
    // This gives better UX - predictions that are clearly better get high confidence
    const confidence = Math.max(marginConfidence, softmaxConfidence);
    
    return {
      folder: bestFolder,
      confidence: confidence
    };
  }

  predict(text) {
    const result = this.predictWithConfidence(text);
    return result.folder;
  }
}

// ============================================================================
// CLASSIFIER FACTORY
// ============================================================================

function createClassifier(algorithmType) {
  switch (algorithmType) {
    case ALGORITHM_TYPES.SVM:
      return new SVMClassifier();
    case ALGORITHM_TYPES.TFIDF_NAIVE_BAYES:
      return new TFIDFNaiveBayesClassifier();
    case ALGORITHM_TYPES.NAIVE_BAYES:
    default:
      return new NaiveBayesClassifier();
  }
}

function classifierFromJSON(json) {
  const algorithmType = json.algorithmType || ALGORITHM_TYPES.NAIVE_BAYES;
  
  switch (algorithmType) {
    case ALGORITHM_TYPES.SVM:
      return SVMClassifier.fromJSON(json);
    case ALGORITHM_TYPES.TFIDF_NAIVE_BAYES:
      return TFIDFNaiveBayesClassifier.fromJSON(json);
    case ALGORITHM_TYPES.NAIVE_BAYES:
    default:
      return NaiveBayesClassifier.fromJSON(json);
  }
}

// ============================================================================
// MODEL MANAGEMENT
// ============================================================================

// Initialize models map to cache loaded models
// Key format: accountId_algorithmType
const loadedModels = new Map();

// Get model storage key
function getModelKey(accountId, algorithmType) {
  return `model_${accountId}_${algorithmType}`;
}

// Get cache key
function getCacheKey(accountId, algorithmType) {
  return `${accountId}_${algorithmType}`;
}

// Load model for an account with specific algorithm
async function loadModel(accountId, algorithmType = null) {
  // If no algorithm specified, get the first available one
  if (!algorithmType) {
    const availableModels = await getAvailableModels(accountId);
    if (availableModels.length === 0) {
      throw new Error("No trained model found for this account");
    }
    algorithmType = availableModels[0];
  }
  
  const cacheKey = getCacheKey(accountId, algorithmType);
  
  // Check cache first
  if (loadedModels.has(cacheKey)) {
    console.log(`Loading model from cache: ${cacheKey}`);
    return loadedModels.get(cacheKey);
  }

  // Load from storage
  const modelKey = getModelKey(accountId, algorithmType);
  const modelData = await browser.storage.local.get(modelKey);
  
  if (!modelData[modelKey]) {
    throw new Error(`No trained model found for algorithm: ${algorithmType}`);
  }

  // Parse and use factory to create correct classifier type
  const json = JSON.parse(modelData[modelKey]);
  const classifier = classifierFromJSON(json);
  
  console.log(`Loaded model from storage: ${modelKey}, algorithm: ${classifier.algorithmType}`);
  
  loadedModels.set(cacheKey, classifier);
  return classifier;
}

// Save model for an account
async function saveModel(accountId, classifier) {
  const algorithmType = classifier.algorithmType;
  const modelKey = getModelKey(accountId, algorithmType);
  const cacheKey = getCacheKey(accountId, algorithmType);
  
  // Clear cache for this specific model (ensure fresh load next time)
  loadedModels.delete(cacheKey);
  
  // Save to storage
  await browser.storage.local.set({
    [modelKey]: JSON.stringify(classifier.toJSON())
  });
  
  console.log(`Saved model: ${modelKey}`);
  
  // Update cache with fresh model
  loadedModels.set(cacheKey, classifier);
}

// Delete model for an account (specific algorithm or all)
async function deleteModel(accountId, algorithmType = null) {
  if (algorithmType) {
    // Delete specific algorithm model
    const modelKey = getModelKey(accountId, algorithmType);
    const cacheKey = getCacheKey(accountId, algorithmType);
    
    await browser.storage.local.remove(modelKey);
    loadedModels.delete(cacheKey);
    
    console.log(`Deleted model: ${modelKey}`);
  } else {
    // Delete all models for this account
    const allAlgorithms = Object.values(ALGORITHM_TYPES);
    for (const algo of allAlgorithms) {
      const modelKey = getModelKey(accountId, algo);
      const cacheKey = getCacheKey(accountId, algo);
      
      await browser.storage.local.remove(modelKey);
      loadedModels.delete(cacheKey);
    }
    console.log(`Deleted all models for account: ${accountId}`);
  }
}

// Get available models (algorithms) for an account
async function getAvailableModels(accountId) {
  const availableAlgorithms = [];
  const allAlgorithms = Object.values(ALGORITHM_TYPES);
  
  // Check new format keys
  for (const algo of allAlgorithms) {
    const modelKey = getModelKey(accountId, algo);
    const modelData = await browser.storage.local.get(modelKey);
    
    if (modelData[modelKey]) {
      availableAlgorithms.push(algo);
    }
  }
  
  // Also check old format key (backward compatibility)
  if (availableAlgorithms.length === 0) {
    const oldKey = `model_${accountId}`;
    const oldModelData = await browser.storage.local.get(oldKey);
    
    if (oldModelData[oldKey]) {
      try {
        const modelJson = JSON.parse(oldModelData[oldKey]);
        const algorithmType = modelJson.algorithmType || ALGORITHM_TYPES.NAIVE_BAYES;
        availableAlgorithms.push(algorithmType);
        
        // Migrate to new format
        const newKey = getModelKey(accountId, algorithmType);
        await browser.storage.local.set({ [newKey]: oldModelData[oldKey] });
        await browser.storage.local.remove(oldKey);
        console.log(`Migrated model from ${oldKey} to ${newKey}`);
      } catch (e) {
        console.warn('Could not migrate old model:', oldKey, e);
      }
    }
  }
  
  return availableAlgorithms;
}

// Get the algorithm type for an account's model (returns first available)
async function getModelAlgorithm(accountId) {
  const available = await getAvailableModels(accountId);
  return available.length > 0 ? available[0] : null;
}

// Save folder structure for an account
async function saveFolderStructure(accountId, folders) {
  try {
    const key = `folders_${accountId}`;
    const data = {};
    data[key] = JSON.stringify(folders);
    await browser.storage.local.set(data);
    return true;
  } catch (error) {
    console.error('Error saving folder structure:', error);
    return false;
  }
}

// Load folder structure for an account
async function loadFolderStructure(accountId) {
  try {
    const key = `folders_${accountId}`;
    const data = await browser.storage.local.get(key);
    return data[key] ? JSON.parse(data[key]) : null;
  } catch (error) {
    console.error('Error loading folder structure:', error);
    return null;
  }
}

// Get folders with their state
async function getFoldersWithState(account) {
  try {
    // Get all folders using the correct API
    const folders = await getAllFolders(account);
    
    // Load saved structure
    const savedStructure = await loadFolderStructure(account.id);
    const savedFolderMap = new Map();
    
    if (savedStructure) {
      savedStructure.forEach(folder => {
        savedFolderMap.set(folder.path, folder.selected);
      });
    }
    
    // Process folders and set their states
    return folders.map(folder => {
      const folderInfo = {
        path: folder.path,
        name: folder.name,
        selected: false
      };
      
      // If we have saved state, use it
      if (savedFolderMap.has(folder.path)) {
        folderInfo.selected = savedFolderMap.get(folder.path);
      } else {
        // For new folders, use default logic
        folderInfo.selected = !folder.isDefault;
      }
      
      return folderInfo;
    });
  } catch (error) {
    console.error('Error getting folders with state:', error);
    throw error;
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

// ============================================================================
// TRAINING
// ============================================================================

// Training function - now accepts algorithm type
async function trainModel(account, selectedFolders, algorithmType = ALGORITHM_TYPES.NAIVE_BAYES) {
  try {
    // Create classifier based on selected algorithm
    const classifier = createClassifier(algorithmType);
    console.log(`Training with algorithm: ${algorithmType}`);
    
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
    
    // Finalize training (important for TF-IDF to calculate IDF scores)
    if (typeof classifier.finalizeTraining === 'function') {
      classifier.finalizeTraining();
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
    
    return { 
      success: true, 
      messagesProcessed: processedMessages,
      algorithm: algorithmType
    };
  } catch (error) {
    console.error('Training error:', error);
    throw error;
  }
}

// ============================================================================
// CLASSIFICATION & MOVING
// ============================================================================

// Get list of accounts that have trained models
async function getTrainedAccounts() {
  const data = await browser.storage.local.get(null);
  const trainedAccountsSet = new Set();
  
  // Look for model_* keys in storage
  // Format: model_accountId_algorithmType
  for (const key of Object.keys(data)) {
    if (key.startsWith('model_')) {
      // Extract accountId (everything between first and last underscore)
      const parts = key.split('_');
      if (parts.length >= 3) {
        // parts[0] = 'model', parts[1] = accountId, parts[2+] = algorithmType
        const accountId = parts[1];
        trainedAccountsSet.add(accountId);
      }
    }
  }
  
  return Array.from(trainedAccountsSet);
}

// Get trained accounts with their available algorithms
async function getTrainedAccountsWithAlgorithms() {
  const data = await browser.storage.local.get(null);
  const accountModels = {};  // accountId -> [algorithms]
  const keysToMigrate = [];  // Collect migrations to do after iteration
  
  for (const key of Object.keys(data)) {
    if (key.startsWith('model_')) {
      const parts = key.split('_');
      
      if (parts.length >= 3) {
        // New format: model_accountId_algorithmType
        const accountId = parts[1];
        const algorithmType = parts.slice(2).join('_');  // Handle algorithm names with underscores
        
        if (!accountModels[accountId]) {
          accountModels[accountId] = [];
        }
        accountModels[accountId].push(algorithmType);
      } else if (parts.length === 2) {
        // Old format: model_accountId (backward compatibility)
        const accountId = parts[1];
        
        // Try to determine algorithm from the stored model data
        try {
          const modelJson = JSON.parse(data[key]);
          const algorithmType = modelJson.algorithmType || ALGORITHM_TYPES.NAIVE_BAYES;
          
          if (!accountModels[accountId]) {
            accountModels[accountId] = [];
          }
          accountModels[accountId].push(algorithmType);
          
          // Queue migration for later
          keysToMigrate.push({
            oldKey: key,
            newKey: getModelKey(accountId, algorithmType),
            data: data[key]
          });
        } catch (e) {
          console.warn('Could not parse old model format:', key, e);
        }
      }
    }
  }
  
  // Perform migrations after iteration
  for (const migration of keysToMigrate) {
    try {
      await browser.storage.local.set({ [migration.newKey]: migration.data });
      await browser.storage.local.remove(migration.oldKey);
      console.log(`Migrated model from ${migration.oldKey} to ${migration.newKey}`);
    } catch (e) {
      console.warn('Migration failed:', migration.oldKey, e);
    }
  }
  
  return accountModels;
}

// Check if account has a trained model (any algorithm)
async function hasTrainedModel(accountId) {
  const available = await getAvailableModels(accountId);
  return available.length > 0;
}

// Message classification function
async function classifyMessage(message, accountId, algorithmType = null) {
  try {
    console.log('Classifying message:', {
      id: message.id,
      subject: message.subject,
      requestedAlgorithm: algorithmType
    });
    
    // Load the model (with specific algorithm if provided)
    const classifier = await loadModel(accountId, algorithmType);
    
    console.log('Using algorithm:', classifier.algorithmType);
    
    // Get message text and classify
    const fullText = [
      message.author || '',
      message.subject || '',
      message.body?.plain || message.body || ''
    ].join(' ').trim();
    
    if (!fullText) {
      throw new Error('No text content available for classification');
    }
    
    const prediction = classifier.predictWithConfidence(fullText);
    
    console.log('Classification result:', {
      messageId: message.id,
      predictedFolder: prediction.folder,
      confidence: prediction.confidence,
      algorithm: classifier.algorithmType
    });
    
    return prediction;
  } catch (error) {
    console.error('Classification error:', error);
    throw error;
  }
}

// Move messages to their predicted folders
async function moveMessages(accountId, messages) {
  const results = [];
  
  for (const message of messages) {
    try {
      if (!message.predictedFolder) {
        throw new Error('No predicted folder for message');
      }
      
      // Get the target folder
      const folders = await browser.folders.query({
        accountId: accountId,
        path: message.predictedFolder
      });
      
      if (!folders || folders.length === 0) {
        throw new Error(`Target folder ${message.predictedFolder} not found`);
      }
      
      const targetFolder = folders[0];
      
      // Try to move the message
      // Note: As of Thunderbird 121+, messages.move() requires MailFolderId (folder.id) instead of full MailFolder object
      try {
        await browser.messages.move([message.id], targetFolder.id);
        results.push({
          messageId: message.id,
          success: true,
          copied: false,
          count: 1
        });
      } catch (moveError) {
        // If move fails, try to copy instead
        console.warn('Move failed, attempting copy:', moveError);
        await browser.messages.copy([message.id], targetFolder.id);
        results.push({
          messageId: message.id,
          success: true,
          copied: true,
          count: 1
        });
      }
    } catch (error) {
      console.error(`Error moving message ${message.id}:`, error);
      results.push({
        messageId: message.id,
        success: false,
        error: error.message,
        count: 1
      });
    }
  }
  
  return results;
}

// Get saved folder selection
async function getSavedFolders(accountId) {
  const data = await browser.storage.local.get(`folders_${accountId}`);
  return data[`folders_${accountId}`] ? JSON.parse(data[`folders_${accountId}`]) : null;
}

// Helper function to check if folder is user-created
function isUserFolder(folder) {
  return !isDefaultFolder(folder);
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export functions and constants for use in UI pages
window.emailArchive = {
  // Version for debugging
  VERSION: '2.0.0-beta3',
  
  // Constants
  ALGORITHM_TYPES,
  
  // Training
  trainModel,
  
  // Classification
  classifyMessage,
  moveMessages,
  
  // Folder helpers
  isUserFolder,
  isDefaultFolder,
  getAllFolders,
  getSavedFolders,
  saveFolderStructure,
  loadFolderStructure,
  getFoldersWithState,
  
  // Model management
  getTrainedAccounts,
  getTrainedAccountsWithAlgorithms,
  getAvailableModels,
  hasTrainedModel,
  deleteModel,
  getModelAlgorithm
};

console.log('Email Archive ML Assistant loaded:', window.emailArchive.VERSION);
console.log('Available functions:', Object.keys(window.emailArchive));
