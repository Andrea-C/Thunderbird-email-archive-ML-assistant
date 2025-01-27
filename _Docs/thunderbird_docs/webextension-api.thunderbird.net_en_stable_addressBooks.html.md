≡ addressBooks API

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

  * [Working with vCard contacts](examples/vcard.html)

  * [Working with WebExtension events](examples/eventListeners.html)

≡ Related examples on Github

  * [“Address Book” example](https://github.com/thunderbird/sample-extensions/tree/master/manifest_v3/addressBooks)

# addressBooks API

The addressBooks API allows to access and manage the user’s address books.

## Permissions

  * 

addressBooks

Read and modify your address books and contacts

  * 

sensitiveDataUpload

Transfer sensitive user data (if access has been granted) to a remote server
for further processing

Note

The permission addressBooks is required to use `messenger.addressBooks.*`.

## Functions

### closeUI()

Closes the address book user interface.

Required permissions

  * addressBooks

### create(properties)

Creates a new, empty address book.

Parameters

  * 

`properties`

(object)

  * 

`name`

(string)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

The id of the new address book.

Required permissions

  * addressBooks

### delete(id)

Removes an address book, and all associated contacts and mailing lists.

Parameters

  * 

`id`

(string)

Required permissions

  * addressBooks

### get(id, [complete])

Gets a single address book, optionally including all contacts and mailing
lists.

Parameters

  * 

`id`

(string)

  * 

[`complete`]

(boolean, optional)

If set to true, results will include contacts and mailing lists for this
address book.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

AddressBookNode

Required permissions

  * addressBooks

### list([complete])

Gets a list of the user’s address books, optionally including all contacts and
mailing lists.

Changes in Thunderbird 85

  * 

Read-only address books are now returned as well as read-write books.

Parameters

  * 

[`complete`]

(boolean, optional)

If set to true, results will include contacts and mailing lists for each
address book.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of AddressBookNode

Required permissions

  * addressBooks

### openUI()

Opens the address book user interface.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[Tab](tabs.html#tabs-tab)

Required permissions

  * addressBooks

### update(id, properties)

Renames an address book.

Parameters

  * 

`id`

(string)

  * 

`properties`

(object)

  * 

`name`

(string)

Required permissions

  * addressBooks

## Events

### onCreated

Fired when an address book is created.

Parameters for onCreated.addListener(listener)

  * 

`listener(node)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`node`

(AddressBookNode)

Required permissions

  * addressBooks

### onDeleted

Fired when an addressBook is deleted.

Parameters for onDeleted.addListener(listener)

  * 

`listener(id)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`id`

(string)

Required permissions

  * addressBooks

### onUpdated

Fired when an address book is renamed.

Parameters for onUpdated.addListener(listener)

  * 

`listener(node)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`node`

(AddressBookNode)

Required permissions

  * addressBooks

## Types

### AddressBookNode

A node representing an address book.

object

  * 

`id`

(string)

The unique identifier for the node. IDs are unique within the current profile,
and they remain valid even after the program is restarted.

  * 

`name`

(string)

  * 

`type`

(NodeType)

Always set to addressBook.

  * 

[`contacts`]

(array of contacts.ContactNode, optional)

A list of contacts held by this node’s address book or mailing list.

  * 

[`mailingLists`]

(array of mailingLists.MailingListNode, optional)

A list of mailingLists in this node’s address book.

  * 

[`parentId`]

(string, optional)

The id of the parent object.

  * 

[`readOnly`]

(boolean, optional)

Indicates if the object is read-only.

  * 

[`remote`]

(boolean, optional)

– [Added in TB 91]

Indicates if the address book is accessed via remote look-up.

### NodeType

Indicates the type of a Node.

string

Supported values:

  * 

addressBook

  * 

contact

  * 

mailingList

