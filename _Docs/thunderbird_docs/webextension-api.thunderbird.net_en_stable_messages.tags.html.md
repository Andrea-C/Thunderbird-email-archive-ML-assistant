≡ messages.tags API

  * Permissions

  * Functions

  * Types

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

# messages.tags API

The messages.tags API allows to manage the user’s message tags.

## Permissions

  * 

messagesTags

Create, modify and delete message tags

  * 

messagesTagsList

List message tags

  * 

messagesModifyPermanent

Permanently modify the source of your messages (including headers, body and
attachments)

## Functions

### create(key, tag, color)

Creates a new message tag. Tagging a message will store the tag’s key in the
user’s message. Throws if the specified tag key is used already.

Parameters

  * 

`key`

(string)

Unique tag identifier (will be converted to lower case). Must not include
()<>{/%*” or spaces.

  * 

`tag`

(string)

Human-readable tag name.

  * 

`color`

(string)

Tag color in hex format (i.e.: #000080 for navy blue). Value will be stored as
upper case.

Required permissions

  * messagesTags

### delete(key)

Deletes a message tag, removing it from the list of known tags. Its key will
not be removed from tagged messages, but they will appear untagged. Recreating
a deleted tag, will make all former tagged messages appear tagged again.

Parameters

  * 

`key`

(string)

Unique tag identifier (will be converted to lower case). Must not include
()<>{/%*” or spaces.

Required permissions

  * messagesTags

### list()

Returns a list of tags that can be set on messages, and their human-friendly
name, colour, and sort order.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of MessageTag

Required permissions

  * messagesTagsList

### update(key, updateProperties)

Updates a message tag. Throws if the specified tag key does not exist.

Parameters

  * 

`key`

(string)

Unique tag identifier (will be converted to lower case). Must not include
()<>{/%*” or spaces.

  * 

`updateProperties`

(object)

  * 

[`color`]

(string, optional)

Tag color in hex format (i.e.: #000080 for navy blue). Value will be stored as
upper case.

  * 

[`tag`]

(string, optional)

Human-readable tag name.

Required permissions

  * messagesTags

## Types

### MessageTag

object

  * 

`color`

(string)

Tag color.

  * 

`key`

(string)

Unique tag identifier.

  * 

`ordinal`

(string)

Custom sort string (usually empty).

  * 

`tag`

(string)

Human-readable tag name.

### TagsDetail

Used for filtering messages by tag in various methods. Note that functions
using this type may have a partial implementation.

object

  * 

`mode`

(string)

Whether all of the tag filters must apply, or any of them.

Supported values:

  * 

all

  * 

any

  * 

`tags`

(object)

A _dictionary object_ with one or more filter condition as _key-value_ pairs,
the _key_ being the tag to filter on, and the _value_ being a boolean
expression, requesting whether a message must include (true) or exclude
(false) the tag. For a list of available tags, call the list() method.

