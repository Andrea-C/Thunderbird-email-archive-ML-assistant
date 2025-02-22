# Email Archive ML Assistant

The objective of this application, which is used as an extension for Mozilla Thunderbird, is to assist the user in archiving messages from the inbox into various archive folders.
To achieve this, the application studies how previous messages have been archived, creates a Machine Learning model by analyzing the contents of archive folders, and uses this model to suggest the appropriate folder for archiving a new message.

The application was developed as an exercise to verify the feasibility of creating a functional application with the following constraints:
- The code must be written entirely by Artificial Intelligence.
- The code must use functions and APIs that are not part of the training data of the AI models used.

## Requirements:
- The application must be fully integrated into Mozilla Thunderbird.
- Internal data storage must be managed using Thunderbird's storage APIs.
- For all phases, the application must synchronize IMAP with the mail server.

The application is divided into two parts:
- **Training:** where the Machine Learning model is created.
- **Archive:** where the model is used to suggest the archive folder and archive the message.

## Training
- The application retrieves the email accounts present in the Thunderbird client.
- For each account, it retrieves all archive folders, distinguishing between system folders (Inbox, Sent, Drafts, Trash, Junk, etc.) and personal archive folders.
- The user selects the mailbox to be trained.
- The application presents a list of folders to be used for the Machine Learning model, automatically selecting all personal folders and excluding system folders.
- The user can modify the initial selection.
- The folder selection is stored in internal storage.
- A Machine Learning model is created for each selected mailbox.
- It is possible to delete and recreate the Machine Learning model.

## Archive
- The application allows selecting the mailbox to be used for archiving, choosing among the mailboxes for which a Machine Learning model has been created.
- The user selects a probability threshold, above which a message will be suggested for archiving.
- All messages present in the selected mailbox's Inbox are displayed.
- The user can select all or some messages to be classified.
- The selected messages are classified with an assigned archive folder and an indication of classification confidence.
- The user can select messages to be archived.
- The selected messages are moved from the Inbox to the archive folder determined by the Machine Learning model.

## Development with AI
The development was primarily conducted using Cursor rel. 0.45 and partially with Codeium Windsurf rel. 1.2.2, both using Anthropic Claude 3.5 Sonnet as LLM.
To create the development plan, the initial specifications where improved using ChapGPT o1.


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
The development plan was created using ChapGPT o1 using the initial specifications as context.
You can find the development plan in the file ["_Docs\DevelopmentPlan.md"](_Docs\DevelopmentPlan.md)

### Development with Cursor (and Windsurf)

After defining the work plan and preparing the external documentation useful for project development, the instructions were fed into Cursor with the following initial prompt:
```
Please crete the app described in @DevelopmentPlan.md 
The app is about a Mozilla Thunderbird extension and in @thunderbird_docs you can find a complete documentation of the latest version of Thunderbird WebExtension API, also with some example.
Please, keep the code as simple as possible.
```

The full list of prompt passed, step by step, to Cursor is available in the file ["_Docs\CursorPrompts.md"](_Docs\CursorPrompts.md)

