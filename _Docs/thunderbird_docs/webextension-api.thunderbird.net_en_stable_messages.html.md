≡ messages API

  * Permissions

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

  * [Working with message lists](examples/messageLists.html)

  * [Working with WebExtension events](examples/eventListeners.html)

# messages API

The messages API allows to access and manage the user’s messages.

Note

When the term `messageId` is used in these documents, it _doesn’t_ refer to
the Message-ID email header. It is an internal tracking number that does not
remain after a restart. Nor does it follow an email that has been moved to a
different folder.

Warning

Some functions in this API potentially return _a lot_ of messages. Be careful
what you wish for! See [Working with message
lists](examples/messageLists.html) for more information.

## Permissions

  * 

messagesDelete

Permanently delete your email messages

  * 

messagesImport

Import messages into Thunderbird

  * 

messagesMove

Copy or move your email messages (including moving them to the trash folder)

  * 

messagesRead

Read your email messages

  * 

messagesUpdate

Change properties and tags of your email messages

  * 

messagesModifyPermanent

Permanently modify the source of your messages (including headers, body and
attachments)

  * 

sensitiveDataUpload

Transfer sensitive user data (if access has been granted) to a remote server
for further processing

Note

The permission messagesRead is required to use `messenger.messages.*`.

## Functions

### archive(messageIds)

Archives messages using the current settings. Archiving external messages will
throw an _ExtensionError_.

Parameters

  * 

`messageIds`

(array of MessageId)

The IDs of the messages to archive.

Required permissions

  * messagesRead

  * messagesMove

### copy(messageIds, folderId)

Copies messages to a specified folder.

Parameters

  * 

`messageIds`

(array of MessageId)

The IDs of the messages to copy.

  * 

`folderId`

