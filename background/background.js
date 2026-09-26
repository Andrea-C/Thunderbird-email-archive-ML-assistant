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

// Feature sets a model can be trained with (stored in model metadata).
// Classification always uses the feature set the model was trained with.
const FEATURE_SETS = {
  HEADERS: 'headers',            // sender + subject
  HEADERS_BODY: 'headers+body'   // sender + subject + cleaned body text
};

const BODY_MAX_CHARS = 2000;        // body text kept per message after cleaning
const BODY_FETCH_CONCURRENCY = 8;   // parallel getFull() calls (training and classification)
const MAX_TOKEN_LENGTH = 40;

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
      // Skip pure numbers (order IDs, dates, amounts) and very long tokens
      // (URL fragments, encoded strings): with the body in training they only
      // inflate the vocabulary.
      .filter(word => word.length > 2 && word.length <= MAX_TOKEN_LENGTH && !/^[0-9.+-]+$/.test(word));
    
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
const loadingModels = new Map();  // cacheKey -> Promise of an in-flight load

// Get model storage key
function getModelKey(accountId, algorithmType) {
  return `model_${accountId}_${algorithmType}`;
}

// Get model metadata storage key (kept separate from the model so the
// Trained Models list can read it without parsing the whole model).
// Note: must not start with 'model_' (that prefix identifies models).
function getModelMetaKey(accountId, algorithmType) {
  return `modelMeta_${accountId}_${algorithmType}`;
}

// Get cache key
function getCacheKey(accountId, algorithmType) {
  return `${accountId}_${algorithmType}`;
}

// Get metadata of a trained model. Models trained before rel. 3 have no
// metadata: they were effectively trained on headers only.
async function getModelMeta(accountId, algorithmType) {
  const metaKey = getModelMetaKey(accountId, algorithmType);
  const data = await browser.storage.local.get(metaKey);
  return data[metaKey] || { features: FEATURE_SETS.HEADERS, legacy: true };
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
    return loadedModels.get(cacheKey);
  }
  
  // Parallel classification calls share one in-flight load instead of each
  // reading and parsing the (possibly multi-MB) model
  if (loadingModels.has(cacheKey)) {
    return loadingModels.get(cacheKey);
  }
  const loading = loadModelFromStorage(accountId, algorithmType, cacheKey);
  loadingModels.set(cacheKey, loading);
  try {
    return await loading;
  } finally {
    loadingModels.delete(cacheKey);
  }
}

// Read, parse and cache a model (called by loadModel only)
async function loadModelFromStorage(accountId, algorithmType, cacheKey) {
  // Load from storage
  const modelKey = getModelKey(accountId, algorithmType);
  const modelData = await browser.storage.local.get(modelKey);
  
  if (!modelData[modelKey]) {
    throw new Error(`No trained model found for algorithm: ${algorithmType}`);
  }

  // Parse and use factory to create correct classifier type
  const json = JSON.parse(modelData[modelKey]);
  const classifier = classifierFromJSON(json);
  classifier.meta = await getModelMeta(accountId, algorithmType);

  console.log(`Loaded model from storage: ${modelKey}, algorithm: ${classifier.algorithmType}, features: ${classifier.meta.features}`);
  
  loadedModels.set(cacheKey, classifier);
  return classifier;
}

// Save model (and its metadata) for an account
async function saveModel(accountId, classifier, meta) {
  const algorithmType = classifier.algorithmType;
  const modelKey = getModelKey(accountId, algorithmType);
  const cacheKey = getCacheKey(accountId, algorithmType);

  // Clear cache for this specific model (ensure fresh load next time)
  loadedModels.delete(cacheKey);

  // Save to storage
  const modelJson = JSON.stringify(classifier.toJSON());
  classifier.meta = { ...meta, modelSizeBytes: modelJson.length };
  await browser.storage.local.set({
    [modelKey]: modelJson,
    [getModelMetaKey(accountId, algorithmType)]: classifier.meta
  });

  console.log(`Saved model: ${modelKey} (${(modelJson.length / 1048576).toFixed(1)} MB, features: ${classifier.meta.features})`);
  
  // Update cache with fresh model
  loadedModels.set(cacheKey, classifier);
}

