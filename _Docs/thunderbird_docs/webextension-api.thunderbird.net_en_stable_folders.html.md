≡ folders API

  * Permissions

  * Functions

  * Events

  * Types

  * Properties

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

≡ Related information

  * [Working with WebExtension events](examples/eventListeners.html)

# folders API

The folders API allows to manage the user’s message folders.

## Permissions

  * 

accountsFolders

Create, rename, or delete your mail account folders

Note

The permission accountsRead is required to use `messenger.folders.*`.

## Functions

### copy(sourceFolderId, destinationFolderId)

– [Added in TB 91]

Copies the given source folder into the given destination folder. Throws if
the destination already contains a folder with the name of the source folder.

Parameters

  * 

`sourceFolderId`

(MailFolderId)

  * 

`destinationFolderId`

(MailFolderId)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailFolder

Required permissions

  * accountsRead

  * accountsFolders

### create(folderId, childName)

Creates a new subfolder in the specified folder.

Parameters

  * 

`folderId`

(MailFolderId)

  * 

`childName`

(string)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailFolder

Required permissions

  * accountsRead

  * accountsFolders

### delete(folderId)

Deletes a folder.

Parameters

  * 

`folderId`

(MailFolderId)

Required permissions

  * accountsRead

  * accountsFolders

  * messagesDelete

### get(folderId, [includeSubFolders])

– [Added in TB 121]

Returns the specified folder.

Parameters

  * 

`folderId`

(MailFolderId)

  * 

[`includeSubFolders`]

(boolean, optional)

Specifies whether the returned MailFolder should populate its subFolders
property and include all its (nested!) subfolders. Defaults to false.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailFolder

Required permissions

  * accountsRead

### getFolderCapabilities(folderId)

– [Added in TB 121]

Get capability information about a folder.

Parameters

  * 

`folderId`

(MailFolderId)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailFolderCapabilities

Required permissions

  * accountsRead

### getFolderInfo(folderId)

– [Added in TB 91]

Get additional information about a folder.

Parameters

  * 

`folderId`

(MailFolderId)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailFolderInfo

Required permissions

  * accountsRead

### getParentFolders(folderId, [includeSubFolders])

– [Added in TB 91]

Get all parent folders as a flat ordered array. The first array entry is the
direct parent.

Parameters

  * 

`folderId`

(MailFolderId)

  * 

[`includeSubFolders`]

(boolean, optional)

Specifies whether each returned parent MailFolder should populate its
subFolders property and include all its (nested!) subfolders. Defaults to
false.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of MailFolder

Required permissions

  * accountsRead

### getSubFolders(folderId, [includeSubFolders])

– [Added in TB 91]

Get the subfolders of the specified folder.

Parameters

  * 

`folderId`

(MailFolderId)

  * 

[`includeSubFolders`]

(boolean, optional)

Specifies whether each returned direct child MailFolder should populate its
subFolders property and include all its (nested!) subfolders. Defaults to
false.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of MailFolder

Required permissions

  * accountsRead

### getTagFolder(key)

– [Added in TB 127]

Get one of the special unified mailbox tag folders, which are virtual search
folders and group messages from all mail accounts based on their tags.

Parameters

  * 

`key`

(string)

The tag key of the requested folder. See messages.tags.list() for the
available tags. Throws when specifying an invalid tag key.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailFolder

Required permissions

  * accountsRead

### getUnifiedFolder(type, [includeSubFolders])

– [Added in TB 127]

Get one of the special unified mailbox folders, which are virtual search
folders and return the content from all mail accounts.

Parameters

  * 

`type`

(string)

The requested unified mailbox folder type.

Supported values:

  * 

inbox

  * 

drafts

  * 

sent

  * 

trash

  * 

templates

  * 

archives

  * 

junk

  * 

[`includeSubFolders`]

(boolean, optional)

Specifies whether the returned MailFolder should populate its subFolders
property and include all its (nested!) subfolders. Defaults to false.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailFolder

Required permissions

  * accountsRead

### markAsRead(folderId)

– [Added in TB 121]

Marks all messages in a folder as read.

Parameters

  * 

`folderId`

(MailFolderId)

Required permissions

  * accountsRead

  * accountsFolders

### move(sourceFolderId, destinationFolderId)

– [Added in TB 91]

Moves the given source folder into the given destination folder. Throws if the
destination already contains a folder with the name of the source folder.

Parameters

  * 

`sourceFolderId`

(MailFolderId)

  * 

`destinationFolderId`

(MailFolderId)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailFolder

Required permissions

  * accountsRead

  * accountsFolders

### query([queryInfo])

– [Added in TB 121]

Gets folders that match the specified properties, or all folders if no
properties are specified.

Parameters

  * 

[`queryInfo`]

(object, optional)

  * 

[`accountId`]

