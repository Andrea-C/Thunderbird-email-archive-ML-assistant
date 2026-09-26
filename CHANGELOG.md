# Changelog

All notable changes to the Email Archive ML Assistant extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.0-beta] - Unreleased

### Fixed

- **Folder selection not remembered**: deselected ("deprecated") folders came back checked after every training. Training overwrote the saved selection with a list of paths in a different format, Start Training saved only the checked folders, and Select All / Deselect All saved a stale state. The selection is now stored per account as `{version: 2, selection: {path: true|false}}` with every folder of the tree, and is only written by the Training tab. Only folders never seen before get the default (checked, system folders unchecked). The previous format is still read: the folders used in the last training are restored as checked, all others unchecked.
- **Training never saw the message body** (R3-4): `messages.list()` returns headers only, so every model was trained on sender + subject, while the Review tab classified with the body. Training and classification now build the text with the same shared code.

### Added

- **Hold-out evaluation report** (R3-5): every training also measures the model. About 20% of the messages (chosen by a hash of the Message-ID, so the split is identical on every run) are kept out of a second "evaluation" model trained in the same pass; that model then predicts them. The saved model is still trained on 100%. Report: accuracy, macro-F1, coverage and precision above confidence thresholds 50-95% (80% highlighted), top 20 confusions (actual → predicted), per-folder precision/recall/F1 with train/test counts (⚠ fewer than 5 test messages). Shown in the Training tab after training and via a "Report" button per model; accuracy shown in the Trained Models list; "Copy report as Markdown" button. Stored in the model metadata.
- **Message body in training** (default on): Training tab option "Include message body". Bodies are fetched with `messages.getFull()` (8 in parallel), quoted replies/signatures are dropped (forwarded content is kept, text attachments are ignored, HTML-only mails are converted keeping word boundaries), text is truncated to 2,000 characters. Unchecking it trains on sender + subject only (fast).
- **Model metadata** (`modelMeta_<accountId>_<algorithm>`): feature set, training date, messages used, model size. Shown in the Trained Models list. Classification always uses the feature set the model was trained with; models trained before 3.0 are treated as sender + subject.

### Changed

- **Parallel classification**: Archive and Review tabs classify 8 messages at a time (body models need one `getFull()` per message; sequential classification of 564 Inbox messages took ~3 minutes). Progress shown as "Classifying: n / total". Concurrent calls share a single model load.
- **Tokenizer** ignores pure numbers (order IDs, dates, amounts) and tokens longer than 40 characters, to keep the vocabulary manageable with bodies.

- **Extension renamed** to "Email Archive ML Assistant"
- **Version**: `manifest.json` now `version: 3.0.0` (Mozilla requires a purely numeric `version`; Thunderbird rejects `version_name`, so the beta status is tracked here and in git tags)

---

## [2.0.0-beta] - 2025-12-02

### Fixed

- **Duplicate Event Listeners**: Merged two `DOMContentLoaded` event listeners in `archive.js` that were causing duplicate handlers and potential unexpected behavior
- **Missing CSS Reference**: Removed broken reference to non-existent `train.css` file in `train.html`
- **Function Scope Issue**: Fixed `loadAccounts()` function scope in `archive.js` - moved to module scope so it's accessible from `visibilitychange` event listener
- **Folder Selection Persistence**: Fixed folder selection save logic in `train.js` to include all folders (not just leaf folders), preserving parent folder selection states across sessions
- **Dynamic Confidence Threshold**: Confidence threshold slider now dynamically updates the Target Folder column styling in real-time without requiring re-classification
- **Selection Persistence on Sort**: Email selection checkboxes are now preserved when sorting the message table by clicking column headers
- **Column Resizer Duplication**: Fixed potential duplicate column resizers when table is re-rendered

### Added

- **Manual Target Folder Override**: Users can now click on any Target Folder cell to manually select or change the destination folder
  - Autocomplete dropdown with all available folders from the trained model
  - Type-to-filter functionality for quick folder search
  - Keyboard navigation (Arrow keys, Enter, Escape)
  - Visual indicator (✎ icon + blue italic text) for manually changed folders
  - Manually set folders are always included in move operations (bypass confidence threshold)
  - Classification skips messages with manually set folders to preserve user's choice

