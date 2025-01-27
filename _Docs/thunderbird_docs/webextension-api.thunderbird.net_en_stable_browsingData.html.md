≡ browsingData API

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

# browsingData API

Use the chrome.browsingData API to remove browsing data from a user’s local
profile.

## Permissions

  * 

browsingData

Clear recent browsing history, cookies, and related data

Note

The permission browsingData is required to use `messenger.browsingData.*`.

## Functions

### remove(options, dataToRemove)

Clears various types of browsing data stored in a user’s profile.

Parameters

  * 

`options`

(RemovalOptions)

  * 

`dataToRemove`

(DataTypeSet)

The set of data types to remove.

Required permissions

  * browsingData

### removeAppcache(options)

Clears websites’ appcache data.

Parameters

  * 

`options`

(RemovalOptions)

Required permissions

  * browsingData

### removeCache(options)

Clears the browser’s cache.

Parameters

  * 

`options`

(RemovalOptions)

Required permissions

  * browsingData

### removeCookies(options)

Clears the browser’s cookies and server-bound certificates modified within a
particular timeframe.

Parameters

  * 

`options`

(RemovalOptions)

Required permissions

  * browsingData

### removeDownloads(options)

Clears the browser’s list of downloaded files (_not_ the downloaded files
themselves).

Parameters

  * 

`options`

(RemovalOptions)

Required permissions

  * browsingData

### removeFileSystems(options)

Clears websites’ file system data.

Parameters

  * 

`options`

(RemovalOptions)

Required permissions

  * browsingData

### removeFormData(options)

Clears the browser’s stored form data (autofill).

Parameters

  * 

`options`

(RemovalOptions)

Required permissions

  * browsingData

### removeHistory(options)

Clears the browser’s history.

Parameters

  * 

`options`

(RemovalOptions)

Required permissions

  * browsingData

### removeIndexedDB(options)

Clears websites’ IndexedDB data.

Parameters

  * 

`options`

(RemovalOptions)

Required permissions

  * browsingData

### removeLocalStorage(options)

Clears websites’ local storage data.

Parameters

  * 

`options`

(RemovalOptions)

Required permissions

  * browsingData

### removePasswords(options)

Clears the browser’s stored passwords.

Parameters

  * 

`options`

(RemovalOptions)

Required permissions

  * browsingData

### removePluginData(options)

Clears plugins’ data.

Parameters

  * 

`options`

(RemovalOptions)

Required permissions

  * browsingData

### removeWebSQL(options)

Clears websites’ WebSQL data.

Parameters

  * 

`options`

(RemovalOptions)

Required permissions

  * browsingData

### settings()

Reports which types of data are currently selected in the ‘Clear browsing
data’ settings UI. Note: some of the data types included in this API are not
available in the settings UI, and some UI settings control more than one data
type listed here.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

object

  * 

`dataRemovalPermitted`

(DataTypeSet)

All of the types will be present in the result, with values of true if they
are permitted to be removed (e.g., by enterprise policy) and false if not.

  * 

`dataToRemove`

(DataTypeSet)

All of the types will be present in the result, with values of true if they
are both selected to be removed and permitted to be removed, otherwise false.

  * 

`options`

(RemovalOptions)

Required permissions

  * browsingData

## Types

### DataTypeSet

A set of data types. Missing data types are interpreted as false.

object

  * 

[`cache`]

(boolean, optional)

The browser’s cache. Note: when removing data, this clears the _entire_ cache:
it is not limited to the range you specify.

  * 

[`cookies`]

(boolean, optional)

The browser’s cookies.

  * 

[`downloads`]

(boolean, optional)

The browser’s download list.

  * 

[`formData`]

(boolean, optional)

The browser’s stored form data.

  * 

[`history`]

(boolean, optional)

The browser’s history.

  * 

[`indexedDB`]

(boolean, optional)

Websites’ IndexedDB data.

  * 

[`localStorage`]

(boolean, optional)

Websites’ local storage data.

  * 

[`passwords`]

(boolean, optional)

Stored passwords.

  * 

[`pluginData`]

(boolean, optional)

Plugins’ data.

  * 

[`serverBoundCertificates`]

(boolean, optional)

Server-bound certificates.

  * 

[`serviceWorkers`]

(boolean, optional)

Service Workers.

### RemovalOptions

Options that determine exactly what data will be removed.

object

  * 

[`cookieStoreId`]

(string, optional)

Only remove data associated with this specific cookieStoreId.

  * 

[`hostnames`]

(array of string, optional)

Only remove data associated with these hostnames (only applies to cookies and
localStorage).

  * 

[`originTypes`]

(object, optional)

An object whose properties specify which origin types ought to be cleared. If
this object isn’t specified, it defaults to clearing only “unprotected”
origins. Please ensure that you _really_ want to remove application data
before adding ‘protectedWeb’ or ‘extensions’.

  * 

[`extension`]

(boolean, optional)

Extensions and packaged applications a user has installed (be _really_
careful!).

  * 

[`protectedWeb`]

(boolean, optional)

Websites that have been installed as hosted applications (be careful!).

  * 

[`unprotectedWeb`]

(boolean, optional)

Normal websites.

  * 

[`since`]

([Date](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Date), optional)

Remove data accumulated on or after this date, represented in milliseconds
since the epoch (accessible via the getTime method of the JavaScript Date
object). If absent, defaults to 0 (which would remove all browsing data).

