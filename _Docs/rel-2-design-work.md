# Release 2.0 - Design Work

This document captures the brainstorming and design decisions for Release 2.0 of the Email Archive ML Assistant.

---

## Table of Contents

1. [Organize Folders Content](#1-organize-folders-content)
2. [Improve Classification Model](#2-improve-classification-model)
3. [Change Target Folder](#3-change-target-folder)
4. [Implementation Priority](#4-implementation-priority)

---

## 1. Organize Folders Content

### Problem Statement

The classification model is trained on existing folder content. However, manual archiving over time has introduced inconsistencies:
- Similar emails stored in different folders
- Archiving criteria changed over time
- User forgot previous decisions for similar emails

These inconsistencies ("noise" in training data) reduce model accuracy.

### Goal

Provide users with tools to review and reorganize previously archived emails, improving training data quality.

### Proposed Solutions

#### Option A: Folder Content Review Mode

Add a new tab or mode: **"Review Folders"**

**Workflow:**
1. User selects an account and a folder to review
2. System displays all emails in that folder
3. For each email, the system shows:
   - Email details (From, Subject, Date)
   - ML prediction of where this email "should" be (using existing model)
   - Confidence score
4. Emails where predicted folder ≠ current folder are highlighted as "potential misplacements"
5. User can select and move misplaced emails to the suggested folder (or another folder)

**Pros:**
- Simple to understand and implement
- User reviews one folder at a time
- Clear visual feedback

**Cons:**
- Can be tedious for large mailboxes
- Requires existing trained model to make suggestions

#### Option B: Cross-Folder Similarity Analysis

**Workflow:**
1. System analyzes all emails across all trained folders
2. Identifies "similar" emails that are in different folders
3. Presents groups of similar emails to user
4. User decides which folder is correct for each group
5. Bulk move to consolidate

**Pros:**
- Proactively finds inconsistencies
- Batch processing of similar items

**Cons:**
- More complex to implement
- Requires similarity algorithm (cosine similarity, Jaccard, etc.)
- Could surface many false positives

#### Option C: Confidence-Based Folder Audit

**Workflow:**
1. After training, system internally classifies all training emails
2. Flags emails where model confidence is low OR predicted folder differs from actual folder
3. Presents a "Cleanup List" sorted by confidence (lowest first)
4. User reviews and corrects

**Pros:**
- Focuses attention on problematic emails
- Uses existing model infrastructure
- Prioritizes by impact (low confidence = high value fix)

**Cons:**
- Requires re-classifying entire training set
- Some "mismatches" may be intentional

### Recommendation

**Start with Option C (Confidence-Based Folder Audit)** as it:
- Leverages existing ML infrastructure
- Focuses user effort on highest-impact corrections
- Doesn't require new algorithms
- Can be implemented as a feature in the Training tab

**Future enhancement:** Add Option B for power users who want deeper analysis.

### UI/UX Design (Option C)

```
┌─────────────────────────────────────────────────────────────────┐
│  Training  │  Archive  │  Review Folders                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Account: [dropdown]              Folder: [dropdown]            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Show: ○ All emails  ○ Potential misplacements only      │   │
│  │ Threshold: [slider 0-100%] - Show if confidence < X%    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Analyze Folder]                                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ □ │ Conf  │ Suggested     │ From      │ Subject   │ Date │  │
│  ├───┼───────┼───────────────┼───────────┼───────────┼──────┤  │
│  │ □ │ 35%   │ /Work/Reports │ john@...  │ Q4 Report │ ...  │  │
│  │ □ │ 42%   │ /Personal     │ jane@...  │ Dinner    │ ...  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Move to Suggested] [Move to...▼] [Keep in Current Folder]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Improve Classification Model

### Current Implementation

**Algorithm:** Naive Bayes with Laplace smoothing

**Features extracted:**
- Tokenized words (lowercased, min length 3)
- Email addresses
- Sender domains

**Limitations of Naive Bayes:**
- Assumes feature independence (unrealistic for text)
- Treats all words equally (no weighting by importance)
- No semantic understanding
- Sensitive to word frequency imbalances

### Algorithm Comparison

| Algorithm | Typical Accuracy | vs Naive Bayes | Training Speed | Complexity |
|-----------|-----------------|----------------|----------------|------------|
| **Naive Bayes** (current) | 75-80% | Baseline | Very Fast | Low |
| **TF-IDF Naive Bayes** | 80-85% | +5-10% | Very Fast | Low |
| **SVM** | 85-92% | +10-15% | Medium | Medium |
| **Hierarchical** | 82-88% | +7-12% | Fast | Medium |
| **Ensemble** | 87-93% | +12-18% | Slow | High |
| **Neural Network** | 88-95% | +13-20% | Very Slow | High |

### Detailed Algorithm Analysis

#### Option A: TF-IDF Weighted Naive Bayes

**Improvement:** Weight words by Term Frequency-Inverse Document Frequency (TF-IDF)

**How it works:**
- Common words across all folders (e.g., "the", "email") get low weight
- Words unique to specific folders get high weight
- Improves discrimination between folders

**Expected improvement:** +5-10% accuracy over basic Naive Bayes
**Complexity:** Low - enhances existing implementation
**Dependencies:** None

#### Option B: Support Vector Machine (SVM)

**How it works:**
- Finds optimal hyperplane to separate classes in high-dimensional space
- Uses kernel functions to handle non-linear boundaries
- Maximizes margin between classes for better generalization

**Why SVM is better for text:**
- Designed for high-dimensional sparse data (which text is)
- More robust to outliers
- Better handles overlapping classes (similar folder content)

**Expected improvement:** +10-15% accuracy over basic Naive Bayes
**Complexity:** Medium - requires SVM implementation
**Dependencies:** ml.js library or custom implementation

**SVM vs TF-IDF Naive Bayes:**
- SVM typically **5-10% better** than TF-IDF Naive Bayes
- Improvement more pronounced when:
  - Folders have similar content (ambiguous classification)
  - Larger training datasets (1000+ emails)
  - Many folders (10+)

#### Option C: Multi-Step Hierarchical Classification

**How it works:**
1. First classifier: Broad categories (Work, Personal, Finance, etc.)
2. Second classifier: Sub-folders within each category
3. Confidence is product of both steps

**Example:**
```
Email → [Classifier 1] → "Work" (90%)
     → [Classifier 2 for Work] → "Work/Projects/Alpha" (85%)
     → Final confidence: 76.5%
```

**Expected improvement:** +7-12% for deep folder structures
**Complexity:** Medium - requires folder hierarchy analysis
**Dependencies:** None (uses existing classifiers)

#### Option D: Ensemble Methods (Voting)

**How it works:**
- Train multiple different classifiers
- Each classifier votes on the folder
- Final prediction = majority vote or weighted average

**Classifiers to combine:**
1. Naive Bayes
2. TF-IDF Naive Bayes
3. SVM

**Expected improvement:** +12-18% (combines strengths, reduces weaknesses)
**Complexity:** High - multiple models to train and manage
**Dependencies:** All component algorithms

#### Option E: Neural Network with TensorFlow.js

**How it works:**
- Embed words into vectors
- Feed through neural network layers
- Output probability distribution over folders

**Expected improvement:** +13-20% (highest potential)
**Complexity:** Very High - requires TensorFlow.js
**Dependencies:** TensorFlow.js (~1MB library)
**Drawback:** Slow training, overkill for smaller mailboxes

---

### NEW FEATURE: Multi-Algorithm Selection & Comparison

Based on discussion, we will implement **multiple classification algorithms** and let users:
1. **Select** their preferred algorithm
2. **Compare** results between algorithms
3. **Switch** algorithms without losing data

#### User Interface Design

**Training Page - Algorithm Selection:**
```
┌─────────────────────────────────────────────────────────────────┐
│  Classification Algorithm                                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ○ Naive Bayes (Fast, Basic)                               │  │
│  │ ○ TF-IDF Naive Bayes (Fast, Improved) ← Recommended       │  │
│  │ ○ SVM - Support Vector Machine (Medium, Best Accuracy)    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Start Training]                                                │
└─────────────────────────────────────────────────────────────────┘
```

**Archive Page - Algorithm Comparison Mode:**
```
┌─────────────────────────────────────────────────────────────────┐
│  □ Enable Comparison Mode                                        │
│                                                                  │
│  Compare: [TF-IDF Naive Bayes ▼] vs [SVM ▼]                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ □ │ TF-IDF        │ SVM           │ From    │ Subject    │   │
│  │   │ Pred  │ Conf  │ Pred  │ Conf  │         │            │   │
│  ├───┼───────┼───────┼───────┼───────┼─────────┼────────────┤   │
│  │ □ │/Work  │ 75%   │/Work  │ 89%   │john@... │ Report     │   │
│  │ □ │/Home  │ 62%   │/Family│ 78%   │jane@... │ Dinner     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Agreement: 85% | SVM higher confidence: 73% of cases            │
└─────────────────────────────────────────────────────────────────┘
```

#### Storage Structure

Each algorithm creates a separate model:
```
Storage Keys:
- model_naive_<accountId>      → Naive Bayes model
- model_tfidf_<accountId>      → TF-IDF Naive Bayes model  
- model_svm_<accountId>        → SVM model
- model_active_<accountId>     → Currently selected algorithm
```

#### Implementation Phases

**Phase 1: Algorithm Selection**
1. Implement TF-IDF Naive Bayes as second option
2. Add algorithm selector to Training page
3. Store algorithm preference per account

**Phase 2: SVM Implementation**
1. Implement SVM classifier (using ml.js or custom)
2. Add as third option in Training page
3. Performance testing and optimization

**Phase 3: Comparison Mode**
1. Allow training multiple algorithms simultaneously
2. Add comparison view in Archive page
3. Show agreement/disagreement statistics

### TF-IDF Implementation Sketch

```javascript
class TFIDFNaiveBayesClassifier {
  constructor() {
    // Existing Naive Bayes properties
    this.wordCounts = {};
    this.folderCounts = {};
    this.totalDocs = 0;
    this.vocabulary = new Set();
    
    // New: Document frequency for IDF
    this.documentFrequency = {}; // word -> number of docs containing word
    this.idfScores = {};         // word -> IDF score (calculated after training)
  }
  
  // Track document frequency during training
  train(text, folder) {
    const words = this.tokenize(text);
    const uniqueWords = new Set(words); // Count each word once per document
    
    // ... existing training code ...
    
    // Track document frequency
    for (const word of uniqueWords) {
      this.documentFrequency[word] = (this.documentFrequency[word] || 0) + 1;
    }
  }
  
  // Calculate IDF scores after all training is complete
  finalizeTraining() {
    for (const word of this.vocabulary) {
      const df = this.documentFrequency[word] || 1;
      // IDF = log(total documents / documents containing word)
      this.idfScores[word] = Math.log((this.totalDocs + 1) / (df + 1)) + 1;
    }
  }
  
  // Weight word probability by IDF
  calculateFolderScore(words, folder) {
    let score = Math.log(this.folderCounts[folder] / this.totalDocs); // Prior
    
    for (const word of words) {
      const idf = this.idfScores[word] || 1;
      const wordCount = (this.wordCounts[folder]?.[word] || 0) + 1; // Laplace
      const totalWords = this.folderTotalWords[folder] + this.vocabulary.size;
      const probability = wordCount / totalWords;
      
      // Apply TF-IDF weighting
      score += Math.log(probability) * idf;
    }
    
    return score;
  }
}
```

### SVM Implementation Sketch

```javascript
// Using ml.js library or custom implementation
class SVMClassifier {
  constructor() {
    this.models = {};        // One SVM per folder (one-vs-all)
    this.vocabulary = [];    // Word list for vectorization
    this.idfScores = {};     // TF-IDF for feature weighting
  }
  
  // Convert text to TF-IDF feature vector
  textToVector(text) {
    const words = this.tokenize(text);
    const vector = new Array(this.vocabulary.length).fill(0);
    
    // Calculate TF
    const wordCounts = {};
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
    
    // Apply TF-IDF
    for (let i = 0; i < this.vocabulary.length; i++) {
      const word = this.vocabulary[i];
      const tf = wordCounts[word] || 0;
      const idf = this.idfScores[word] || 1;
      vector[i] = tf * idf;
    }
    
    return vector;
  }
  
  // Train one-vs-all SVMs
  train(documents, folders) {
    // Build vocabulary and IDF scores first
    this.buildVocabulary(documents);
    
    // Get unique folders
    const uniqueFolders = [...new Set(folders)];
    
    // Train one SVM per folder
    for (const folder of uniqueFolders) {
      const labels = folders.map(f => f === folder ? 1 : -1);
      const vectors = documents.map(doc => this.textToVector(doc));
      
      this.models[folder] = new SVM(); // ml.js SVM
      this.models[folder].train(vectors, labels);
    }
  }
  
  // Predict folder with confidence
  predictWithConfidence(text) {
    const vector = this.textToVector(text);
    let bestFolder = null;
    let bestScore = -Infinity;
    const scores = {};
    
    for (const [folder, model] of Object.entries(this.models)) {
      const score = model.predictScore(vector);
      scores[folder] = score;
      if (score > bestScore) {
        bestScore = score;
        bestFolder = folder;
      }
    }
    
    // Convert scores to probabilities using softmax
    const expScores = Object.values(scores).map(s => Math.exp(s));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    const confidence = Math.exp(bestScore) / sumExp * 100;
    
    return { folder: bestFolder, confidence };
  }
}
```

---

## 3. Change Target Folder

### Problem Statement

After classification, users cannot correct wrong predictions without re-classifying. Users need ability to manually override the Target Folder before moving.

### Goal

Allow users to edit the Target Folder cell with an autocomplete dropdown showing all available folders.

### UI/UX Design

**Behavior:**
1. User clicks on a Target Folder cell (or an edit icon next to it)
2. Cell transforms into a dropdown/combobox
3. Dropdown shows all folders from the trained model
4. As user types, list filters to matching folders
5. User selects a folder (click or Enter)
6. Cell updates with new folder
7. "Move Selected" moves to the manually chosen folder

**Visual Design:**
```
Before click:
┌─────────────────────┐
│ /Work/Projects      │
└─────────────────────┘

After click:
┌─────────────────────┐
│ /Work/Pro           │  ← User typing
├─────────────────────┤
│ /Work/Projects      │  ← Filtered results
│ /Work/Proposals     │
│ /Personal/Profile   │
└─────────────────────┘
```

### Implementation Approach

#### HTML Structure
```html
<td class="col-target">
  <div class="target-folder-container">
    <span class="target-folder-display">/Work/Projects</span>
    <input type="text" class="target-folder-input" style="display:none">
    <div class="folder-dropdown" style="display:none">
      <!-- Folder options populated dynamically -->
    </div>
  </div>
</td>
```

#### Key Functions

```javascript
// Get all folders for dropdown
async function getFolderOptions(accountId) {
  const background = await browser.runtime.getBackgroundPage();
  const savedFolders = await background.emailArchive.getSavedFolders(accountId);
  return savedFolders.map(f => f.path);
}

// Filter folders by search term
function filterFolders(folders, searchTerm) {
  const term = searchTerm.toLowerCase();
  return folders.filter(f => f.toLowerCase().includes(term));
}

// Activate edit mode on cell click
function activateTargetFolderEdit(cell, messageIndex) {
  const display = cell.querySelector('.target-folder-display');
  const input = cell.querySelector('.target-folder-input');
  const dropdown = cell.querySelector('.folder-dropdown');
  
  display.style.display = 'none';
  input.style.display = 'block';
  input.value = display.textContent;
  input.focus();
  dropdown.style.display = 'block';
  
  // Populate dropdown with all folders
  populateDropdown(dropdown, allFolders);
}

// Handle folder selection
function selectFolder(messageIndex, folderPath) {
  messages[messageIndex].predictedFolder = folderPath;
  messages[messageIndex].manuallySet = true; // Flag for tracking
  updateTable();
}
```

### Edge Cases

1. **Empty Target Folder:** Allow editing even if not yet classified
2. **Invalid folder typed:** Only allow selection from dropdown, ignore invalid input
3. **Keyboard navigation:** Arrow keys to navigate dropdown, Enter to select, Escape to cancel
4. **Click outside:** Close dropdown and revert to display mode

### Visual Indicators

- **ML Predicted:** Normal text color
- **Manually Changed:** Italic or different color (e.g., blue) to indicate user override
- **Low Confidence + Manually Changed:** Clear visual that user has corrected a low-confidence prediction

---

## 4. Implementation Priority

### Recommended Order

| Priority | Feature | Effort | Impact | Dependencies |
|----------|---------|--------|--------|--------------|
| 1 | Change Target Folder | Medium | High | None |
| 2 | TF-IDF Naive Bayes + Algorithm Selection | Medium | High | None |
| 3 | SVM Implementation | Medium | High | ml.js or custom |
| 4 | Algorithm Comparison Mode | Medium | Medium | Multiple algorithms |
| 5 | Folder Review Mode (new tab) | High | High | Trained models |

### Rationale

1. **Change Target Folder first:** Immediate usability improvement, no backend changes, allows users to correct predictions manually

2. **TF-IDF + Algorithm Selection second:** 
   - Adds TF-IDF as improved algorithm option
   - Introduces algorithm selection UI in Training page
   - Foundation for multi-algorithm architecture

3. **SVM Implementation third:**
   - Adds the most accurate algorithm option
   - Leverages algorithm selection UI from step 2
   - Significant accuracy improvement (+5-10% over TF-IDF)

4. **Algorithm Comparison Mode fourth:**
   - Allows side-by-side comparison of algorithms
   - Helps users choose the best algorithm for their data
   - Shows agreement/disagreement statistics

5. **Folder Review Mode last:**
   - Separate tab for reviewing folder content
   - Requires good models to make useful suggestions
   - Biggest UI implementation effort

### Release 2.0 Scope

**Minimum Viable Release:**
- [ ] Change Target Folder (manual override)
- [ ] TF-IDF Naive Bayes algorithm
- [ ] Algorithm selection in Training page

**Full Release:**
- [ ] All of the above, plus:
- [ ] SVM algorithm
- [ ] Folder Review Mode tab

**Future (2.x):**
- [ ] Algorithm Comparison Mode
- [ ] Ensemble methods
- [ ] Hierarchical classification

---

## Open Questions - RESOLVED

1. **Folder Review Mode:** Should this be a separate tab or integrated into Training tab?
   - **Answer:** Separate tab

2. **Model versioning:** When we improve the model, should we keep old models or auto-migrate?
   - **Answer:** Discard old model and train a new one. No migration needed.

3. **Performance:** For large mailboxes (10k+ emails), how do we handle analysis performance?
   - **Answer:** Current Naive Bayes handles 10K+ emails in few minutes. Not addressing performance optimization now.

4. **Undo:** Should we add undo functionality for moved emails?
   - **Answer:** No undo for now. Will consider in future releases.

---

## Next Steps

- [ ] Finalize scope for Release 2.0
- [ ] Implement Priority 1: Change Target Folder (manual override)
- [ ] Implement Priority 2: Multiple Classification Algorithms with user selection
- [ ] Implement Priority 3: Folder Review Mode (separate tab)
- [ ] Update CHANGELOG and documentation