- **TF-IDF Naive Bayes Algorithm**: New improved classification algorithm with word importance weighting
  - TF-IDF (Term Frequency-Inverse Document Frequency) weights words by their discriminative power
  - Common words get lower weight, unique folder-specific words get higher weight
  - Expected accuracy improvement of 5-10% over basic Naive Bayes
  - Set as the recommended default algorithm

- **Algorithm Selection**: Users can now choose between classification algorithms in the Training page
  - Radio button selection between "SVM" (best accuracy), "TF-IDF Naive Bayes" (recommended), and "Naive Bayes" (basic)
  - Algorithm type is stored with the model and displayed in the Trained Models list
  - Classification automatically uses the algorithm the model was trained with

- **SVM (Support Vector Machine) Algorithm**: New highest-accuracy classification algorithm
  - Linear SVM with Stochastic Gradient Descent (SGD) optimization
  - One-vs-All multi-class classification strategy
  - TF-IDF feature vectors with L2 normalization
  - Expected accuracy improvement of 10-15% over basic Naive Bayes
  - Memory-optimized for large mailboxes (60k+ emails)
    - Limited vocabulary to top 5000 words
    - Sparse weight storage (only non-zero values)
    - Online training (one document at a time)

- **Multiple Models per Account**: Train and store different algorithms for the same account
  - Each algorithm creates a separate model (no more overwriting)
  - Models are stored as `model_accountId_algorithmType`
  - All models displayed separately in the Trained Models list
  - Delete individual algorithm models independently

- **Algorithm Selection at Classification Time**: Choose which model to use when classifying
  - New algorithm dropdown in the Archive page (next to account selector)
  - Dropdown shows all available trained algorithms for selected account
  - Classification uses the selected algorithm's model
  - Compare results by switching between different algorithms

- **Folder Review Mode**: New tab to analyze folder content for misplaced emails
  - Select any trained folder to review its content
  - ML classifies all emails and suggests where they should be
  - Highlights emails where prediction differs from current folder
  - Filter to show only potential misplacements
  - Confidence threshold slider to focus on low-confidence classifications
  - Bulk move emails to suggested folders or custom destinations
  - Statistics showing total, misplaced, and correctly placed counts

### Changed

- **Column Order**: Reorganized Archive page table columns for better usability. New order: Checkbox → Confidence → Target Folder → From → Subject → Date
- **Default Sort**: Messages are now sorted by Date descending (most recent first) by default when loading Inbox
- **Select All Checkbox**: Added intelligent state management (checked/unchecked/indeterminate) based on individual row selections

---

## [1.0.0] - 2024-12-01

### Added

#### Training Module
- Account selection dropdown to choose email accounts for training
- Hierarchical folder tree display with checkboxes for folder selection
- Automatic selection of user-created folders and exclusion of system folders (Inbox, Sent, Drafts, Trash, Junk, Templates, Archives)
- "Select All" and "Deselect All" buttons for bulk folder selection
- Folder selection persistence - remembers user's folder choices across sessions
- Training progress display showing folders and messages processed
- IMAP folder synchronization status during training
- Trained models list with delete functionality
- Naive Bayes classifier implementation with Laplace smoothing
- Model storage using Thunderbird's `browser.storage.local` API

#### Archive Module
- Account dropdown showing only accounts with trained models
- Refresh button to update account list
- Confidence threshold slider (0-100%) to filter low-confidence predictions
- Message table displaying Inbox emails with Date, From, Subject columns
- "Classify Selected" button to run ML classification on selected messages
- "Move Selected" button to move classified emails to predicted folders
- Confidence score display with color coding:
  - Green: ≥80% confidence
  - Orange: ≥50% confidence  
  - Red: <50% confidence
- Low-confidence predictions displayed in red in Target Folder column
- Automatic skipping of low-confidence messages during move operation
- Status messages showing move results including skipped message counts
- Column sorting by clicking headers
- Column resizing via drag handles
- Select All checkbox for bulk message selection

#### User Interface
- Menu integration under Tools → "Email Archive ML Assistant"
- Tab-based interface with Training and Archive tabs
- Clean, modern styling with system fonts
- Responsive table layout with overflow handling

#### Technical Features
- Thunderbird WebExtension manifest v2
- Permissions: accountsRead, accountsFolders, messagesRead, messagesMove, storage, menus
- Background script architecture for ML operations
- Message pagination support for large inboxes
- Feature extraction from email headers and body text
- Email address and domain extraction for improved classification

