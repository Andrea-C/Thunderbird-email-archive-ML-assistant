≡ contextualIdentities API

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

# contextualIdentities API

Use the browser.contextualIdentities API to query and modify contextual
identity, also called as containers.

## Permissions

  * 

contextualIdentities

Note

The permission contextualIdentities is required to use
`messenger.contextualIdentities.*`.

## Functions

### create(details)

Creates a contextual identity with the given data.

Parameters

  * 

`details`

(object)

Details about the contextual identity being created.

  * 

`color`

(string)

The color of the contextual identity.

  * 

`icon`

(string)

The icon of the contextual identity.

  * 

`name`

(string)

The name of the contextual identity.

Required permissions

  * contextualIdentities

### get(cookieStoreId)

Retrieves information about a single contextual identity.

Parameters

  * 

`cookieStoreId`

(string)

The ID of the contextual identity cookie store.

Required permissions

  * contextualIdentities

### move(cookieStoreIds, position)

Reorder one or more contextual identities by their cookieStoreIDs to a given
position.

Parameters

  * 

`cookieStoreIds`

(string or array of string)

The ID or list of IDs of the contextual identity cookie stores.

  * 

`position`

(integer)

The position the contextual identity should move to.

Required permissions

  * contextualIdentities

### query(details)

Retrieves all contextual identities

Parameters

  * 

`details`

(object)

Information to filter the contextual identities being retrieved.

  * 

[`name`]

(string, optional)

Filters the contextual identity by name.

Required permissions

  * contextualIdentities

### remove(cookieStoreId)

Deletes a contextual identity by its cookie Store ID.

Parameters

  * 

`cookieStoreId`

(string)

The ID of the contextual identity cookie store.

Required permissions

  * contextualIdentities

### update(cookieStoreId, details)

Updates a contextual identity with the given data.

Parameters

  * 

`cookieStoreId`

(string)

The ID of the contextual identity cookie store.

  * 

`details`

(object)

Details about the contextual identity being created.

  * 

[`color`]

(string, optional)

The color of the contextual identity.

  * 

[`icon`]

(string, optional)

The icon of the contextual identity.

  * 

[`name`]

(string, optional)

The name of the contextual identity.

Required permissions

  * contextualIdentities

## Events

### onCreated

Fired when a new container is created.

Parameters for onCreated.addListener(listener)

  * 

`listener(changeInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`changeInfo`

(object)

  * 

`contextualIdentity`

(ContextualIdentity)

Contextual identity that has been created

Required permissions

  * contextualIdentities

### onRemoved

Fired when a container is removed.

Parameters for onRemoved.addListener(listener)

  * 

`listener(changeInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`changeInfo`

(object)

  * 

`contextualIdentity`

(ContextualIdentity)

Contextual identity that has been removed

Required permissions

  * contextualIdentities

### onUpdated

Fired when a container is updated.

Parameters for onUpdated.addListener(listener)

  * 

`listener(changeInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`changeInfo`

(object)

  * 

`contextualIdentity`

(ContextualIdentity)

Contextual identity that has been updated

Required permissions

  * contextualIdentities

## Types

### ContextualIdentity

Represents information about a contextual identity.

object

  * 

`color`

(string)

The color name of the contextual identity.

  * 

`colorCode`

(string)

The color hash of the contextual identity.

  * 

`cookieStoreId`

(string)

The cookie store ID of the contextual identity.

  * 

`icon`

(string)

The icon name of the contextual identity.

  * 

`iconUrl`

(string)

The icon url of the contextual identity.

  * 

`name`

(string)

The name of the contextual identity.

