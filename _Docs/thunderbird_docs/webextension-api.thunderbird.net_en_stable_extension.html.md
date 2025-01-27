≡ extension API

  * Functions

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

# extension API

The browser.extension API has utilities that can be used by any extension
page. It includes support for exchanging messages between an extension and its
content scripts or between extensions, as described in detail in
$(topic:messaging)[Message Passing].

## Functions

### getBackgroundPage()

Returns the JavaScript ‘window’ object for the background page running inside
the current extension. Returns null if the extension has no background page.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[Window](https://developer.mozilla.org/en-US/docs/Web/API/Window)

### getViews([fetchProperties])

Returns an array of the JavaScript ‘window’ objects for each of the pages
running inside the current extension.

Parameters

  * 

[`fetchProperties`]

(object, optional)

  * 

[`tabId`]

(integer, optional)

Find a view according to a tab id. If this field is omitted, returns all
views.

  * 

[`type`]

(ViewType, optional)

The type of view to get. If omitted, returns all views (including background
pages and tabs). Valid values: ‘tab’, ‘popup’, ‘sidebar’.

  * 

[`windowId`]

(integer, optional)

The window to restrict the search to. If omitted, returns all views.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of [Window](https://developer.mozilla.org/en-US/docs/Web/API/Window)

Array of global objects

### isAllowedFileSchemeAccess()

Retrieves the state of the extension’s access to the ‘<file://>’ scheme (as
determined by the user-controlled ‘Allow access to File URLs’ checkbox.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

boolean

True if the extension can access the ‘<file://>’ scheme, false otherwise.

### isAllowedIncognitoAccess()

Retrieves the state of the extension’s access to Incognito-mode (as determined
by the user-controlled ‘Allowed in Incognito’ checkbox.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

boolean

True if the extension has access to Incognito mode, false otherwise.

## Events

## Types

### ViewType

The type of extension view.

string

Supported values:

  * 

tab

  * 

popup

  * 

sidebar

## Properties

### inIncognitoContext

True for content scripts running inside incognito tabs, and for extension
pages running inside an incognito process. The latter only applies to
extensions with ‘split’ incognito_behavior.

### lastError

Set for the lifetime of a callback if an ansychronous extension api has
resulted in an error. If no error has occured lastError will be undefined.

