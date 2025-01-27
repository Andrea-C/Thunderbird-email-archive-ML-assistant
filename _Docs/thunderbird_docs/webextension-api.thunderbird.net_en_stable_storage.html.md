≡ storage API

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

# storage API

Use the browser.storage API to store, retrieve, and track changes to user
data.

Note

The permission storage is required to use `messenger.storage.*`.

## Events

### onChanged

Fired when one or more items change.

Parameters for onChanged.addListener(listener)

  * 

`listener(changes, areaName)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`changes`

(object)

Object mapping each key that changed to its corresponding StorageChange for
that item.

  * 

`areaName`

(string)

The name of the storage area (“sync”, “local” or “managed”) the changes are
for.

Required permissions

  * storage

## Types

### StorageArea

object

  * `clear([callback])` Removes all items from storage.

  * `get([keys], callback)` Gets one or more items from storage.

  * `getBytesInUse([keys], callback)` Gets the amount of space (in bytes) being used by one or more items.

  * `remove(keys, [callback])` Removes one or more items from storage.

  * `set(items, [callback])` Sets multiple items.

### StorageAreaSync

object

  * `clear([callback])` Removes all items from storage.

  * `get([keys], callback)` Gets one or more items from storage.

  * `getBytesInUse([keys], callback)` Gets the amount of space (in bytes) being used by one or more items.

  * `remove(keys, [callback])` Removes one or more items from storage.

  * `set(items, [callback])` Sets multiple items.

### StorageChange

object

  * 

[`newValue`]

(any, optional)

The new value of the item, if there is a new value.

  * 

[`oldValue`]

(any, optional)

The old value of the item, if there was an old value.

## Properties

### local

Items in the local storage area are local to each machine.

### managed

Items in the managed storage area are set by administrators or native
applications, and are read-only for the extension; trying to modify this
namespace results in an error.

### session

Items in the session storage area are kept in memory, and only until the
either browser or extension is closed or reloaded.

### sync

Items in the sync storage area are synced by the browser.

