≡ identity API

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

# identity API

Use the chrome.identity API to get OAuth2 access tokens.

## Permissions

  * 

identity

Note

The permission identity is required to use `messenger.identity.*`.

## Functions

### getAccounts()

Retrieves a list of AccountInfo objects describing the accounts present on the
profile.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of AccountInfo

Required permissions

  * identity

### getAuthToken([details])

Gets an OAuth2 access token using the client ID and scopes specified in the
oauth2 section of manifest.json.

Parameters

  * 

[`details`]

(object, optional)

  * 

[`account`]

(AccountInfo, optional)

  * 

[`interactive`]

(boolean, optional)

  * 

[`scopes`]

(array of string, optional)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of AccountInfo

Required permissions

  * identity

### getProfileUserInfo()

Retrieves email address and obfuscated gaia id of the user signed into a
profile.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

object

  * 

`email`

(string)

  * 

`id`

(string)

Required permissions

  * identity

### getRedirectURL([path])

Generates a redirect URL to be used in |launchWebAuthFlow|.

Parameters

  * 

[`path`]

(string, optional)

The path appended to the end of the generated URL.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

Required permissions

  * identity

### launchWebAuthFlow(details)

Starts an auth flow at the specified URL.

Parameters

  * 

`details`

(object)

  * 

`url`

(identity.HttpURL)

  * 

[`interactive`]

(boolean, optional)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

Required permissions

  * identity

### removeCachedAuthToken(details)

Removes an OAuth2 access token from the Identity API’s token cache.

Parameters

  * 

`details`

(object)

  * 

`token`

(string)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

object

  * 

`email`

(string)

  * 

`id`

(string)

Required permissions

  * identity

## Events

### onSignInChanged

Fired when signin state changes for an account on the user’s profile.

Parameters for onSignInChanged.addListener(listener)

  * 

`listener(account, signedIn)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`account`

(AccountInfo)

  * 

`signedIn`

(boolean)

Required permissions

  * identity

## Types

### AccountInfo

An object encapsulating an OAuth account id.

object

  * 

`id`

(string)

A unique identifier for the account. This ID will not change for the lifetime
of the account.