// Delete model for an account (specific algorithm or all)
async function deleteModel(accountId, algorithmType = null) {
  if (algorithmType) {
    // Delete specific algorithm model
    const modelKey = getModelKey(accountId, algorithmType);
    const cacheKey = getCacheKey(accountId, algorithmType);
    
    await browser.storage.local.remove([modelKey, getModelMetaKey(accountId, algorithmType)]);
    loadedModels.delete(cacheKey);

    console.log(`Deleted model: ${modelKey}`);
  } else {
    // Delete all models for this account
    const allAlgorithms = Object.values(ALGORITHM_TYPES);
    for (const algo of allAlgorithms) {
      const modelKey = getModelKey(accountId, algo);
      const cacheKey = getCacheKey(accountId, algo);
      
      await browser.storage.local.remove([modelKey, getModelMetaKey(accountId, algo)]);
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

// ----------------------------------------------------------------------------
// Folder selection persistence
//
// Stored under `folders_<accountId>` as
//   { version: 2, selection: { "<folder path>": true | false }, savedAt }
// Every folder shown in the Training tree is stored with its checkbox state,
// so a folder the user unchecked stays unchecked across trainings, Thunderbird
// restarts and extension updates. Only folders never seen before get the
// default (checked unless it is a system folder).
//
// Legacy formats (rel. 1-2) are still read:
//   - array of path strings, or array of {path, selected: true} only: the list
//     of folders used in the last training -> folders not listed are unchecked
//   - array of {path, selected} with some false: full structure
// ----------------------------------------------------------------------------

const FOLDER_SELECTION_VERSION = 2;

// Parse any stored format into { selection, unlistedSelected }
// unlistedSelected: state for folders not in `selection` (null = use default)
function parseFolderSelection(raw) {
  if (!raw) return null;
  const stored = typeof raw === 'string' ? JSON.parse(raw) : raw;
  
  if (stored && stored.version === FOLDER_SELECTION_VERSION && stored.selection) {
    return { selection: { ...stored.selection }, unlistedSelected: null };
  }
  
  if (Array.isArray(stored)) {
    const selection = {};
    let hasUnselected = false;
    for (const item of stored) {
      if (typeof item === 'string') {
        selection[item] = true;
      } else if (item && item.path) {
        selection[item.path] = item.selected !== false;
        if (item.selected === false) hasUnselected = true;
      }
    }
    // A list of selected folders only means "everything else was unchecked"
    return { selection, unlistedSelected: hasUnselected ? null : false };
  }
  
  return null;
}

// Save the folder selection for an account.
// folders: array of {path, selected} (preferred: all folders of the tree),
// or array of path strings (all treated as selected)
async function saveFolderStructure(accountId, folders) {
  try {
    const selection = {};
    for (const folder of folders || []) {
      if (typeof folder === 'string') {
        selection[folder] = true;
      } else if (folder && folder.path) {
        selection[folder.path] = folder.selected !== false;
      }
    }
    await browser.storage.local.set({
      [`folders_${accountId}`]: JSON.stringify({
        version: FOLDER_SELECTION_VERSION,
        selection,
        savedAt: new Date().toISOString()
      })
    });
    return true;
  } catch (error) {
    console.error('Error saving folder structure:', error);
    return false;
  }
}

// Load the folder selection for an account (null if never saved)
async function loadFolderStructure(accountId) {
  try {
    const key = `folders_${accountId}`;
    const data = await browser.storage.local.get(key);
    return parseFolderSelection(data[key]);
  } catch (error) {
    console.error('Error loading folder structure:', error);
    return null;
  }
}

// Get folders with their state
async function getFoldersWithState(account) {
  try {
    const folders = await getAllFolders(account);
    const saved = await loadFolderStructure(account.id);
    
    return folders.map(folder => {
      let selected;
      if (saved && Object.prototype.hasOwnProperty.call(saved.selection, folder.path)) {
        selected = saved.selection[folder.path];          // user's saved choice
      } else if (saved && saved.unlistedSelected !== null) {
        selected = saved.unlistedSelected;                // legacy selected-only list
      } else {
        selected = !folder.isDefault;                     // folder never seen before
      }
      return { path: folder.path, name: folder.name, selected };
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
// MESSAGE TEXT - shared by training and classification so both always see
// exactly the same features
// ============================================================================

// Convert HTML to plain text without executing anything (DOMParser does not
// run scripts or load resources)
function htmlToText(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Drop non-content and quoted replies (HTML quotes live in <blockquote> /
  // Gmail's quote container, not in "> " lines)
  doc.querySelectorAll('script, style, head, blockquote, .gmail_quote').forEach(el => el.remove());
  if (!doc.body) return '';
  // textContent adds no separators: turn <br> and block ends into newlines
  // so words don't glue together and line-based cleaning still works
  doc.body.querySelectorAll('br').forEach(el => el.replaceWith('\n'));
  doc.body.querySelectorAll('p, div, li, tr, td, th, h1, h2, h3, h4, h5, h6, table, section, article')
    .forEach(el => el.append('\n'));
  return doc.body.textContent || '';
}

// True if a MIME part is an attachment (e.g. an attached .txt or .csv),
// whose text must not be mistaken for the message body
function isAttachmentPart(part) {
  const disposition = (part.headers && part.headers['content-disposition'] || []).join(' ');
  return Boolean(part.name) || /^\s*attachment/i.test(disposition);
}

// Extract body text from a getFull() message: prefer text/plain parts,
// fall back to stripped text/html
function extractBodyText(fullMessage) {
  if (!fullMessage || !fullMessage.parts) return '';

  let plainText = '';
  let htmlText = '';

  function extractFromParts(parts) {
    for (const part of parts) {
      if (isAttachmentPart(part)) continue;
      if (part.contentType === 'text/plain' && part.body) {
        plainText += part.body + '\n';
      } else if (part.contentType === 'text/html' && part.body) {
        htmlText += part.body + '\n';
      }
      if (part.parts) {
        extractFromParts(part.parts);
      }
    }
  }

  extractFromParts(fullMessage.parts);

  if (plainText.trim()) return plainText;
  if (htmlText.trim()) return htmlToText(htmlText);
  return '';
}

// Keep only the message's own text: drop quoted lines ("> ..."), stop at the
// signature separator or at a reply header (the quoted older thread),
// collapse whitespace and truncate to BODY_MAX_CHARS.
// Forward headers are NOT a cut point: in a forward the forwarded content
// (invoice, order, ...) is usually what identifies the folder.
function cleanBodyText(text) {
  // "On ... wrote:" / "Il ... ha scritto:" (also when Gmail wraps the
  // attribution over two lines, so only the line end is matched), Outlook
  // "-----Original Message-----" and its "______" separator line
  const replyHeaderPattern = /((wrote|ha scritto):$|^-{2,}\s*(original message|messaggio originale)\s*-{2,}$|^_{10,}$)/i;
  const forwardHeaderPattern = /^-{2,}\s*(forwarded message|messaggio inoltrato)\s*-{2,}$/i;
  const keptLines = [];

  for (const line of String(text || '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === '--') break;                      // signature separator "-- "
    if (replyHeaderPattern.test(trimmed)) {           // start of quoted thread
      // Wrapped attribution: its first half ("On Mon, ... John <") was
      // already kept on the previous line
      const previous = keptLines[keptLines.length - 1] || '';
      if (!/^(on|il)\s/i.test(trimmed) && /^(on|il)\s/i.test(previous)) keptLines.pop();
      break;
    }
    if (forwardHeaderPattern.test(trimmed)) continue; // keep forwarded content
    if (trimmed.startsWith('>')) continue;            // quoted line
    if (trimmed) keptLines.push(trimmed);
  }

  return keptLines.join(' ').replace(/\s+/g, ' ').trim().slice(0, BODY_MAX_CHARS);
}

// Fetch and clean the body of a message; returns '' on error so one bad
// message never breaks training or classification
async function getMessageBodyText(messageId) {
  try {
    const fullMessage = await browser.messages.getFull(messageId);
    return cleanBodyText(extractBodyText(fullMessage));
  } catch (error) {
    console.warn(`Could not read body of message ${messageId}:`, error);
    return '';
  }
}

// Build the text the classifier sees for a message
function buildMessageText(message, bodyText = '') {
  return [message.author || '', message.subject || '', bodyText].join(' ').trim();
}

// Map items with an async function, at most `limit` calls in flight
async function mapWithConcurrency(items, limit, asyncFn) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await asyncFn(items[index]);
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(limit, items.length); i++) {
    workers.push(runWorker());
  }
  await Promise.all(workers);
  return results;
}

// ============================================================================
// EVALUATION - hold-out test of the model (read-only, nothing is moved)
// ============================================================================

const HOLDOUT_PERCENT = 20;                 // share of messages kept for testing
const EVAL_THRESHOLDS = [50, 60, 70, 80, 90, 95];
const DEFAULT_CONFIDENCE_THRESHOLD = 80;    // matches the Archive tab default
const MIN_TEST_SUPPORT = 5;                 // fewer test messages -> "insufficient data"
const MAX_REPORTED_CONFUSIONS = 20;

// 32-bit FNV-1a hash (deterministic, no randomness)
function hashString(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

// Deterministic train/test assignment: the Message-ID header is stable across
// runs and restarts (message.id is not), so the same message always lands on
// the same side
function isHoldOutMessage(message, folderPath) {
  const key = message.headerMessageId || `${folderPath}#${message.id}`;
  return hashString(key) % 100 < HOLDOUT_PERCENT;
}

// Compute the evaluation report from test predictions
// testResults: [{ actual, predicted, confidence (0-100) }]
// trainCounts: { folder: number of evaluation-training messages }
function computeEvaluation(testResults, trainCounts) {
  const total = testResults.length;
  const correct = testResults.filter(r => r.predicted === r.actual).length;

  // Per-folder counts
  const stats = {};  // folder -> { support, predicted, truePositives }
  const ensure = folder => (stats[folder] = stats[folder] || { support: 0, predicted: 0, truePositives: 0 });
  // List every trained folder, also those with no test message (flagged
  // as insufficient data)
  Object.keys(trainCounts).forEach(ensure);
  const confusions = {};  // "actual\u0000predicted" -> count

  for (const result of testResults) {
    ensure(result.actual).support++;
    if (result.predicted) ensure(result.predicted).predicted++;
    if (result.predicted === result.actual) {
      stats[result.actual].truePositives++;
    } else {
      const key = `${result.actual}\u0000${result.predicted || '(none)'}`;
      confusions[key] = (confusions[key] || 0) + 1;
    }
  }

  const perFolder = Object.entries(stats).map(([folder, s]) => {
    const precision = s.predicted > 0 ? s.truePositives / s.predicted : null;
    const recall = s.support > 0 ? s.truePositives / s.support : null;
    const f1 = precision && recall ? (2 * precision * recall) / (precision + recall) : 0;
    return {
      folder,
      trainCount: trainCounts[folder] || 0,
      support: s.support,
      predicted: s.predicted,
      precision,
      recall,
      f1,
      insufficient: s.support < MIN_TEST_SUPPORT
    };
  }).sort((a, b) => b.support - a.support || a.folder.localeCompare(b.folder));

  // Macro-F1 over folders that have test messages
  const withSupport = perFolder.filter(f => f.support > 0);
  const macroF1 = withSupport.length
    ? withSupport.reduce((sum, f) => sum + f.f1, 0) / withSupport.length
    : 0;

  // What matters to the user: "if I move everything >= threshold, how often
  // is it wrong?" -> coverage and precision above each threshold
  const thresholds = EVAL_THRESHOLDS.map(threshold => {
    const above = testResults.filter(r => r.confidence >= threshold);
    const aboveCorrect = above.filter(r => r.predicted === r.actual).length;
    return {
      threshold,
      count: above.length,
      coverage: total ? above.length / total : 0,
      precision: above.length ? aboveCorrect / above.length : null
    };
  });

  const topConfusions = Object.entries(confusions)
    .map(([key, count]) => {
      const [actual, predicted] = key.split('\u0000');
      return { actual, predicted, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_REPORTED_CONFUSIONS);

  return {
    holdoutPercent: HOLDOUT_PERCENT,
    testSize: total,
    trainSize: Object.values(trainCounts).reduce((sum, n) => sum + n, 0),
    accuracy: total ? correct / total : 0,
    macroF1,
    defaultThreshold: DEFAULT_CONFIDENCE_THRESHOLD,
    thresholds,
    perFolder,
    topConfusions,
    minTestSupport: MIN_TEST_SUPPORT
  };
}

// Render an evaluation report (with model metadata) as Markdown
function evaluationToMarkdown(meta, accountName = '') {
  const report = meta && meta.evaluation;
  if (!report) return 'No evaluation report for this model (train it again with version 3.0 or later).';

  const pct = value => (value === null || value === undefined ? '–' : `${(value * 100).toFixed(1)}%`);
  const cell = text => String(text).replace(/\|/g, '\\|');
  const lines = [];

  lines.push(`## Evaluation report${accountName ? ` — ${cell(accountName)}` : ''}`);
  lines.push('');
  lines.push(`- Algorithm: ${meta.algorithmType || '?'} · features: ${meta.features}`);
  lines.push(`- Trained: ${meta.trainedAt || '?'} · messages: ${meta.messagesUsed}`);
  lines.push(`- Hold-out: ${report.holdoutPercent}% → ${report.testSize} test messages, evaluation model trained on ${report.trainSize}`);
  lines.push(`- **Accuracy: ${pct(report.accuracy)}** · macro-F1: ${pct(report.macroF1)}`);
  lines.push('');
  lines.push('### Confidence threshold');
  lines.push('');
  lines.push('| Threshold | Coverage | Messages | Precision above threshold |');
  lines.push('|---:|---:|---:|---:|');
  for (const t of report.thresholds) {
    const mark = t.threshold === report.defaultThreshold ? ' ◀' : '';
    lines.push(`| ≥ ${t.threshold}%${mark} | ${pct(t.coverage)} | ${t.count} | ${pct(t.precision)} |`);
  }
  lines.push('');
  lines.push('### Top confusions (actual → predicted)');
  lines.push('');
  if (report.topConfusions.length === 0) {
    lines.push('None.');
  } else {
    lines.push('| Actual folder | Predicted folder | Count |');
    lines.push('|---|---|---:|');
    for (const c of report.topConfusions) {
      lines.push(`| ${cell(c.actual)} | ${cell(c.predicted)} | ${c.count} |`);
    }
  }
  lines.push('');
  lines.push(`### Per folder (⚠ = fewer than ${report.minTestSupport} test messages)`);
  lines.push('');
  lines.push('| Folder | Train | Test | Precision | Recall | F1 |');
  lines.push('|---|---:|---:|---:|---:|---:|');
  for (const f of report.perFolder) {
    lines.push(`| ${cell(f.folder)}${f.insufficient ? ' ⚠' : ''} | ${f.trainCount} | ${f.support} | ${pct(f.precision)} | ${pct(f.recall)} | ${pct(f.f1)} |`);
  }
  return lines.join('\n');
}

// Let the event loop run (keeps the UI and progress messages responsive
// during long synchronous loops)
function yieldToEventLoop() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// ============================================================================
// TRAINING
// ============================================================================

// Training function
// options.includeBody (default true): train on sender + subject + body;
// false trains on sender + subject only (much faster, no getFull() calls)
// options.evaluate (default true): hold-out evaluation. In the same pass a
// second "evaluation" classifier is trained on ~80% of the messages and then
// tested on the other ~20%; the saved production model uses 100%.
async function trainModel(account, selectedFolders, algorithmType = ALGORITHM_TYPES.NAIVE_BAYES, options = {}) {
  try {
    const includeBody = options.includeBody !== false;
    const evaluate = options.evaluate !== false;
    const features = includeBody ? FEATURE_SETS.HEADERS_BODY : FEATURE_SETS.HEADERS;

    // Create classifier based on selected algorithm
    const classifier = createClassifier(algorithmType);
    const evalClassifier = evaluate ? createClassifier(algorithmType) : null;
    const testSet = [];        // held-out messages: { text, folder }
    const evalTrainCounts = {}; // folder -> messages used to train evalClassifier
    console.log(`Training with algorithm: ${algorithmType}, features: ${features}`);
    
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
          // list() returns headers only: fetch the bodies of this page in parallel
          const bodies = includeBody
            ? await mapWithConcurrency(page.messages, BODY_FETCH_CONCURRENCY, m => getMessageBodyText(m.id))
            : [];

          for (const [messageIndex, message] of page.messages.entries()) {
            try {
              const fullText = buildMessageText(message, bodies[messageIndex] || '');
              classifier.train(fullText, folderPath);
              if (evaluate) {
                if (isHoldOutMessage(message, folderPath)) {
                  testSet.push({ text: fullText, folder: folderPath });
                } else {
                  evalClassifier.train(fullText, folderPath);
                  evalTrainCounts[folderPath] = (evalTrainCounts[folderPath] || 0) + 1;
                }
              }
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
    
    // Hold-out evaluation (read-only): predict the test set with the
    // evaluation classifier, which never saw those messages
    let evaluation = null;
    if (evaluate && testSet.length > 0 && Object.keys(evalTrainCounts).length > 0) {
      if (typeof evalClassifier.finalizeTraining === 'function') {
        browser.runtime.sendMessage({ type: 'evaluation-progress', current: 0, total: testSet.length });
        await yieldToEventLoop();
        evalClassifier.finalizeTraining();
      }
      const testResults = [];
      for (const [testIndex, testItem] of testSet.entries()) {
        const prediction = evalClassifier.predictWithConfidence(testItem.text);
        testResults.push({ actual: testItem.folder, predicted: prediction.folder, confidence: prediction.confidence });
        if (testIndex % 250 === 0 || testIndex === testSet.length - 1) {
          browser.runtime.sendMessage({ type: 'evaluation-progress', current: testIndex + 1, total: testSet.length });
          await yieldToEventLoop();
        }
      }
      evaluation = computeEvaluation(testResults, evalTrainCounts);
      console.log(`Evaluation: accuracy ${(evaluation.accuracy * 100).toFixed(1)}% on ${evaluation.testSize} held-out messages`);
    }
    
    // Save trained model with its metadata
    await saveModel(account.id, classifier, {
      algorithmType,
      features,
      trainedAt: new Date().toISOString(),
      messagesUsed: processedMessages,
      evaluation
    });
    
    // Note: the folder selection is saved by the Training tab (all folders
    // with their checkbox state); training must not overwrite it
    
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
      algorithm: algorithmType,
      features,
      evaluation
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
    
    // Use the same feature set the model was trained with; the body is
    // fetched and cleaned here exactly as in training
    const features = classifier.meta?.features || FEATURE_SETS.HEADERS;
    console.log('Using algorithm:', classifier.algorithmType, 'features:', features);

    const bodyText = features === FEATURE_SETS.HEADERS_BODY
      ? await getMessageBodyText(message.id)
      : '';
    const fullText = buildMessageText(message, bodyText);
    
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
// Returns [{path, selected}] of the saved selection (null if never saved);
// used by Archive/Review to list target folders (they keep selected ones)
async function getSavedFolders(accountId) {
  const saved = await loadFolderStructure(accountId);
  if (!saved) return null;
  return Object.entries(saved.selection).map(([path, selected]) => ({ path, selected }));
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
  VERSION: browser.runtime.getManifest().version,
  
  // Constants
  ALGORITHM_TYPES,
  FEATURE_SETS,
  
  // Training
  trainModel,
  
  // Classification
  classifyMessage,
  mapWithConcurrency,
  BODY_FETCH_CONCURRENCY,
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
  getModelMeta,
  evaluationToMarkdown,
  hasTrainedModel,
  deleteModel,
  getModelAlgorithm
};

console.log('Email Archive ML Assistant loaded:', window.emailArchive.VERSION);
console.log('Available functions:', Object.keys(window.emailArchive));
