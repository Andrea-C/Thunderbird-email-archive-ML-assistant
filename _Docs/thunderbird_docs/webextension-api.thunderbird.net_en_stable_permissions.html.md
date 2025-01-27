≡ permissions API

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

# permissions API

## Functions

### contains(permissions)

Check if the extension has the given permissions.

Parameters

  * 

`permissions`

(AnyPermissions)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

boolean

### getAll()

Get a list of all the extension’s permissions.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

AnyPermissions

### remove(permissions)

Relinquish the given permissions.

Parameters

  * 

`permissions`

(Permissions)

### request(permissions)

Request the given permissions.

Parameters

  * 

`permissions`

(Permissions)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

boolean

## Events

### onAdded

Fired when the extension acquires new permissions.

Parameters for onAdded.addListener(listener)

  * 

`listener(permissions)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`permissions`

(Permissions)

### onRemoved

Fired when permissions are removed from the extension.

Parameters for onRemoved.addListener(listener)

  * 

`listener(permissions)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`permissions`

(Permissions)

## Types

### AnyPermissions

object

  * 

[`origins`]

(array of permissions.MatchPattern, optional)

  * 

[`permissions`]

(array of permissions.Permission, optional)

### Permissions

object

  * 

[`origins`]

(array of permissions.MatchPattern, optional)

  * 

[`permissions`]

(array of permissions.OptionalPermission, optional)

