≡ messengerUtilities API

  * Functions

  * Types

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

# messengerUtilities API

## Functions

### convertToPlainText(body, [options])

Converts the provided body to readable plain text, without tags and
leading/trailing whitespace.

Parameters

  * 

`body`

(string)

The to-be-converted body.

  * 

[`options`]

(object, optional)

  * 

[`flowed`]

(boolean, optional)

The converted plain text will be wrapped to lines not longer than 72
characters and use format flowed, as defined by RFC 2646.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

### formatFileSize(sizeInBytes)

Returns the provided file size in a human readable format (e.g. 12 bytes or
11,4 GB).

Parameters

  * 

`sizeInBytes`

(integer)

The size in bytes.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

### parseMailboxString(mailboxString, [preserveGroups])

Parse a mailbox string containing one or more email addresses (see RFC 5322,
section 3.4).

Parameters

  * 

`mailboxString`

(string)

The string to be parsed (e.g. User <user@example.com>, other-user@example.com)

  * 

[`preserveGroups`]

(boolean, optional)

Keep grouped hierachies. Groups may be specified in a mailbox string as
follows: GroupName : user1 <user1@example.com>, user2@example,com ;.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of ParsedMailbox

## Types

### ParsedMailbox

Representation of a parsed mailbox string (see RFC 5322, section 3.4).

object

  * 

[`email`]

(string, optional)

The addr-spec associated with the provided address, if available.

  * 

[`group`]

(array of ParsedMailbox, optional)

The members of the group, if available.

  * 

[`name`]

(string, optional)

The display-name associated with the provided address or group, if available.