([MailAccountId](accounts.html#accounts-mailaccountid), optional)

Limits the search to folders of the account with the specified id.

  * 

[`canAddMessages`]

(boolean, optional)

Whether the folder supports adding new messages, or not.

  * 

[`canAddSubfolders`]

(boolean, optional)

Whether the folder supports adding new subfolders, or not.

  * 

[`canBeDeleted`]

(boolean, optional)

Whether the folder can be deleted, or not.

  * 

[`canBeRenamed`]

(boolean, optional)

Whether the folder can be renamed, or not.

  * 

[`canDeleteMessages`]

(boolean, optional)

Whether the folder supports deleting messages, or not.

  * 

[`folderId`]

(MailFolderId, optional)

Limits the search to the folder with the specified id.

  * 

[`hasMessages`]

(boolean or QueryRange, optional)

Whether the folder (excluding subfolders) contains messages, or not. Supports
to specify a QueryRange (min/max) instead of a simple boolean value
(none/some).

  * 

[`hasNewMessages`]

(boolean or QueryRange, optional)

Whether the folder (excluding subfolders) contains new messages, or not.
Supports to specify a QueryRange (min/max) instead of a simple boolean value
(none/some).

  * 

[`hasSubFolders`]

(boolean or QueryRange, optional)

Whether the folder has subfolders, or not. Supports to specify a QueryRange
(min/max) instead of a simple boolean value (none/some).

  * 

[`hasUnreadMessages`]

(boolean or QueryRange, optional)

Whether the folder (excluding subfolders) contains unread messages, or not.
Supports to specify a QueryRange (min/max) instead of a simple boolean value
(none/some).

  * 

[`isFavorite`]

(boolean, optional)

Whether the folder is a favorite folder, or not.

  * 

[`isRoot`]

(boolean, optional)

Whether the folder is a root folder, or not.

  * 

[`isTag`]

(boolean, optional)

Whether the folder is a virtual tag folder, or not. Note: Virtual tag folders
are always skipped, unless this property is set to true

  * 

[`isUnified`]

(boolean, optional)

Whether the folder is a unified mailbox folder, or not. Note: Unified mailbox
folders are always skipped, unless this property is set to true

  * 

[`isVirtual`]

(boolean, optional)

Whether the folder is a virtual search folder, or not.

  * 

[`limit`]

(integer, optional)

Limits the number of returned folders. If used together with recent, supports
being set to DEFAULT_MOST_RECENT_LIMIT

  * 

[`name`]

(RegularExpression or string, optional)

Return only folders whose name is matched by the provided string or regular
expression.

  * 

[`path`]

(RegularExpression or string, optional)

Return only folders whose path is matched by the provided string or regular
expression.

  * 

[`recent`]

(boolean, optional)

Whether the folder (excluding subfolders) has been used within the last month,
or not. The returned folders will be sorted by their recentness.

  * 

[`specialUse`]

(array of MailFolderSpecialUse, optional)

Match only folders with the specified special use (folders have to match all
specified uses).

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of MailFolder

Required permissions

  * accountsRead

### rename(folderId, newName)

Renames a folder.

Parameters

  * 

`folderId`

(MailFolderId)

  * 

`newName`

(string)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailFolder

Required permissions

  * accountsRead

  * accountsFolders

### update(folderId, updateProperties)

– [Added in TB 121]

Updates properties of a folder.

Parameters

  * 

`folderId`

(MailFolderId)

  * 

`updateProperties`

(object)

The properties to update.

  * 

[`isFavorite`]

(boolean, optional)

Sets or clears the favorite status.

Required permissions

  * accountsRead

  * accountsFolders

## Events

### onCopied

– [Added in TB 91]

Fired when a folder has been copied.

Parameters for onCopied.addListener(listener)

  * 

`listener(originalFolder, copiedFolder)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`originalFolder`

(MailFolder)

  * 

`copiedFolder`

(MailFolder)

Required permissions

  * accountsRead

### onCreated

– [Added in TB 91]

Fired when a folder has been created.

Parameters for onCreated.addListener(listener)

  * 

`listener(createdFolder)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`createdFolder`

(MailFolder)

Required permissions

  * accountsRead

### onDeleted

– [Added in TB 91]

Fired when a folder has been deleted.

Parameters for onDeleted.addListener(listener)

  * 

`listener(deletedFolder)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`deletedFolder`

(MailFolder)

Required permissions

  * accountsRead

### onFolderInfoChanged

– [Added in TB 91]

Fired when certain information of a folder have changed. Bursts of message
count changes are collapsed to a single event.

Parameters for onFolderInfoChanged.addListener(listener)

  * 

`listener(folder, folderInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`folder`

(MailFolder)

  * 

`folderInfo`

(MailFolderInfo)

Required permissions

  * accountsRead

### onMoved

– [Added in TB 91]

Fired when a folder has been moved.

Parameters for onMoved.addListener(listener)

  * 

`listener(originalFolder, movedFolder)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`originalFolder`

(MailFolder)

  * 

`movedFolder`

(MailFolder)

Required permissions

  * accountsRead

### onRenamed

– [Added in TB 91]

Fired when a folder has been renamed.

Parameters for onRenamed.addListener(listener)

  * 

`listener(originalFolder, renamedFolder)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`originalFolder`

(MailFolder)

  * 

`renamedFolder`

(MailFolder)

Required permissions

  * accountsRead

### onUpdated

– [Added in TB 121]

Fired when properties of a folder have changed (specialUse and isFavorite).

Parameters for onUpdated.addListener(listener)

  * 

`listener(originalFolder, updatedFolder)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`originalFolder`

(MailFolder)

  * 

`updatedFolder`

(MailFolder)

Required permissions

  * accountsRead

## Types

### MailFolder

An object describing a folder.

object

  * 

`path`

(string)

Path to this folder in the account. Although paths look predictable, never
guess a folder’s path, as there are a number of reasons why it may not be what
you think it is. Use getParentFolders(folderId, [includeSubFolders]) or
getSubFolders(folderId, [includeSubFolders]) to obtain hierarchy information.

  * 

[`accountId`]

([MailAccountId](accounts.html#accounts-mailaccountid), optional)

The id of the account this folder belongs to.

  * 

[`id`]

(MailFolderId, optional)

An identifier for the folder.

  * 

[`isFavorite`]

(boolean, optional)

– [Added in TB 121]

Whether this folder is a favorite folder.

  * 

[`isRoot`]

(boolean, optional)

– [Added in TB 121]

Whether this folder is a root folder.

  * 

[`isTag`]

(boolean, optional)

– [Added in TB 121]

Whether this folder is a virtual tag folder.

  * 

[`isUnified`]

(boolean, optional)

Whether this folder is a unified mailbox folder.

  * 

[`isVirtual`]

(boolean, optional)

– [Added in TB 121]

Whether this folder is a virtual search folder.

  * 

[`name`]

(string, optional)

The human-friendly name of this folder.

  * 

[`specialUse`]

(array of MailFolderSpecialUse, optional)

– [Added in TB 121]

The special use of this folder. A folder can have multiple special uses.

  * 

[`subFolders`]

(array of MailFolder, optional)

– [Added in TB 74]

Subfolders of this folder. The property may be null, if inclusion of folders
had not been requested. The folders will be returned in the same order as used
in Thunderbird’s folder pane.

### MailFolderCapabilities

– [Added in TB 121]

An object containing capability information about a folder.

object

  * 

[`canAddMessages`]

(boolean, optional)

Whether this folder supports adding new messages.

  * 

[`canAddSubfolders`]

(boolean, optional)

Whether this folder supports adding new subfolders.

  * 

[`canBeDeleted`]

(boolean, optional)

Whether this folder can be deleted.

  * 

[`canBeRenamed`]

(boolean, optional)

Whether this folder can be renamed.

  * 

[`canDeleteMessages`]

(boolean, optional)

Whether this folder supports deleting messages.

### MailFolderId

A unique id representing a MailFolder throughout a session. Renaming or moving
a folder will invalidate its id.

string

### MailFolderInfo

– [Added in TB 91]

An object containing additional information about a folder.

object

  * 

[`lastUsed`]

([Date](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Date), optional)

– [Added in TB 121]

Date the folder was last used (precision: seconds).

  * 

[`newMessageCount`]

(integer, optional)

– [Added in TB 121]

Number of new messages in this folder.

  * 

[`quota`]

(array of MailFolderQuota, optional)

– [Added in TB 121]

Quota information, if available.

  * 

[`totalMessageCount`]

(integer, optional)

Number of messages in this folder.

  * 

[`unreadMessageCount`]

(integer, optional)

Number of unread messages in this folder.

### MailFolderQuota

– [Added in TB 121]

An object containing quota information.

object

  * 

`limit`

(integer)

The maximum available quota.

  * 

`type`

(string)

The type of the quota as defined by RFC2087. A STORAGE quota is constraining
the available storage in bytes, a MESSAGE quota is constraining the number of
storable messages.

Supported values:

  * 

STORAGE

  * 

MESSAGE

  * 

`unused`

(integer)

The currently unused quota.

  * 

`used`

(integer)

The currently used quota.

### MailFolderSpecialUse

– [Added in TB 121]

Supported values for the special use of a folder.

string

Supported values:

  * 

inbox

  * 

drafts

  * 

sent

  * 

trash

  * 

templates

  * 

archives

  * 

junk

  * 

outbox

### QueryRange

An object defining a range.

object

  * 

[`max`]

(integer, optional)

The maximum value required to match the query.

  * 

[`min`]

(integer, optional)

The minimum value required to match the query.

### RegularExpression

object

  * 

`regexp`

(string)

A regular expression, for example ^Projects d{4}$.

  * 

[`flags`]

(string, optional)

Supported RegExp flags: i = case insensitive, and/or one of u = unicode
support or v = extended unicode support

## Properties

### DEFAULT_MOST_RECENT_LIMIT

The number of most recent folders used in Thunderbird’s UI. Controled by the
mail.folder_widget.max_recent preference.

