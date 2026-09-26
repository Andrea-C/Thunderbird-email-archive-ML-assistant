# Email Archive ML Assistant

The objective of this application, which is used as an extension for Mozilla Thunderbird, is to assist the user in archiving messages from the inbox into various archive folders.
To achieve this, the application studies how previous messages have been archived, creates a Machine Learning model by analyzing the contents of archive folders, and uses this model to suggest the appropriate folder for archiving a new message.

The application was developed as an exercise to verify the feasibility of creating a functional application with the following constraints:
- The code must be written entirely by Artificial Intelligence.
- The code must use functions and APIs that are not part of the training data of the AI models used.

## Requirements
- Mozilla Thunderbird version 91.0 or higher
- Email accounts configured with IMAP protocol
- Existing folder structure with archived emails for training

## Installation

### First Installation

1. **Download the Extension**
   - Clone or download this repository to your local machine
   
2. **Package the Extension** (if not already packaged)
   
   **Option A: Use the build script (recommended)**
   ```bash
   python utils/build_xpi.py
   ```
   This creates an `.xpi` file in the `_builds` folder with timestamp naming.
   
   **Option B: Manual packaging**
   - Navigate to the project root folder
   - Select all files and folders (excluding `_Docs`, `.cursor`, `.git`, `utils`, and other development files)
   - Create a ZIP file containing: `manifest.json`, `background/`, `pages/`, `icons/`
   - Rename the ZIP file extension from `.zip` to `.xpi`

3. **Install in Thunderbird**
   - Open Thunderbird
   - Go to **Tools** → **Add-ons and Themes** (or press `Ctrl+Shift+A`)
   - Click the gear icon (⚙️) in the top-right corner
   - Select **Install Add-on From File...**
   - Navigate to and select the `.xpi` file
   - Click **Add** when prompted to confirm installation
   - The extension is now installed and ready to use

### Alternative: Install for Development

1. Open Thunderbird
2. Go to **Tools** → **Developer Tools** → **Debug Add-ons**
3. Click **Load Temporary Add-on...**
4. Navigate to the project folder and select `manifest.json`
5. The extension will be loaded temporarily (removed when Thunderbird restarts)

### Updating the Extension

1. Go to **Tools** → **Add-ons and Themes**
2. Find "Email Archive ML Assistant" in the list
3. Click the three-dot menu (⋮) next to the extension
4. Select **Remove** to uninstall the old version
5. Follow the installation steps above with the new `.xpi` file

> **Note:** Your trained models and folder selections are stored in Thunderbird's local storage and will persist across updates, unless you explicitly delete them.

### Uninstalling

1. Go to **Tools** → **Add-ons and Themes**
2. Find "Email Archive ML Assistant" in the list
3. Click the three-dot menu (⋮) next to the extension
4. Select **Remove**

## Usage

The application is divided into two parts:
- **Training:** where the Machine Learning model is created.
- **Archive:** where the model is used to suggest the archive folder and archive the message.

### Accessing the Extension

1. Open Thunderbird
2. Go to **Tools** menu
3. Click **Email Archive ML Assistant**

### Training

1. Select the **Training** tab
2. Choose an email account from the dropdown
3. Review the folder tree - user folders are selected by default, system folders are excluded
4. Modify the selection as needed using checkboxes or "Select All"/"Deselect All" buttons
5. Click **Start Training**
6. Wait for the training to complete - progress is displayed showing folders and messages processed
7. The trained model appears in the "Trained Models" list

### Archive (Classification)

1. Select the **Archive** tab
2. Choose an account (only accounts with trained models are shown)
3. Inbox messages are loaded automatically
4. Adjust the **Confidence Threshold** slider as needed (default: 50%)
5. Select messages to classify using checkboxes
6. Click **Classify Selected**
7. Review predictions:
   - Confidence scores are color-coded (green ≥80%, orange ≥50%, red <50%)
   - Low-confidence predictions are shown in red in the Target Folder column
