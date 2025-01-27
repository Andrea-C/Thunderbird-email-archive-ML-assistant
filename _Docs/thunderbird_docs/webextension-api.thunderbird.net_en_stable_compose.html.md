≡ compose API

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

  * [Working with WebExtension events](examples/eventListeners.html)

≡ Related examples on Github

  * [“Compose Body” example](https://github.com/thunderbird/sample-extensions/tree/master/manifest_v3/composeBody)

# compose API

The compose API allows to interact with the message composition window.

## Permissions

  * 

compose

Read and modify your email messages as you compose and send them

  * 

compose.save

Save composed email messages as drafts or templates

  * 

compose.send

Send composed email messages on your behalf

## Functions

### addAttachment(tabId, attachment)

– [Added in TB 78]

Adds an attachment to the message being composed in the specified tab.

Parameters

  * 

`tabId`

(integer)

  * 

`attachment`

(FileAttachment or ComposeAttachment)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

ComposeAttachment

Required permissions

  * compose

### beginForward(messageId, [forwardType], [details])

Open a new message compose window forwarding a given message.

**Note:** The compose format can be set by details.isPlainText or by
specifying only one of details.body or details.plainTextBody. Otherwise the
default compose format of the selected identity is used.

**Note:** Specifying details.body and details.plainTextBody without also
specifying details.isPlainText threw an exception in Thunderbird up to version
97. Since Thunderbird 98, this combination creates a compose window with the
compose format of the selected identity, using the matching details.body or
details.plainTextBody value.

**Note:** If no identity is specified, this function is using the default
identity and not the identity of the referenced message.

Parameters

  * 

`messageId`

([MessageId](messages.html#messages-messageid))

The message to forward, as retrieved using other APIs.

  * 

[`forwardType`]

(string, optional)

Supported values:

  * 

forwardInline

  * 

forwardAsAttachment

  * 

[`details`]

(ComposeDetails, optional)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[Tab](tabs.html#tabs-tab)

– [Added in TB 77]

### beginNew([messageId], [details])

Open a new message compose window.

**Note:** The compose format can be set by details.isPlainText or by
specifying only one of details.body or details.plainTextBody. Otherwise the
default compose format of the selected identity is used.

**Note:** Specifying details.body and details.plainTextBody without also
specifying details.isPlainText threw an exception in Thunderbird up to version
97. Since Thunderbird 98, this combination creates a compose window with the
compose format of the selected identity, using the matching details.body or
details.plainTextBody value.

**Note:** If no identity is specified, this function is using the default
identity and not the identity of the referenced message.

Parameters

  * 

[`messageId`]

([MessageId](messages.html#messages-messageid), optional)

– [Added in TB 84, backported to TB 78.7.0]

If specified, the message or template to edit as a new message.

  * 

[`details`]

(ComposeDetails, optional)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[Tab](tabs.html#tabs-tab)

– [Added in TB 77]

### beginReply(messageId, [replyType], [details])

Open a new message compose window replying to a given message.

**Note:** The compose format can be set by details.isPlainText or by
specifying only one of details.body or details.plainTextBody. Otherwise the
default compose format of the selected identity is used.

**Note:** Specifying details.body and details.plainTextBody without also
specifying details.isPlainText threw an exception in Thunderbird up to version
97. Since Thunderbird 98, this combination creates a compose window with the
compose format of the selected identity, using the matching details.body or
details.plainTextBody value.

**Note:** If no identity is specified, this function is using the default
identity and not the identity of the referenced message.

Parameters

  * 

`messageId`

([MessageId](messages.html#messages-messageid))

The message to reply to, as retrieved using other APIs.

  * 

[`replyType`]

(string, optional)

Supported values:

  * 

replyToSender

  * 

replyToList

  * 

replyToAll

  * 

[`details`]

(ComposeDetails, optional)

– [Added in TB 76]

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[Tab](tabs.html#tabs-tab)

– [Added in TB 77]

### getActiveDictionaries(tabId)

– [Added in TB 102]

Returns a ComposeDictionaries object, listing all installed dictionaries,
including the information whether they are currently enabled or not.

Parameters

  * 

`tabId`

(integer)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

ComposeDictionaries

Required permissions

  * compose

### getAttachmentFile(id)

– [Added in TB 98]

Gets the content of a ComposeAttachment as a
[File](https://developer.mozilla.org/docs/Web/API/File) object.

Parameters

  * 

`id`

(integer)

The unique identifier for the attachment.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[File](https://developer.mozilla.org/en-US/docs/Web/API/File)

### getComposeDetails(tabId)

– [Added in TB 74]

Fetches the current state of a compose window. Currently only a limited amount
of information is available, more will be added in later versions.

Parameters

  * 

`tabId`

(integer)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

ComposeDetails

Required permissions

  * compose

### getComposeState(tabId)

– [Added in TB 90]

Returns information about the current state of the message composer.

Parameters

  * 

`tabId`

(integer)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

ComposeState

### listAttachments(tabId)

– [Added in TB 78]

Lists all of the attachments of the message being composed in the specified
tab.

Parameters

  * 

`tabId`

(integer)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of ComposeAttachment

Required permissions

  * compose

### removeAttachment(tabId, attachmentId)

– [Added in TB 78]

Removes an attachment from the message being composed in the specified tab.

Parameters

  * 

`tabId`

(integer)

  * 

`attachmentId`

(integer)

Required permissions

  * compose

### saveMessage(tabId, [options])

– [Added in TB 102]

Saves the message currently being composed as a draft or as a template. If the
save mode is not specified, the message will be saved as a draft. The returned
Promise fulfills once the message has been successfully saved.

Parameters

  * 

`tabId`

(integer)

  * 

[`options`]

(object, optional)

  * 

`mode`

(string)

Supported values:

  * 

draft

  * 

template

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

object

  * 

`messages`

(array of [MessageHeader](messages.html#messages-messageheader))

The saved message(s). The number of saved messages depends on the applied file
carbon copy configuration (fcc).

  * 

`mode`

(string)

The used save mode.

Supported values:

  * 

draft

  * 

template

Required permissions

  * compose.save

### sendMessage(tabId, [options])

– [Added in TB 90]

Sends the message currently being composed. If the send mode is not specified
or set to default, the message will be send directly if the user is online and
placed in the users outbox otherwise. The returned Promise fulfills once the
message has been successfully sent or placed in the user’s outbox. Throws when
the send process has been aborted by the user, by an onBeforeSend event or if
there has been an error while sending the message to the outgoing mail server.

Parameters

  * 

`tabId`

(integer)

  * 

[`options`]

(object, optional)

  * 

`mode`

(string)

Supported values:

  * 

default

  * 

sendNow

  * 

sendLater

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

object

– [Added in TB 102]

  * 

`messages`

(array of [MessageHeader](messages.html#messages-messageheader))

Copies of the sent message. The number of created copies depends on the
applied file carbon copy configuration (fcc).

  * 

`mode`

(string)

The used send mode.

Supported values:

  * 

sendNow

  * 

sendLater

  * 

[`headerMessageId`]

(string, optional)

The header messageId of the outgoing message. Only included for actually sent
messages.

Required permissions

  * compose.send

### setActiveDictionaries(tabId, activeDictionaries)

– [Added in TB 102]

Updates the active dictionaries. Throws if the activeDictionaries array
contains unknown or invalid language identifiers.

Parameters

  * 

`tabId`

(integer)

  * 

`activeDictionaries`

(array of string)

Required permissions

  * compose

### setComposeDetails(tabId, details)

– [Added in TB 74]

Updates the compose window. The properties of the given ComposeDetails object
will be used to overwrite the current values of the specified compose window,
so only properties that are to be changed should be included. Modified
settings will be treated as user initiated, and turn off further automatic
changes on these settings.

When updating any of the array properties (customHeaders and most address
fields), make sure to first get the current values to not accidentally remove
all existing entries when setting the new value.

**Note:** The compose format of an existing compose window cannot be changed.
Since Thunderbird 98, setting conflicting values for details.body,
details.plainTextBody or details.isPlaintext no longer throws an exception,
instead the compose window chooses the matching details.body or
details.plainTextBody value and ignores the other.

Parameters

  * 

`tabId`

(integer)

  * 

`details`

(ComposeDetails)

Required permissions

  * compose

### updateAttachment(tabId, attachmentId, attachment)

– [Added in TB 78]

Updates the name and/or the content of an attachment in the message being
composed in the specified tab. If the specified attachment is a cloud file
attachment and the associated provider failed to update the attachment, the
function will throw an _ExtensionError_.

Parameters

  * 

`tabId`

(integer)

  * 

`attachmentId`

(integer)

  * 

`attachment`

(FileAttachment)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

ComposeAttachment

Required permissions

  * compose

## Events

### onActiveDictionariesChanged

– [Added in TB 102]

Fired when one or more dictionaries have been activated or deactivated.

Parameters for onActiveDictionariesChanged.addListener(listener)

  * 

`listener(tab, dictionaries)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tab`

([Tab](tabs.html#tabs-tab))

  * 

`dictionaries`

(ComposeDictionaries)

### onAfterSave

– [Added in TB 106, backported to TB 102.3.0]

Fired when saving a message as draft or template succeeded or failed.

Parameters for onAfterSave.addListener(listener)

  * 

`listener(tab, saveInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tab`

([Tab](tabs.html#tabs-tab))

  * 

`saveInfo`

(object)

  * 

`messages`

(array of [MessageHeader](messages.html#messages-messageheader))

The saved message(s). The number of saved messages depends on the applied file
carbon copy configuration (fcc).

  * 

`mode`

(string)

The used save mode.

Supported values:

  * 

autoSave

  * 

draft

  * 

template

  * 

[`error`]

(string, optional)

An error description, if saving the message failed.

Required permissions

  * compose

### onAfterSend

– [Added in TB 106, backported to TB 102.3.0]

Fired when sending a message succeeded or failed.

Parameters for onAfterSend.addListener(listener)

  * 

`listener(tab, sendInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tab`

([Tab](tabs.html#tabs-tab))

  * 

`sendInfo`

(object)

  * 

`messages`

(array of [MessageHeader](messages.html#messages-messageheader))

Copies of the sent message. The number of created copies depends on the
applied file carbon copy configuration (fcc).

  * 

`mode`

(string)

The used send mode.

Supported values:

  * 

sendNow

  * 

sendLater

  * 

[`error`]

(string, optional)

An error description, if sending the message failed.

  * 

[`headerMessageId`]

(string, optional)

The header messageId of the outgoing message. Only included for actually sent
messages.

Required permissions

  * compose

### onAttachmentAdded

– [Added in TB 78]

Fired when an attachment is added to a message being composed.

Parameters for onAttachmentAdded.addListener(listener)

  * 

`listener(tab, attachment)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tab`

([Tab](tabs.html#tabs-tab))

  * 

`attachment`

(ComposeAttachment)

Required permissions

  * compose

### onAttachmentRemoved

– [Added in TB 78]

Fired when an attachment is removed from a message being composed.

Parameters for onAttachmentRemoved.addListener(listener)

  * 

`listener(tab, attachmentId)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tab`

([Tab](tabs.html#tabs-tab))

  * 

`attachmentId`

(integer)

Required permissions

  * compose

### onBeforeSend

– [Added in TB 74]

Fired when a message is about to be sent from the compose window. This is a
user input event handler. For asynchronous listeners some
[restrictions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/User_actions) apply.

Parameters for onBeforeSend.addListener(listener)

  * 

`listener(tab, details)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tab`

([Tab](tabs.html#tabs-tab))

– [Added in TB 74.0b2]

  * 

`details`

(ComposeDetails)

The current state of the compose window. This is functionally the same as
calling the getComposeDetails(tabId) function.

Expected return value of the listener function

  * 

object

  * 

[`cancel`]

(boolean, optional)

Cancels the send.

  * 

[`details`]

(ComposeDetails, optional)

Updates the compose window. This is functionally the same as calling the
setComposeDetails(tabId, details) function.

Required permissions

  * compose

### onComposeStateChanged

– [Added in TB 90]

Fired when the state of the message composer changed.

Parameters for onComposeStateChanged.addListener(listener)

  * 

`listener(tab, state)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tab`

([Tab](tabs.html#tabs-tab))

  * 

`state`

(ComposeState)

### onIdentityChanged

– [Added in TB 78.0b2]

Fired when the user changes the identity that will be used to send a message
being composed.

Parameters for onIdentityChanged.addListener(listener)

  * 

`listener(tab, identityId)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tab`

([Tab](tabs.html#tabs-tab))

  * 

`identityId`

(string)

Required permissions

  * accountsRead

## Types

### ComposeAttachment

– [Added in TB 78]

Represents an attachment in a message being composed.

object

  * 

`id`

(integer)

A unique identifier for this attachment.

  * 

[`name`]

(string, optional)

The name of this attachment, as displayed to the user.

  * 

[`size`]

(integer, optional)

– [Added in TB 83, backported to TB 78.5.0]

The size in bytes of this attachment. Read-only.

### ComposeDetails

Used by various functions to represent the state of a message being composed.
Note that functions using this type may have a partial implementation.

object

  * 

[`additionalFccFolderId`]

([MailFolderId](folders.html#folders-mailfolderid), optional)

– [Added in TB 125]

An additional fcc folder which can be selected while composing the message.
Cleared when set to null. The permission accountsRead is required to use this
property.

  * 

[`attachPublicPGPKey`]

(boolean, optional)

Whether the public OpenPGP key of the sending identity should be attached to
the message.

  * 

[`attachVCard`]

(boolean, optional)

– [Added in TB 102]

Whether or not the vCard of the used identity will be attached to the message
during send. **Note:** If the value has not been modified, selecting a
different identity will load the default value of the new identity.

  * 

[`attachments`]

(array of FileAttachment or ComposeAttachment, optional)

– [Added in TB 82, backported to TB 78.4.0]

Only used in the begin* functions. Attachments to add to the message.

  * 

[`bcc`]

(ComposeRecipientList, optional)

  * 

[`body`]

(string, optional)

The HTML content of the message.

  * 

[`cc`]

(ComposeRecipientList, optional)

  * 

[`customHeaders`]

(array of CustomHeader, optional)

– [Added in TB 100]

Array of custom headers. Headers will be returned in _Http-Header-Case_
(a.k.a. _Train-Case_). Set an empty array to clear all custom headers.

  * 

[`deliveryFormat`]

(string, optional)

– [Added in TB 102]

Defines the MIME format of the sent message (ignored on plain text messages).
Defaults to auto, which will send html messages as plain text, if they do not
include any formatting, and as both otherwise (a multipart/mixed message).

Supported values:

  * 

auto

  * 

plaintext

  * 

html

  * 

both

  * 

[`deliveryStatusNotification`]

(boolean, optional)

– [Added in TB 102]

Let the sender know when the recipient’s server received the message. Not
supported by all servers.

  * 

[`followupTo`]

(ComposeRecipientList, optional)

– [Added in TB 74]

  * 

[`from`]

(ComposeRecipient, optional)

– [Added in TB 88]

_Caution_ : Setting a value for from does not change the used identity, it
overrides the _From_ header. Many email servers do not accept emails where the
_From_ header does not match the sender identity. Must be set to exactly one
valid email address.

  * 

[`identityId`]

(string, optional)

– [Added in TB 76]

The ID of an identity from the [accounts API](accounts.html). The settings
from the identity will be used in the composed message. If replyTo is also
specified, the replyTo property of the identity is overridden. The permission
accountsRead is required to include the identityId.

  * 

[`isModified`]

(boolean, optional)

Whether the composer is considered modified by the user. A modified composer
asks for confirmation, when it is closed.

  * 

[`isPlainText`]

(boolean, optional)

– [Added in TB 75]

Whether the message is an HTML message or a plain text message.

  * 

[`newsgroups`]

(string or array of string, optional)

– [Added in TB 74]

A single newsgroup name or an array of newsgroup names.

  * 

[`overrideDefaultFccFolderId`]

([MailFolderId](folders.html#folders-mailfolderid), optional)

– [Added in TB 125]

> This value overrides the default fcc setting (defined by the used identity)
> for this message only. Either a [MailFolderId](folders.html#folders-
> mailfolderid) specifying the folder for the copy of the sent message, or an
> empty string to not save a copy at all. Reset when set to null. The
> permission accountsRead is required to use this property.

  * 

[`plainTextBody`]

(string, optional)

– [Added in TB 75]

The plain text content of the message.

  * 

[`priority`]

(string, optional)

– [Added in TB 102]

The priority of the message.

Supported values:

  * 

lowest

  * 

low

  * 

normal

  * 

high

  * 

highest

  * 

[`relatedMessageId`]

([MessageId](messages.html#messages-messageid), optional)

– [Added in TB 95]

The id of the original message (in case of draft, template, forward or reply).
Read-only. Is null in all other cases or if the original message was opened
from file.

  * 

[`replyTo`]

(ComposeRecipientList, optional)

  * 

[`returnReceipt`]

(boolean, optional)

– [Added in TB 102]

Add the _Disposition-Notification-To_ header to the message to requests the
recipients email client to send a reply once the message has been received.
Recipient server may strip the header and the recipient might ignore the
request.

  * 

[`selectedEncryptionTechnology`]

(EncryptionPropertiesSMIME or EncryptionPropertiesOpenPGP, optional)

The selected encryption technology (OpenPGP or S/MIME) which is to be used to
sign and/or encrypt the message. If the sending identity does not support
encryption at all, this will be undefined.

  * 

[`subject`]

(string, optional)

  * 

[`to`]

(ComposeRecipientList, optional)

  * 

[`type`]

(string, optional)

– [Added in TB 88]

Read-only. The type of the message being composed, depending on how the
compose window was opened by the user.

Supported values:

  * 

draft

  * 

new

  * 

redirect

– [Added in TB 90]

  * 

reply

  * 

forward

### ComposeDictionaries

– [Added in TB 102]

A _dictionary object_ with entries for all installed dictionaries, having a
language identifier as _key_ (for example en-US) and a boolean expression as
_value_ , indicating whether that dictionary is enabled for spellchecking or
not.

object

  * 

`<language identifier>`

(boolean)

### ComposeRecipient

string

A name and email address in the format Name <email@example.com>, or just an
email address.

OR

object

  * 

`nodeId`

(string)

The ID of a contact or mailing list node from the addressBook.contacts or
addressBook.mailingLists.

  * 

`type`

(string)

Which sort of object this ID is for.

Supported values:

  * 

contact

  * 

mailingList

### ComposeRecipientList

– [Added in TB 74]

ComposeRecipient

OR

array of ComposeRecipient

### ComposeState

– [Added in TB 90]

Represent the state of the message composer.

object

  * 

`canSendLater`

(boolean)

The message can be send later.

  * 

`canSendNow`

(boolean)

The message can be send now.

### CustomHeader

A custom header definition.

object

  * 

`name`

(string)

Name of a custom header, must be prefixed by X- (but not by X-Mozilla-) or be
one of the explicitly allowed headers (MSIP_Labels)

  * 

`value`

(string)

### EncryptionPropertiesOpenPGP

object

  * 

`encryptBody`

(boolean)

Whether encryption of the message body using the OpenPGP technology is
enabled. **Note:** If encryption is enabled, but the
[preconditions](https://support.mozilla.org/en-US/kb/thunderbird-help-cannot-
encrypt) for sending an encrypted message are not met, the message cannot be
sent.

  * 

`encryptSubject`

(boolean)

Whether encryption of the message subject using the OpenPGP technology is
enabled (only supported if encryption of the body is enabled a well).

  * 

`name`

(string)

  * 

`signMessage`

(boolean)

Whether the message will be signed using the OpenPGP technology.

### EncryptionPropertiesSMIME

object

  * 

`encryptBody`

(boolean)

Whether encryption of the message body using the S/MIME technology is enabled.
**Note:** If encryption is enabled, but the
[preconditions](https://support.mozilla.org/en-US/kb/thunderbird-help-cannot-
encrypt) for sending an encrypted message are not met, the message cannot be
sent.

  * 

`name`

(string)

  * 

`signMessage`

(boolean)

Whether the message will be signed using the S/MIME technology

### FileAttachment

Object used to add, update or rename an attachment in a message being
composed.

object

  * 

[`file`]

([File](https://developer.mozilla.org/en-US/docs/Web/API/File), optional)

The new content for the attachment.

  * 

[`name`]

(string, optional)

The new name for the attachment, as displayed to the user. If not specified,
the name of the provided file object is used.

