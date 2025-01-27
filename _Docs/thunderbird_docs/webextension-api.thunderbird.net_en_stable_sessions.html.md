≡ sessions API

  * Functions

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

# sessions API

The sessions API allows to add tab related session data to Thunderbird’s tabs,
which will be restored on app restart.

## Functions

### getTabValue(tabId, key)

Retrieve a previously stored value for a given tab, given its key. Returns
undefined if the key does not exist.

Parameters

  * 

`tabId`

(integer)

ID of the tab whose data you are trying to retrieve. Error is thrown if ID is
invalid.

  * 

`key`

(string)

Key identifying the particular value to retrieve.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

This may return undefined

### removeTabValue(tabId, key)

Remove a key/value pair from a given tab.

Parameters

  * 

`tabId`

(integer)

ID of the tab whose data you are trying to remove. Error is thrown if ID is
invalid.

  * 

`key`

(string)

Key identifying the particular value to remove.

### setTabValue(tabId, key, value)

Store a key/value pair associated with a given tab.

Parameters

  * 

`tabId`

(integer)

ID of the tab with which you want to associate the data. Error is thrown if ID
is invalid.

  * 

`key`

(string)

Key that you can later use to retrieve this particular data value.

  * 

`value`

(string)

