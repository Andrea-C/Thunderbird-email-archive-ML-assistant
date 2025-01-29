Below is a high-level, language-agnostic development plan for creating a Thunderbird extension that implements a machine learning–driven e-mail archiving feature, as described. This plan focuses on overall architecture and approach rather than a specific programming language or machine learning framework.

---

## 1. Project Setup and Environment

1. **Understand Thunderbird’s Extension Model**  
   - Identify how modern Thunderbird extensions are created.  
   - Review the latest documentation for Thunderbird WebExtensions APIs, or if needed, legacy “MailExtensions” or “Experimental APIs” if the required functionality is not yet part of stable APIs.  
   - Confirm which version(s) of Thunderbird you aim to support.

2. **Directory Structure**  
   - Create a structured folder for the extension, e.g.:
     ```
     thunderbird-extension/
       ├─ manifest or install manifest (depending on Thunderbird version)
       ├─ background/ (scripts for background operations)
       ├─ content/ (UI scripts, HTML/XUL, CSS)
       ├─ models/ (directory where the trained models are stored)
       └─ utils/ (common utility methods, e.g., for ML, folder management)
     ```

3. **Permissions**  
   - Determine necessary permissions in Thunderbird (e.g., reading emails, accessing mail folders, moving/deleting messages, etc.)  
   - In your extension manifest, request the appropriate permissions to handle mail data, read folder lists, and manipulate messages.

---

## 2. Core Architecture

