≡ addressBooks.contacts API

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

# addressBooks.contacts API

The contacts API allows to access and manage the user’s contacts.

## Permissions

  * 

addressBooks

Read and modify your address books and contacts

  * 

sensitiveDataUpload

Transfer sensitive user data (if access has been granted) to a remote server
for further processing

Note

The permission addressBooks is required to use
`messenger.addressBooks.contacts.*`.

## Functions

### create(parentId, vCard)

Adds a new contact to the address book with the id parentId.

Parameters

  * 

`parentId`

(string)

  * 

`vCard`

(string)

The vCard for the new contact. If it includes an (optional) id and an existing
contact has this id already, an exception is thrown.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

The ID of the new contact.

Required permissions

  * addressBooks

### delete(id)

Removes a contact from the address book. The contact is also removed from any
mailing lists it is a member of.

Parameters

  * 

`id`

(string)

Required permissions

  * addressBooks

### get(id)

Gets a single contact.

Parameters

  * 

`id`

(string)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

ContactNode

Required permissions

  * addressBooks

### getPhoto(id)

Gets the photo associated with this contact. Returns null, if no photo is
available.

Parameters

  * 

`id`

(string)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[File](https://developer.mozilla.org/en-US/docs/Web/API/File) or null

Required permissions

  * addressBooks

### list(parentId)

Gets all the contacts in the address book with the id parentId.

Parameters

  * 

`parentId`

(string)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of ContactNode

Required permissions

  * addressBooks

### query(queryInfo)

Gets all contacts matching queryInfo.

Parameters

  * 

`queryInfo`

(QueryInfo)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of ContactNode

Required permissions

  * addressBooks

### setPhoto(id, file)

Sets the photo associated with this contact.

Parameters

  * 

`id`

(string)

  * 

`file`

([File](https://developer.mozilla.org/en-US/docs/Web/API/File))

Required permissions

  * addressBooks

### update(id, vCard)

Updates a contact.

Parameters

  * 

`id`

(string)

  * 

`vCard`

(string)

The updated vCard for the contact.

Required permissions

  * addressBooks

## Events

### onCreated

Fired when a contact is created.

Parameters for onCreated.addListener(listener)

  * 

`listener(node)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`node`

(ContactNode)

Required permissions

  * addressBooks

### onDeleted

Fired when a contact is removed from an address book.

Parameters for onDeleted.addListener(listener)

  * 

`listener(parentId, id)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`parentId`

(string)

  * 

`id`

(string)

Required permissions

  * addressBooks

### onUpdated

Fired when a contact is changed.

Parameters for onUpdated.addListener(listener)

  * 

`listener(node, oldVCard)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`node`

(ContactNode)

  * 

`oldVCard`

(string)

Required permissions

  * addressBooks

## Types

### ContactNode

A node representing a contact in an address book.

object

  * 

`id`

(string)

The unique identifier for the node. IDs are unique within the current profile,
and they remain valid even after the program is restarted.

  * 

`type`

([NodeType](addressBooks.html#addressbooks-nodetype))

Always set to contact.

  * 

`vCard`

(string)

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

Indicates if the object came from a remote address book.

### ContactProperties

A set of individual properties for a particular contact, and its vCard string.
Further information can be found in [Working with vCard
contacts](examples/vcard.html).

object

### PropertyChange

A dictionary of changed properties. Keys are the property name that changed,
values are an object containing oldValue and newValue. Values can be either a
string or null.

object

### QueryInfo

Object defining a query for contacts.quickSearch.

object

  * 

[`includeLocal`]

(boolean, optional)

Whether to include results from local address books. Defaults to true.

  * 

[`includeReadOnly`]

(boolean, optional)

Whether to include results from read-only address books. Defaults to true.

  * 

[`includeReadWrite`]

(boolean, optional)

Whether to include results from read-write address books. Defaults to true.

  * 

[`includeRemote`]

(boolean, optional)

Whether to include results from remote address books. Defaults to true.

  * 

[`parentId`]

(string, optional)

The id of the address book to search. If not specified, all address books are
searched.

  * 

[`searchString`]

(string, optional)

One or more space-separated terms to search for in predefined contact fields
(defined by the preference mail.addr_book.quicksearchquery.format).