8. Select messages to move
9. Click **Move Selected**
10. Messages with confidence above the threshold are moved to their predicted folders

## Technical Details

- **ML Algorithm:** Naive Bayes classifier with Laplace smoothing
- **Features:** Tokenized words, email addresses, sender domains
- **Storage:** Models stored using `browser.storage.local` API
- **Compatibility:** Thunderbird 91.0+ (WebExtension Manifest V2)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes in each version.

---

## Development with AI

The development was primarily conducted using Cursor rel. 0.45 and partially with Codeium Windsurf rel. 1.2.2, both using Anthropic Claude 3.5 Sonnet as LLM.
To create the development plan, the initial specifications were improved using ChatGPT o1.

### External Documentation

Although these tools already had web search capabilities at the time, the development of this project assumed that Thunderbird documentation was not publicly available, as in the case of a closed-source project.
For this reason, the "ThunderbirdDocScraper.py" script in the "utils" folder was used to download Thunderbird documentation in markdown format and made available to Cursor within the "_Docs\thunderbird_docs" folder.

### Development Plan Creation

To create the development plan, the app designer wrote the initial specifications. 
These specifications were then used to create the development plan with ChatGPT o1.

#### Initial Specifications
```
    # E-mail archiver

    The app works as a Thunderbird plugin and helps users to archive e-mails in mailbox folders, based on previously archived e-mail

    The app is divided in two part:
    1. Archive Models training
    2. E-mail archive

    ## 1 - Archive Model Traning
    - The Archive Model Training option is available from the Tools menu
    - The users select one of the available mailbox
    - The app reads the name of all the user created folders as absolute path inside the mailbox (e.g. "mailbox/folder/subfolder/sub-subfolder")
    - The model training features of the app ignores the standard folders like Inbox, Sent, Draft, Recycle Bin
    - When the user confirm that the training should start, 
        - the app reads all the emails source data as the features of the Machine Learning training process (From, To, servers, Subject, Mail body) of all the user created folders except the folders that should be ignored. The attachments are also ignored and not used for the training
        - The folder name is the target
    - The model is saved as model_<email-address>

    ## E-mail archive
    - The E-mail archive option is available in the Tools menu
    - When this option is selected, a new tab/Window is opened in Thunderbird
    - The user select one mailbox from the mailboxes available. The mailboxes available are the one with a model previously created
    - When the mailbox is selected, in the new open tab will be displayed the messages of the Inbox with this columns
        - Select check box (start as not selected)
        - From
        - Date
        - Target Folder (start as empty)
        - Subject
    - The user click a [classify] button
    - The app, using the trained model, classify each e-mail adding the predicted destination folder in the Target Folder column
    - The user select the e-mails he wants to move
    - The user click the Move button, and the selected e-mail are moved in the folder that has been written in the Target folder column
    - The user close the tab/Windows and the memory is freed
```

#### Development Plan with ChatGPT o1
The development plan was created using ChatGPT o1 using the initial specifications as context.
You can find the development plan in the file ["_Docs\DevelopmentPlan.md"](_Docs\DevelopmentPlan.md)

### Development with Cursor (and Windsurf)

After defining the work plan and preparing the external documentation useful for project development, the instructions were fed into Cursor with the following initial prompt:
```
Please crete the app described in @DevelopmentPlan.md 
The app is about a Mozilla Thunderbird extension and in @thunderbird_docs you can find a complete documentation of the latest version of Thunderbird WebExtension API, also with some example.
Please, keep the code as simple as possible.
```

The full list of prompts passed, step by step, to Cursor is available in the file ["_Docs\Cursor-prompts-history.md"](_Docs\Cursor-prompts-history.md)

### Cursor Rules

This project has been developed with Cursor rules configured. The Cursor rules have been included later in the project as an example of how to use the Cursor rules.
The Cursor rules have been created using Grok Deep Research with the prompt described in the file ["_Docs\Create-rules-with-Grok.md"](_Docs\Create-rules-with-Grok.md)

## License

See [LICENSE](LICENSE) file for details.