The extension can be divided into Two main modules:
1. **Model Training Module** (Tools menu → “Email Archive Assistant" → “Archive Model Training”)  
2. **Email Archiving Module** (Tools menu → “Email Archive Assistant" → “E-mail archive”)

They share some common subcomponents:

- **Mail Data Access Subcomponent**: Functions to read folders, emails (header + body), and other metadata from Thunderbird’s mail store.  
- **Model Manager Subcomponent**: Handles reading/writing the ML models, storing them on disk or another persistence mechanism.  
- **ML Training and Inference Subcomponent**: Contains the logic for training the model and classifying emails.

---

## 3. Data Flow for Model Training

1. **User Action**  
   - User opens “Tools” → “Archive Model Training.”  
   - A dialog or wizard is displayed that lets the user select a mailbox (e.g., an email account).

2. **Folder Enumeration**  
   - List all user-created folders in the mailbox, generating a path representation (`"mailbox/folder/subfolder/sub-subfolder"`).  
   - Exclude default folders (Inbox, Sent, Draft, Trash/Recycle Bin).  
   - Let the user confirm which folders to include/exclude if necessary.

3. **Data Extraction**  
   - For each included folder, gather message data:
     - From, To, CC, BCC (sender/recipient features)
     - Subject
     - Body text (full text)
     - Ignore attachments and images
   - The **target label** for each message is the folder path in which the message resides.

4. **Feature Engineering**  
   - Decide on the representation for textual data (Subject + Body). This can be:
     - Bag-of-words
     - TF-IDF
     - Word embeddings, etc.  
   - Create additional features from the message’s metadata (e.g. domain of sender, presence of certain keywords, etc.).

5. **Model Training**  
   - Pass the prepared dataset (features and labels) to the ML training pipeline.  
   - Train a classification model (e.g., a supervised multi-class classifier, because each folder is a distinct class).  
   - The resulting model is stored in an easily accessible format (e.g., a JSON-based model if it’s a simple structure, or a binary file if it’s a more complex ML library output).

6. **Model Storage**  
   - Save the model file as `model_<email-address>` in the `models/` directory of the extension or a designated Thunderbird extension data area.  
   - Ensure you can retrieve this model later during the archiving step.


### Traning page
The training windows should be a tab page as the it is the classify page, not a simple dialog window, because we need more space to include more elements.

The Training page should: 
- permit the user to get access to the models created 
- configure the training process
- show the traning progress


#### permit the user to get access to the models created
- list all the traning models that have been created 
- user can select a model and delete it

#### configure the training process
- the user select a mailbox
- the module list all the folders in the hierarchical tree with a check box to select the folders
- In the first run, all the folders are selected, but exclude the default folders (Inbox, Sent, Draft, Trash/Recycle Bin)
- The modules check if there is a JSON file with a previous selection of folders that should be used in the training
- the users can select/deselect the folders that should be used in the training
- the selected/unselected folders are saved in a dedicated JSON file

#### show the training process
When the training process starts
- A text box where the module write the number of folder processed and the number of total folder to process
- A text box where the module write the number of messages processed and the number of total messagges to process in the current processed folder

#### WARNING
the mailboxes are sync with IMAP Protocol.
Often the local replica of the folders, is not in sync and need times to be updated.
So, when the training process is started, for each folder that is opened to read the e-mail messages, 
- sync the folder
- show the the sync completion state
- wait the sync is completed
- train the model with the messages of the folder






---

## 4. E-mail Archiving Workflow

1. **User Action**  
   - User opens “Tools” → “E-mail archive.”  
   - A new tab or window is opened within Thunderbird.

2. **Mailbox Selection**  
   - In the new interface, list available mailboxes for which a trained model already exists.  
   - User selects one mailbox from the list.

3. **Inbox Message Display**  
   - The extension queries the selected mailbox’s Inbox folder.  
   - Display messages in a table/grid with columns:
     - **Select (checkbox)**
     - **From**
     - **Date**
     - **Target Folder** (initially empty)
     - **Subject**
     - **Confidence**

4. **Classification**  
   - When the user clicks “[Classify],” load the model for the mailbox (`model_<email-address>`).  
   - For each message currently listed:
     - Extract the same features used during training (From, Subject, Body, etc.).
     - Pass the features to the model’s inference method.
     - The model predicts the most likely target folder and confidence score.
     - The predicted folder name is placed in the “Target Folder” column.
     - The confidence score is placed in the “Confidence” column.
     - If the confidence score is below the set threshold, the text in the “Target Folder” column is displayed in red.

5. **User Review and Move**  
   - The user reviews the predictions; the user can edit or confirm the predicted folder.  
   - The user then selects the checkboxes for emails that should be moved.  
   - On clicking “[Move],” the extension moves the selected emails into their respective “Target Folder” only if the confidence score is equal to or higher than the confidence threshold.
   - A status message is displayed indicating how many messages were moved and how many were skipped due to low confidence.

6. **Cleanup**  
   - After the user closes the tab/window, the extension releases any memory used by the model and closes references.

   Archive page
3) In the Archive page, we need to add a Probability/Confidence score as limit: for each message, if the classification Probability is equal or greater of the Probability/Confidence limit, then the message will be displayed normally in the Target Folder column, otherwise the prediction will still be shown but in red color to indicate low confidence. To achieve this feature we need:
- a slider to set the Probability/Confidence Limit
- a test after the message classification to check the confidence level
- when moving messages, the function will:
  - skip messages that are not selected
  - skip messages that have confidence below the confidence threshold
  - show a status message indicating how many messages were skipped due to low confidence

The move operation will only process messages that are both:
1. Selected by the user (checkbox checked)
2. Have a confidence score equal to or higher than the confidence threshold

For messages with confidence below the threshold:
- The predicted folder will still be shown in the Target Folder column
- The text will be displayed in red to indicate low confidence
- These messages will be automatically skipped during the move operation
- A count of skipped messages will be shown in the status message after the move operation completes

---

## 5. Detailed Implementation Steps

### 5.1. Extension Manifest and Registration
1. **Manifest File**  
   - Define the extension’s name, version, permissions, and entry points.  
   - Register menu items for “Archive Model Training” and “E-mail archive.”

2. **Menu Item Creation**  
   - Use Thunderbird’s extension APIs to insert items under the “Tools” menu.  
   - Point each item to a specific function in your background or script logic.

### 5.2. UI Components
1. **Model Training Dialog**  
   - A simple form/wizard to:
     - Let user select the mailbox.
     - List user-created folders (check boxes or multi-select list).
     - Confirm to start training.
     - A text box where the module write the number of folder processed and the number of total folder to process
     - A text box where the module write the number of messages processed and the number of total messagges to process in the current processed folder
2. **Archiving Tab/Window**  
   - A tab with:
     - Mailbox selection dropdown.
     - A table/grid listing the Inbox emails with columns described.
     - Buttons for “[Classify]” and “[Move].”

### 5.3. Mail Data Access
1. **Folder Enumeration**  
   - Use Thunderbird’s MailFolder APIs to list all folders in the selected mailbox.  
   - Filter out known standard folders like “Inbox,” “Sent,” etc.
2. **Message Retrieval**  
   - Retrieve the messages in each user folder (for training) or in the Inbox (for classification).  
   - Use Thunderbird’s extension APIs to fetch headers, body, or to stream body content.

### 5.4. ML Training and Persistence
1. **Training Data Assembly**  
   - Convert each email into a feature vector or a textual representation.  
   - Map the user folder path to the target class label.
2. **Choose/Implement ML Algorithm**  
   - Could be a naive Bayes classifier, logistic regression, SVM, or a neural network approach—depending on complexity and available libraries.  
   - Implementation might be an external library or a custom-coded ML algorithm.
3. **Storing the Model**  
   - The final trained model is stored in `models/model_<email-address>` in a serialized format.  
   - Ensure you also store any label encodings or feature index mappings.

### 5.5. Classification Flow
1. **Feature Extraction for New Emails**  
   - For each new email in the Inbox, replicate the same feature extraction as was done during training.
2. **Model Inference**  
   - Load the model corresponding to `<email-address>`.  
   - Perform inference to get a predicted folder label and confidence score.  
   - Display the label in the “Target Folder” column and the confidence score in the “Confidence” column.
3. **User Adjustment**  
   - Optionally allow the user to override the predicted folder if it seems incorrect.
4. **Message Moving**  
   - Upon confirmation, call the Thunderbird message move API to place each selected message into the predicted/confirmed folder only if the confidence score is equal to or higher than the confidence threshold.

---

## 6. Data Structures and Storage

1. **Model File Format**  
   - If using a custom approach, store model data as JSON with relevant weights, word indices, or as a binary file from an external ML library.  
   - The key is consistent format so that your inference method can parse it.
2. **Metadata Storage**  
   - Optionally keep a small JSON with folder–class mappings to help decode folder paths into class indexes and vice versa.
3. **Handling Large Mailboxes**  
   - If the mailbox is very large, you may need an incremental or partial training approach (e.g., streaming training or sampling).  
   - Consider memory usage constraints when reading a large volume of emails.

---

## 7. Error Handling and Edge Cases

1. **No Model Found**  
   - If the user attempts to classify a mailbox without a model, show an error or prompt to train first.
2. **No Emails in Custom Folders**  
   - If certain user folders are empty, handle it gracefully (they might not provide meaningful training data).
3. **User Cancels Training**  
   - Provide a mechanism to cancel the training process and clean up any partial data.
4. **Model Accuracy**  
   - Some predictions may be wrong; ensure the user can manually override.  
   - Optionally store feedback for retraining or incremental improvement later.

---

## 8. Testing Plan

1. **Unit Tests**  
   - Test helper functions (folder enumeration, feature extraction, classification logic) in isolation.
2. **Integration Tests**  
   - Test end-to-end flow: from menu selection → folder selection → model training → classification → email movement.
3. **Performance Tests**  
   - Evaluate training time on large mailboxes.  
   - Ensure that classification runs quickly even on large Inboxes.
4. **User Acceptance Tests**  
   - Provide a testing scenario where a user with multiple custom folders sees accurate predictions.  
   - Validate that the UI steps are intuitive.

---

## 9. Deployment and Maintenance

1. **Packaging the Extension**  
   - Follow Thunderbird’s guidelines for packaging. This typically involves zipping your extension folder and possibly signing it.  
   - Ensure `manifest.json` or the relevant “mail extension” manifest is correct.
2. **Distribution**  
   - Optionally publish on Thunderbird Add-ons marketplace (if it meets all guidelines), or share privately within an organization.
3. **Updates and Model Improvements**  
   - Provide a way to update the extension.  
   - Allow re-training the model periodically, or let the user start a training session anytime to improve accuracy.
4. **Privacy and Security**  
   - Clearly document how mail data is used and stored.  
   - Make sure no personal data or models are uploaded externally without the user’s consent.

---

## 10. Potential Future Enhancements

1. **Incremental Learning**  
   - Each time the user corrects a folder prediction, store that feedback. Over time, retrain the model with corrected data.
2. **Multi-Account Model**  
   - If desired, unify data from multiple accounts into a single model or keep them separate for user convenience.
3. **Natural Language Processing**  
   - Use more advanced NLP pipelines to parse message content for improved classification.
4. **Attachment Analysis**  
   - If beneficial, consider analyzing attachment metadata (e.g., filenames, file types) to further refine classification (though the current requirements say to ignore attachments).
5. **Auto-Archive**  
   - Optionally automate archiving actions (e.g., an “auto-archive” feature) after classification if the user permits.

---

# Final Summary

By structuring your Thunderbird extension into clear modules for data access, model training, and classification, you can create a maintainable and user-friendly tool that learns from users’ existing folder structures and helps them quickly archive Inbox messages. The development plan above provides a roadmap for designing the UI, data handling, ML pipeline, and integration with Thunderbird’s APIs in a way that is adaptable to any ML library or programming language you choose.




---
# updated documentation: 
here are the features that have been added after the first development

## Traning page
The training windows should be a tab page as the it is the classify page, not a simple dialog window, because we need more space to include more elements.

The Training page should: 
- permit the user to get access to the models created 
- configure the training process
- show the traning progress


### permit the user to get access to the models created
- list all the traning models that have been created 
- user can select a model and delete it

### configure the training process
- the user select a mailbox
- the module list all the folders in the hierarchical tree with a check box to select the folders
- In the first run, all the folders are selected, but exclude the default folders (Inbox, Sent, Draft, Trash/Recycle Bin)
- The modules check if there is a JSON file with a previous selection of folders that should be used in the training
- the users can select/deselect the folders that should be used in the training
- the selected/unselected folders are saved in a dedicated JSON file

### show the training process
When the training process starts
- A text box where the module write the number of folder processed and the number of total folder to process
- A text box where the module write the number of messages processed and the number of total messagges to process in the current processed folder

### WARNING
the mailboxes are sync with IMAP Protocol.
Often the local replica of the folders, is not in sync and need times to be updated.
So, when the training process is started, for each folder that is opened to read the e-mail messages, 
- sync the folder
- show the the sync completion state
- wait the sync is completed
- train the model with the messages of the folder


Now let's make some improvements.

Training page
1) In the training page, the button to delete a model it's too wide because it occupies all the space between the model name and the right margin. Make it smaller. The size should be enough to contain the button label
2) In the traning page, add some space between the label of the model name and the button to delete the model

Now lets fix the Archive page:
- Reduce the size of the From column and Subject column and increase the size of the Target folder column, to have them more equally distributed
- Add a column with the Confidence value of the predicted folder
- Make the table be sortable by all the columns

Still need to fix the archive page:
1) the layout shoul be full width withing the window size and adapt to it
2) the column should share the available width
3) the select all check box, in the table title row is overlaped by the sort icon. please do not overlap
4) when press the classify selected, only the selected messages should be classified