([MailFolderId](folders.html#folders-mailfolderid))

The folder to copy the messages to.

Required permissions

  * messagesRead

  * accountsRead

  * messagesMove

### delete(messageIds, [skipTrash])

Deletes messages permanently, or moves them to the trash folder (honoring the
account’s deletion behavior settings). Deleting external messages will throw
an _ExtensionError_. The skipTrash parameter allows immediate permanent
deletion, bypassing the trash folder.

Parameters

  * 

`messageIds`

(array of MessageId)

The IDs of the messages to delete.

  * 

[`skipTrash`]

(boolean, optional)

If true, the message will be deleted permanently, regardless of the account’s
deletion behavior settings.

Required permissions

  * messagesRead

  * messagesDelete

### get(messageId)

Returns the specified message.

Parameters

  * 

`messageId`

(MessageId)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MessageHeader

Required permissions

  * messagesRead

### getFull(messageId, [options])

Returns the specified message, including all headers and MIME parts. Throws if
the message could not be read, for example due to network issues.

Parameters

  * 

`messageId`

(MessageId)

  * 

[`options`]

(object, optional)

  * 

[`decrypt`]

(boolean, optional)

Whether the message should be decrypted. If the message could not be
decrypted, its parts are omitted. Defaults to true.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MessagePart

Required permissions

  * messagesRead

### getRaw(messageId, [options])

– [Added in TB 72, backported to TB 68.7]

Returns the unmodified source of a message. Throws if the message could not be
read, for example due to network issues.

Parameters

  * 

`messageId`

(MessageId)

  * 

[`options`]

(object, optional)

  * 

[`data_format`]

(string, optional)

The message can either be returned as a DOM File (default) or as a [binary
string](https://developer.mozilla.org/en-US/docs/Web/API/DOMString/Binary). It
is recommended to use the File format, because the DOM File object can be used
as-is with the downloads API and has useful methods to access the content,
like [File.text()](https://developer.mozilla.org/en-US/docs/Web/API/Blob/text)
and [File.arrayBuffer()](https://developer.mozilla.org/en-
US/docs/Web/API/Blob/arrayBuffer). Working with binary strings is error prone
and needs special handling:

    
    
    /**
     * Decodes a binary string using the given encoding format and returns a
     * JavaScript string. Produces mangled output if used with anything but a binary
     * input string.
     */
    function decodeBinaryString(binaryString, inputEncoding = "utf-8") {
        const buffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            buffer[i] = binaryString.charCodeAt(i) & 0xFF;
        }
        let decoder = new TextDecoder(inputEncoding);
        return decoder.decode(buffer);
    }
    

(see MDN for [supported input encodings](https://developer.mozilla.org/en-
US/docs/Web/API/Encoding_API/Encodings)).

Supported values:

  * 

BinaryString

  * 

File

  * 

[`decrypt`]

(boolean, optional)

Whether the message should be decrypted. Throws, if the message could not be
decrypted.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string or [File](https://developer.mozilla.org/en-US/docs/Web/API/File)

Required permissions

  * messagesRead

### import(file, folderId, [properties])

– [Added in TB 106]

Imports a message into a local Thunderbird folder. To import a message into an
IMAP folder, add it to a local folder first and then move it to the IMAP
folder.

Parameters

  * 

`file`

([File](https://developer.mozilla.org/en-US/docs/Web/API/File))

  * 

`folderId`

([MailFolderId](folders.html#folders-mailfolderid))

The folder to import the messages into.

  * 

[`properties`]

(MessageProperties, optional)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MessageHeader

Required permissions

  * messagesRead

  * accountsRead

  * messagesImport

### list(folderId)

Gets all messages in a folder.

Parameters

  * 

`folderId`

([MailFolderId](folders.html#folders-mailfolderid))

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MessageList

Required permissions

  * messagesRead

  * accountsRead

### move(messageIds, folderId)

Moves messages to a specified folder. If the messages cannot be removed from
the source folder, they will be copied instead of moved. Moving external
messages will throw an _ExtensionError_.

Parameters

  * 

`messageIds`

(array of MessageId)

The IDs of the messages to move.

  * 

`folderId`

([MailFolderId](folders.html#folders-mailfolderid))

The folder to move the messages to.

Required permissions

  * messagesRead

  * accountsRead

  * messagesMove

### query([queryInfo])

– [Added in TB 69, backported to TB 68.2]

Gets all messages that have the specified properties, or all messages if no
properties are specified. Messages of unified mailbox folders are not included
by default (as that could double the amount of returned messages), but
explicitly specifying a unified mailbox folder is supported.

Parameters

  * 

[`queryInfo`]

(object, optional)

  * 

[`accountId`]

([MailAccountId](accounts.html#accounts-mailaccountid) or array of
[MailAccountId](accounts.html#accounts-mailaccountid), optional)

Limits the search to the specified account(s). Accounts are searched in the
specified order.

  * 

[`attachment`]

(boolean or QueryRange, optional)

– [Added in TB 96, backported to TB 91.4.1]

Whether the message has attachments, or not. Supports to specify a QueryRange
(min/max) instead of a simple boolean value (none/some).

  * 

[`author`]

(string, optional)

Returns only messages with this value matching the author. The search value is
a single email address, a name or a combination (e.g.: Name
<user@domain.org>). The address part of the search value (if provided) must
match the author’s address completely. The name part of the search value (if
provided) must match the author’s name partially. All matches are done case-
insensitive.

  * 

[`autoPaginationTimeout`]

(integer, optional)

– [Added in TB 120]

Set the timeout in ms after which results should be returned, even if the
nominal number of messages-per-page has not yet been reached. Defaults to 1000
ms. Setting it to 0 will disable auto-pagination.

  * 

[`body`]

(string, optional)

Returns only messages with this value in the body of the mail.

  * 

[`flagged`]

(boolean, optional)

Returns only flagged (or unflagged if false) messages.

  * 

[`folderId`]

([MailFolderId](folders.html#folders-mailfolderid) or array of
[MailFolderId](folders.html#folders-mailfolderid), optional)

Limits the search to the specified folder(s). Folders are searched in the
specified order. The accountsRead permission is required.

  * 

[`fromDate`]

([Date](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Date), optional)

Returns only messages with a date after this value.

  * 

[`fromMe`]

(boolean, optional)

Returns only messages with the author’s address matching any configured
identity.

  * 

[`fullText`]

(string, optional)

Returns only messages with this value somewhere in the mail (subject, body or
author).

  * 

[`headerMessageId`]

(string, optional)

– [Added in TB 85]

Returns only messages with a Message-ID header matching this value.

  * 

[`includeSubFolders`]

(boolean, optional)

– [Added in TB 91]

Search the specified folder recursively.

  * 

[`junk`]

(boolean, optional)

– [Added in TB 121]

Returns only messages whith the specified junk state.

  * 

[`junkScore`]

(QueryRange, optional)

– [Added in TB 121]

Returns only messages with a junk score in the specified range.

  * 

[`messagesPerPage`]

(integer, optional)

– [Added in TB 120]

Set the nominal number of messages-per-page for this query. Defaults to 100
messages.

  * 

[`new`]

(boolean, optional)

– [Added in TB 121]

Returns only messages with the specified new state.

  * 

[`read`]

(boolean, optional)

Returns only messages with the specified read state.

  * 

[`recipients`]

(string, optional)

Returns only messages whose recipients match all specified addresses. The
search value is a semicolon separated list of email addresses, names or
combinations (e.g.: Name <user@domain.org>). For a match, all specified
addresses must equal a recipient’s address completely and all specified names
must match a recipient’s name partially. All matches are done case-
insensitive.

  * 

[`returnMessageListId`]

(boolean, optional)

– [Added in TB 120]

The _messageListId_ is usually returned together with the first page, after
some messages have been found. Enabling this option will change the return
value of this function and return the _messageListId_ directly.

  * 

[`size`]

(QueryRange, optional)

– [Added in TB 121]

Returns only messages with a size in the specified byte range.

  * 

[`subject`]

(string, optional)

Returns only messages whose subject contains the provided string.

  * 

[`tags`]

([TagsDetail](messages.tags.html#messages-tags-tagsdetail), optional)

– [Added in TB 74]

Returns only messages with the specified tags. For a list of available tags,
call the [list()](messages.tags.html#messages-tags-list) method.

  * 

[`toDate`]

([Date](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Date), optional)

Returns only messages with a date before this value.

  * 

[`toMe`]

(boolean, optional)

Returns only messages with at least one recipient address matching any
configured identity.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MessageList or string

Required permissions

  * messagesRead

### update(messageId, newProperties)

Updates message properties and tags. Updating external messages will throw an
_ExtensionError_.

Parameters

  * 

`messageId`

(MessageId)

  * 

`newProperties`

(MessageProperties)

Required permissions

  * messagesRead

  * messagesUpdate

### abortList(messageListId)

– [Added in TB 120]

Finalizes the specified list and terminates any process currently still adding
messages.

Parameters

  * 

`messageListId`

(string)

Required permissions

  * messagesRead

### continueList(messageListId)

Returns the next chunk of messages in a list. See [Working with message
lists](examples/messageLists.html) for more information.

Parameters

  * 

`messageListId`

(string)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MessageList

Required permissions

  * messagesRead

### deleteAttachments(messageId, partNames)

– [Added in TB 123]

Deletes the specified attachments and replaces them by placeholder text
attachments with meta information about the original attachments and a
text/x-moz-deleted content type. This permanently modifies the message.

Parameters

  * 

`messageId`

(integer)

  * 

`partNames`

(array of string)

An array of attachments, identifying the to be deleted attachments by their
partName.

Required permissions

  * messagesRead

  * messagesModifyPermanent

### getAttachmentFile(messageId, partName)

– [Added in TB 88]

Gets the content of a MessageAttachment as a
[File](https://developer.mozilla.org/docs/Web/API/File) object.

Parameters

  * 

`messageId`

(MessageId)

  * 

`partName`

(string)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[File](https://developer.mozilla.org/en-US/docs/Web/API/File)

Required permissions

  * messagesRead

The most simple way to get the content of an attachment is to use the
[text()](https://developer.mozilla.org/en-US/docs/Web/API/Blob/text) method of
the returned [File](https://developer.mozilla.org/en-US/docs/Web/API/File)
object:

    
    
    let attachments = await browser.messages.listAttachments(messageId);
    for (let att of attachments) {
        let file = await browser.messages.getAttachmentFile(
            messageId,
            att.partName
        );
        let content = await file.text();
    }
    

### listAttachments(messageId)

– [Added in TB 88]

Lists the attachments of a message.

Parameters

  * 

`messageId`

(MessageId)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of MessageAttachment

Required permissions

  * messagesRead

### listInlineTextParts(messageId)

– [Added in TB 128]

Lists all inline text parts of a message. These parts are not returned by
listAttachments(messageId) and usually make up the readable content of the
message, mostly with content type text/plain or text/html. If a message only
includes a part with content type text/html, the method
[convertToPlainText(body,
[options])](messengerUtilities.html#messengerutilities-converttoplaintext) can
be used to retreive a plain text version.

**Note:** A message usually contains only one inline text part per subtype,
but technically messages can contain multiple inline text parts per subtype.

Parameters

  * 

`messageId`

(MessageId)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of InlineTextPart

Required permissions

  * messagesRead

### openAttachment(messageId, partName, tabId)

– [Added in TB 114]

Opens the specified attachment.

Parameters

  * 

`messageId`

(MessageId)

  * 

`partName`

(string)

  * 

`tabId`

(integer)

The ID of the tab associated with the message opening.

Required permissions

  * messagesRead

## Events

### onCopied

– [Added in TB 91]

Fired when messages have been copied.

Parameters for onCopied.addListener(listener)

  * 

`listener(originalMessages, copiedMessages)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`originalMessages`

(MessageList)

  * 

`copiedMessages`

(MessageList)

Required permissions

  * messagesRead

  * accountsRead

### onDeleted

– [Added in TB 91]

Fired when messages have been permanently deleted.

Parameters for onDeleted.addListener(listener)

  * 

`listener(messages)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`messages`

(MessageList)

Required permissions

  * messagesRead

  * accountsRead

### onMoved

– [Added in TB 91]

Fired when messages have been moved.

Parameters for onMoved.addListener(listener)

  * 

`listener(originalMessages, movedMessages)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`originalMessages`

(MessageList)

  * 

`movedMessages`

(MessageList)

Required permissions

  * messagesRead

  * accountsRead

### onNewMailReceived

– [Added in TB 75]

Fired when a new message is received, and has been through junk classification
and message filters.

Parameters for onNewMailReceived.addListener(listener, monitorAllFolders)

  * 

`listener(folder, messages)`

A function that will be called when this event occurs.

  * 

[`monitorAllFolders`]

(boolean, optional)

– [Added in TB 121]

Monitor all folders (including all special use folders as defined by
[MailFolderSpecialUse](folders.html#folders-mailfolderspecialuse)) instead of
just inbox folders and normal folders.

Parameters passed to the listener function

  * 

`folder`

([MailFolder](folders.html#folders-mailfolder))

  * 

`messages`

(MessageList)

Required permissions

  * messagesRead

  * accountsRead

### onUpdated

– [Added in TB 91]

Fired when one or more properties of a message have been updated.

Parameters for onUpdated.addListener(listener)

  * 

`listener(message, changedProperties)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`message`

(MessageHeader)

  * 

`changedProperties`

(MessageProperties)

Required permissions

  * messagesRead

## Types

### InlineTextPart

An inline part with content type text/*. These parts are not returned by
listAttachments(messageId) and usually make up the readable content of the
message, mostly with content type text/plain or text/html

object

  * 

`content`

(string)

The content of this inline text part.

  * 

`contentType`

(string)

The content type of the part. Most common types for inline text parts are
text/plain and text/html. Possible other (deprecated) types are text/richtext
and text/enriched. Some calendaring services include an inline text part with
type text/calendar.

### MailBoxHeaderString

Content may either be a single email address, or a mailbox string (see RFC
5322, section 3.4). Use [parseMailboxString(mailboxString,
[preserveGroups])](messengerUtilities.html#messengerutilities-
parsemailboxstring) to extract the name and/or the email from the mailbox
string.

string

### MessageAttachment

Represents an attachment in a message. This includes all MIME parts with a
_content-disposition_ header set to attachment, but also related parts like
inline images.

object

  * 

`contentType`

(string)

The content type of the attachment. A value of text/x-moz-deleted indicates
that the original attachment was permanently deleted and replaced by a
placeholder text attachment with some meta information about the original
attachment.

  * 

`name`

(string)

The name, as displayed to the user, of this attachment. This is usually but
not always the filename of the attached file.

  * 

`partName`

(string)

Identifies the MIME part of the message associated with this attachment.

  * 

`size`

(integer)

The size in bytes of this attachment.

  * 

[`contentId`]

(string, optional)

The content-id of this part. Available for related parts, which are referenced
from other places inside the same message (e.g. inline images).

  * 

[`message`]

(MessageHeader, optional)

A MessageHeader, if this attachment is a message.

### MessageHeader

Basic information about a message.

object

  * 

`author`

(MailBoxHeaderString)

  * 

`bccList`

(array of MailBoxHeaderString)

The Bcc recipients. Not populated for news/nntp messages.

  * 

`ccList`

(array of MailBoxHeaderString)

The Cc recipients. Not populated for news/nntp messages.

  * 

`date`

([Date](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Date))

  * 

`external`

(boolean)

– [Added in TB 106]

Whether this message is a real message or an external message (opened from a
file or from an attachment).

  * 

`flagged`

(boolean)

Whether this message is flagged (a.k.a. starred).

  * 

`headerMessageId`

(string)

– [Added in TB 85]

The message-id header of the message.

  * 

`headersOnly`

(boolean)

– [Added in TB 102]

Some account types (for example pop3) allow to download only the headers of
the message, but not its body. The body of such messages will not be
available.

  * 

`id`

(MessageId)

  * 

`junk`

(boolean)

– [Added in TB 74]

Whether the message has been marked as junk. Always false for news/nntp
messages and external messages.

  * 

`junkScore`

(integer)

– [Added in TB 74]

The junk score associated with the message. Always 0 for news/nntp messages
and external messages.

  * 

`new`

(boolean)

– [Added in TB 106]

Whether the message has been received recently and is marked as new.

  * 

`recipients`

(array of MailBoxHeaderString)

The To recipients. Not populated for news/nntp messages.

  * 

`size`

(integer)

– [Added in TB 90]

The total size of the message in bytes.

  * 

`subject`

(string)

The subject of the message.

  * 

`tags`

(array of string)

Tags associated with this message. For a list of available tags, use
[list()](messages.tags.html#messages-tags-list).

  * 

[`folder`]

([MailFolder](folders.html#folders-mailfolder), optional)

The accountsRead permission is required for this property to be included. Not
available for external or attached messages.

  * 

[`read`]

(boolean, optional)

Whether the message has been marked as read. Not available for external or
attached messages.

### MessageId

A unique id representing a MessageHeader and the associated message. This id
doesn’t refer to the Message-ID email header. It is an internal tracking
number that does not remain after a restart. Nor does it follow an email that
has been moved to a different folder.

integer

### MessageList

See [Working with message lists](examples/messageLists.html) for more
information.

object

  * 

`id`

(string or null)

Id of the message list, to be used with continueList(messageListId) or
abortList(messageListId).

  * 

`messages`

(array of MessageHeader)

### MessagePart

Represents an email message “part”, which could be the whole message.

object

  * 

[`body`]

(string, optional)

The content of the part.

  * 

[`contentType`]

(string, optional)

  * 

[`decryptionStatus`]

(string, optional)

– [Added in TB 125]

The decryption status, only available for the root part.

Supported values:

  * 

none

  * 

skipped

  * 

success

  * 

fail

  * 

[`headers`]

(object, optional)

A _dictionary object_ of part headers as _key-value_ pairs, with the header
name as _key_ , and an array of headers as _value_.

  * 

[`name`]

(string, optional)

Name of the part, if it is a file.

  * 

[`partName`]

(string, optional)

The identifier of this part, used in getAttachmentFile(messageId, partName).

  * 

[`parts`]

(array of MessagePart, optional)

Any sub-parts of this part.

  * 

[`size`]

(integer, optional)

The size of this part. The size of parts with content type _message/rfc822_ is
not the actual message size (on disc), but the total size of its decoded body
parts, excluding headers.

### MessageProperties

Message properties used in update(messageId, newProperties) and import(file,
folderId, [properties]). They can also be monitored by onUpdated.

object

  * 

[`flagged`]

(boolean, optional)

Whether the message is flagged (a.k.a starred).

  * 

[`junk`]

(boolean, optional)

Whether the message is marked as junk. Only supported in update(messageId,
newProperties).

  * 

[`new`]

(boolean, optional)

– [Added in TB 106]

Whether the message is marked as new. Only supported in import(file, folderId,
[properties]).

  * 

[`read`]

(boolean, optional)

Whether the message is marked as read.

  * 

[`tags`]

(array of string, optional)

Tags associated with this message. For a list of available tags, call the
[list()](messages.tags.html#messages-tags-list) method.

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

