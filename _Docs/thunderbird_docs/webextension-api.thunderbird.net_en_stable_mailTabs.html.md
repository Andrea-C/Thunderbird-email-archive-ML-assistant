≡ mailTabs API

  * Functions

  * Events

  * Types

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

≡ Related information

  * [Working with WebExtension events](examples/eventListeners.html)

≡ Related examples on Github

  * [“Quickfilter” example](https://github.com/thunderbird/sample-extensions/tree/master/manifest_v3/quickfilter)

  * [“MailTab Layout” example](https://github.com/thunderbird/sample-extensions/tree/master/manifest_v3/mailtabs)

# mailTabs API

The mailTabs API allows to interact with Thunderbird’s main mail window.

## Functions

### create([createProperties])

– [Added in TB 121]

Creates a new mail tab. Standard tab properties can be adjusted via
[update([tabId], updateProperties)](tabs.html#tabs-update) after the mail tab
has been created. **Note:** A new mail window can be created via
[create([createData])](windows.html#windows-create).

Parameters

  * 

[`createProperties`]

(MailTabProperties, optional)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailTab

Details about the created mail tab. Will contain the ID of the new tab.

### get(tabId)

Get the MailTab properties of a mail tab.

Parameters

  * 

`tabId`

(integer)

ID of the requested mail tab. Throws if the requested tabId does not belong to
a mail tab.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailTab

### getListedMessages([tabId])

– [Added in TB 121]

Lists the messages in the current view, honoring sort order and filters.

Parameters

  * 

[`tabId`]

(integer, optional)

Defaults to the active tab of the current window.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[MessageList](messages.html#messages-messagelist)

Required permissions

  * messagesRead

### getSelectedFolders([tabId])

– [Added in TB 128]

Lists the selected folders in the folder pane.

Parameters

  * 

[`tabId`]

(integer, optional)

Defaults to the active tab of the current window.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of [MailFolder](folders.html#folders-mailfolder)

Required permissions

  * accountsRead

### getSelectedMessages([tabId])

Lists the selected messages in the current folder.

Parameters

  * 

[`tabId`]

(integer, optional)

Defaults to the active tab of the current window.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[MessageList](messages.html#messages-messagelist)

Required permissions

  * messagesRead

### query([queryInfo])

Gets all mail tabs that have the specified properties, or all mail tabs if no
properties are specified.

Parameters

  * 

[`queryInfo`]

(object, optional)

  * 

[`active`]

(boolean, optional)

Whether the tabs are active in their windows.

  * 

[`currentWindow`]

(boolean, optional)

Whether the tabs are in the current window.

  * 

[`lastFocusedWindow`]

(boolean, optional)

Whether the tabs are in the last focused window.

  * 

[`windowId`]

(integer, optional)

The ID of the parent window, or [WINDOW_ID_CURRENT](windows.html#windows-
window-id-current) for the current window.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of MailTab

### setQuickFilter([tabId], properties)

Sets the Quick Filter user interface based on the options specified.

Parameters

  * 

[`tabId`]

(integer, optional)

Defaults to the active tab of the current window.

  * 

`properties`

(object)

  * 

[`attachment`]

(boolean, optional)

Shows only messages with attachments.

  * 

[`contact`]

(boolean, optional)

Shows only messages from people in the address book.

  * 

[`flagged`]

(boolean, optional)

Shows only flagged messages.

  * 

[`show`]

(boolean, optional)

Shows or hides the Quick Filter bar.

  * 

[`tags`]

(boolean or [TagsDetail](messages.tags.html#messages-tags-tagsdetail),
optional)

Shows only messages with tags on them.

  * 

[`text`]

(QuickFilterTextDetail, optional)

Shows only messages matching the supplied text.

  * 

[`unread`]

(boolean, optional)

Shows only unread messages.

### setSelectedMessages([tabId], messageIds)

Selects none, one or multiple messages.

Parameters

  * 

[`tabId`]

(integer, optional)

Defaults to the active tab of the current window.

  * 

`messageIds`

(array of [MessageId](messages.html#messages-messageid))

The IDs of the messages, which should be selected. The mail tab will switch to
the folder of the selected messages. Throws if they belong to different
folders. Array can be empty to deselect any currently selected message.

Required permissions

  * accountsRead

  * messagesRead

### update([tabId], updateProperties)

Modifies the properties of a mail tab. Properties that are not specified in
updateProperties are not modified.

Parameters

  * 

[`tabId`]

(integer, optional)

Defaults to the active tab of the current window.

  * 

`updateProperties`

(MailTabProperties)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailTab

Details about the updated mail tab.

## Events

### onDisplayedFolderChanged

Fired when the displayed folder changes in any mail tab.

Parameters for onDisplayedFolderChanged.addListener(listener)

  * 

`listener(tab, displayedFolder)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tab`

([Tab](tabs.html#tabs-tab))

Changes in TB 76:

    

previously just the tab’s ID

  * 

`displayedFolder`

([MailFolder](folders.html#folders-mailfolder))

Required permissions

  * accountsRead

### onSelectedMessagesChanged

Fired when the selected messages change in any mail tab.

Parameters for onSelectedMessagesChanged.addListener(listener)

  * 

`listener(tab, selectedMessages)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tab`

([Tab](tabs.html#tabs-tab))

Changes in TB 76:

    

previously just the tab’s ID

  * 

`selectedMessages`

([MessageList](messages.html#messages-messagelist))

Required permissions

  * messagesRead

## Types

### FolderMode

A supported folder mode in the folder pane.

string

Supported values:

  * 

all

  * 

unified

  * 

tags

  * 

unread

  * 

favorite

  * 

recent

### MailTab

object

  * 

`active`

(boolean)

  * 

`layout`

(string)

The arrangement of the folder pane, message list pane, and message display
pane.

Supported values:

  * 

standard

  * 

wide

  * 

vertical

  * 

`tabId`

(integer)

  * 

`viewType`

– [Added in TB 91]

  * 

`windowId`

(integer)

  * 

[`displayedFolder`]

([MailFolder](folders.html#folders-mailfolder), optional)

The folder displayed in the mail tab. The accountsRead permission is required
for this property to be included.

  * 

[`folderMode`]

(FolderMode, optional)

– [Added in TB 125]

The folder mode of the currently displayed folder.

  * 

[`folderModesEnabled`]

(array of FolderMode, optional)

– [Added in TB 125]

The enabled folder modes in the folder pane, and their sort order.

  * 

[`folderPaneVisible`]

(boolean, optional)

Whether the folder pane is visible or not.

  * 

[`groupType`]

(string, optional)

Grouping type of the message list.

Supported values:

  * 

ungrouped

  * 

groupedByThread

  * 

groupedBySortType

  * 

[`messagePaneVisible`]

(boolean, optional)

Whether the message pane is visible or not.

  * 

[`sortOrder`]

(string, optional)

The sort order of the message list.

Supported values:

  * 

none

  * 

ascending

  * 

descending

  * 

[`sortType`]

(string, optional)

The primary sort column of the message list.

Supported values:

  * 

none

  * 

date

  * 

subject

  * 

author

  * 

id

  * 

thread

  * 

priority

  * 

status

  * 

size

  * 

flagged

  * 

unread

  * 

recipient

  * 

location

  * 

tags

  * 

junkStatus

  * 

attachments

  * 

account

  * 

custom

  * 

received

  * 

correspondent

### MailTabProperties

object

  * 

[`displayedFolderId`]

([MailFolderId](folders.html#folders-mailfolderid), optional)

Sets the folder displayed in the mail tab. Requires the accountsRead
permission. The previous message selection in the given folder will be
restored, if any.

  * 

[`folderMode`]

(FolderMode, optional)

– [Added in TB 125]

Sets the currently used folder mode, enabling it if required. If used without
also specifying displayedFolder, the currently selected folder is re-selected
in the new folder mode, if possible.

  * 

[`folderModesEnabled`]

(array of FolderMode, optional)

– [Added in TB 125]

Set the enabled folder modes in the folder pane, and their sort order.

  * 

[`folderPaneVisible`]

(boolean, optional)

Shows or hides the folder pane.

  * 

[`groupType`]

(string, optional)

Grouping type of the message list.

Supported values:

  * 

ungrouped

  * 

groupedByThread

  * 

groupedBySortType

  * 

[`layout`]

(string, optional)

Sets the arrangement of the folder pane, message list pane, and message
display pane. Note that setting this applies it to all mail tabs.

Supported values:

  * 

standard

  * 

wide

  * 

vertical

  * 

[`messagePaneVisible`]

(boolean, optional)

Shows or hides the message display pane.

  * 

[`sortOrder`]

(string, optional)

Sorts the list of messages. sortType must also be given.

Supported values:

  * 

none

  * 

ascending

  * 

descending

  * 

[`sortType`]

(string, optional)

Sorts the list of messages. sortOrder must also be given.

Supported values:

  * 

none

  * 

date

  * 

subject

  * 

author

  * 

id

  * 

thread

  * 

priority

  * 

status

  * 

size

  * 

flagged

  * 

unread

  * 

recipient

  * 

location

  * 

tags

  * 

junkStatus

  * 

attachments

  * 

account

  * 

custom

  * 

received

  * 

correspondent

### QuickFilterTextDetail

object

  * 

`text`

(string)

String to match against the recipients, author, subject, or body.

  * 

[`author`]

(boolean, optional)

Shows messages where text matches the author.

  * 

[`body`]

(boolean, optional)

Shows messages where text matches the message body.

  * 

[`recipients`]

(boolean, optional)

Shows messages where text matches the recipients.

  * 

[`subject`]

(boolean, optional)

Shows messages where text matches the subject.

