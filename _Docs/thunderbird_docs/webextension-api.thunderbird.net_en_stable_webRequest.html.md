≡ webRequest API

  * Permissions

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

# webRequest API

Use the browser.webRequest API to observe and analyze traffic and to
intercept, block, or modify requests in-flight.

## Permissions

  * 

webRequest

  * 

webRequestAuthProvider

  * 

webRequestBlocking

  * 

webRequestFilterResponse

  * 

webRequestFilterResponse.serviceWorkerScript

Note

The permission webRequest is required to use `messenger.webRequest.*`.

## Functions

### filterResponseData(requestId)

…

Parameters

  * 

`requestId`

(string)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[StreamFilter](https://developer.mozilla.org/en-US/docs/Web/API/StreamFilter)

Required permissions

  * webRequest

  * webRequestBlocking

### getSecurityInfo(requestId, [options])

Retrieves the security information for the request. Returns a promise that
will resolve to a SecurityInfo object.

Parameters

  * 

`requestId`

(string)

  * 

[`options`]

(object, optional)

  * 

[`certificateChain`]

(boolean, optional)

Include the entire certificate chain.

  * 

[`rawDER`]

(boolean, optional)

Include raw certificate data for processing by the extension.

Required permissions

  * webRequest

### handlerBehaviorChanged()

Needs to be called when the behavior of the webRequest handlers has changed to
prevent incorrect handling due to caching. This function call is expensive.
Don’t call it often.

Required permissions

  * webRequest

## Events

### onAuthRequired

Fired when an authentication failure is received. The listener has three
options: it can provide authentication credentials, it can cancel the request
and display the error page, or it can take no action on the challenge. If bad
user credentials are provided, this may be called multiple times for the same
request.

Parameters for onAuthRequired.addListener(listener, filter, extraInfoSpec)

  * 

`listener(details, asyncCallback)`

A function that will be called when this event occurs.

  * 

`filter`

(RequestFilter)

A set of filters that restricts the events that will be sent to this listener.

  * 

[`extraInfoSpec`]

(array of OnAuthRequiredOptions, optional)

Array of extra information that should be passed to the listener function.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`challenger`

(object)

The server requesting authentication.

  * 

`host`

(string)

  * 

`port`

(integer)

  * 

`frameId`

(integer)

The value 0 indicates that the request happens in the main frame; a positive
value indicates the ID of a subframe in which the request happens. If the
document of a (sub-)frame is loaded (type is main_frame or sub_frame), frameId
indicates the ID of this frame, not the ID of the outer frame. Frame IDs are
unique within a tab.

  * 

`isProxy`

(boolean)

True for Proxy-Authenticate, false for WWW-Authenticate.

  * 

`method`

(string)

Standard HTTP method.

  * 

`parentFrameId`

(integer)

ID of frame that wraps the frame which sent the request. Set to -1 if no
parent frame exists.

  * 

`requestId`

(string)

The ID of the request. Request IDs are unique within a browser session. As a
result, they could be used to relate different events of the same request.

  * 

`scheme`

(string)

The authentication scheme, e.g. Basic or Digest.

  * 

`statusCode`

(integer)

Standard HTTP status code returned by the server.

  * 

`statusLine`

(string)

HTTP status line of the response or the ‘HTTP/0.9 200 OK’ string for HTTP/0.9
responses (i.e., responses that lack a status line) or an empty string if
there are no headers.

  * 

`tabId`

(integer)

The ID of the tab in which the request takes place. Set to -1 if the request
isn’t related to a tab.

  * 

`thirdParty`

(boolean)

Indicates if this request and its content window hierarchy is third party.

  * 

`timeStamp`

(number)

The time when this signal is triggered, in milliseconds since the epoch.

  * 

`type`

(ResourceType)

How the requested resource will be used.

  * 

`url`

(string)

  * 

[`cookieStoreId`]

(string, optional)

The cookie store ID of the contextual identity.

  * 

[`documentUrl`]

(string, optional)

URL of the page into which the requested resource will be loaded.

  * 

[`incognito`]

(boolean, optional)

True for private browsing requests.

  * 

[`originUrl`]

(string, optional)

URL of the resource that triggered this request.

  * 

[`realm`]

(string, optional)

The authentication realm provided by the server, if there is one.

  * 

[`responseHeaders`]

(HttpHeaders, optional)

The HTTP response headers that were received along with this response.

  * 

[`urlClassification`]

(UrlClassification, optional)

Tracking classification if the request has been classified.

  * 

[`asyncCallback`]

(function, optional)

Expected return value of the listener function

  * 

BlockingResponse

If “blocking” is specified in the “extraInfoSpec” parameter, the event
listener should return an object of this type.

Required permissions

  * webRequest

### onBeforeRedirect

Fired when a server-initiated redirect is about to occur.

Parameters for onBeforeRedirect.addListener(listener, filter, extraInfoSpec)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

`filter`

(RequestFilter)

A set of filters that restricts the events that will be sent to this listener.

  * 

[`extraInfoSpec`]

(array of OnBeforeRedirectOptions, optional)

Array of extra information that should be passed to the listener function.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`frameId`

(integer)

The value 0 indicates that the request happens in the main frame; a positive
value indicates the ID of a subframe in which the request happens. If the
document of a (sub-)frame is loaded (type is main_frame or sub_frame), frameId
indicates the ID of this frame, not the ID of the outer frame. Frame IDs are
unique within a tab.

  * 

`fromCache`

(boolean)

Indicates if this response was fetched from disk cache.

  * 

`method`

(string)

Standard HTTP method.

  * 

`parentFrameId`

(integer)

ID of frame that wraps the frame which sent the request. Set to -1 if no
parent frame exists.

  * 

`redirectUrl`

(string)

The new URL.

  * 

`requestId`

(string)

The ID of the request. Request IDs are unique within a browser session. As a
result, they could be used to relate different events of the same request.

  * 

`statusCode`

(integer)

Standard HTTP status code returned by the server.

  * 

`statusLine`

(string)

HTTP status line of the response or the ‘HTTP/0.9 200 OK’ string for HTTP/0.9
responses (i.e., responses that lack a status line) or an empty string if
there are no headers.

  * 

`tabId`

(integer)

The ID of the tab in which the request takes place. Set to -1 if the request
isn’t related to a tab.

  * 

`thirdParty`

(boolean)

Indicates if this request and its content window hierarchy is third party.

  * 

`timeStamp`

(number)

The time when this signal is triggered, in milliseconds since the epoch.

  * 

`type`

(ResourceType)

How the requested resource will be used.

  * 

`url`

(string)

  * 

[`cookieStoreId`]

(string, optional)

The cookie store ID of the contextual identity.

  * 

[`documentUrl`]

(string, optional)

URL of the page into which the requested resource will be loaded.

  * 

[`incognito`]

(boolean, optional)

True for private browsing requests.

  * 

[`ip`]

(string, optional)

The server IP address that the request was actually sent to. Note that it may
be a literal IPv6 address.

  * 

[`originUrl`]

(string, optional)

URL of the resource that triggered this request.

  * 

[`responseHeaders`]

(HttpHeaders, optional)

The HTTP response headers that were received along with this redirect.

  * 

[`urlClassification`]

(UrlClassification, optional)

Tracking classification if the request has been classified.

Required permissions

  * webRequest

### onBeforeRequest

Fired when a request is about to occur.

Parameters for onBeforeRequest.addListener(listener, filter, extraInfoSpec)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

`filter`

(RequestFilter)

A set of filters that restricts the events that will be sent to this listener.

  * 

[`extraInfoSpec`]

(array of OnBeforeRequestOptions, optional)

Array of extra information that should be passed to the listener function.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`frameId`

(integer)

The value 0 indicates that the request happens in the main frame; a positive
value indicates the ID of a subframe in which the request happens. If the
document of a (sub-)frame is loaded (type is main_frame or sub_frame), frameId
indicates the ID of this frame, not the ID of the outer frame. Frame IDs are
unique within a tab.

  * 

`method`

(string)

Standard HTTP method.

  * 

`parentFrameId`

(integer)

ID of frame that wraps the frame which sent the request. Set to -1 if no
parent frame exists.

  * 

`requestId`

(string)

The ID of the request. Request IDs are unique within a browser session. As a
result, they could be used to relate different events of the same request.

  * 

`tabId`

(integer)

The ID of the tab in which the request takes place. Set to -1 if the request
isn’t related to a tab.

  * 

`thirdParty`

(boolean)

Indicates if this request and its content window hierarchy is third party.

  * 

`timeStamp`

(number)

The time when this signal is triggered, in milliseconds since the epoch.

  * 

`type`

(ResourceType)

How the requested resource will be used.

  * 

`url`

(string)

  * 

[`cookieStoreId`]

(string, optional)

The cookie store ID of the contextual identity.

  * 

[`documentUrl`]

(string, optional)

URL of the page into which the requested resource will be loaded.

  * 

[`incognito`]

(boolean, optional)

True for private browsing requests.

  * 

[`originUrl`]

(string, optional)

URL of the resource that triggered this request.

  * 

[`requestBody`]

(object, optional)

Contains the HTTP request body data. Only provided if extraInfoSpec contains
‘requestBody’.

  * 

[`error`]

(string, optional)

Errors when obtaining request body data.

  * 

[`formData`]

(object, optional)

If the request method is POST and the body is a sequence of key-value pairs
encoded in UTF8, encoded as either multipart/form-data, or application/x-www-
form-urlencoded, this dictionary is present and for each key contains the list
of all values for that key. If the data is of another media type, or if it is
malformed, the dictionary is not present. An example value of this dictionary
is {‘key’: [‘value1’, ‘value2’]}.

  * 

[`raw`]

(array of UploadData, optional)

If the request method is PUT or POST, and the body is not already parsed in
formData, then the unparsed request body elements are contained in this array.

  * 

[`urlClassification`]

(UrlClassification, optional)

Tracking classification if the request has been classified.

Expected return value of the listener function

  * 

BlockingResponse

If “blocking” is specified in the “extraInfoSpec” parameter, the event
listener should return an object of this type.

Required permissions

  * webRequest

### onBeforeSendHeaders

Fired before sending an HTTP request, once the request headers are available.
This may occur after a TCP connection is made to the server, but before any
HTTP data is sent.

Parameters for onBeforeSendHeaders.addListener(listener, filter,
extraInfoSpec)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

`filter`

(RequestFilter)

A set of filters that restricts the events that will be sent to this listener.

  * 

[`extraInfoSpec`]

(array of OnBeforeSendHeadersOptions, optional)

Array of extra information that should be passed to the listener function.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`frameId`

(integer)

The value 0 indicates that the request happens in the main frame; a positive
value indicates the ID of a subframe in which the request happens. If the
document of a (sub-)frame is loaded (type is main_frame or sub_frame), frameId
indicates the ID of this frame, not the ID of the outer frame. Frame IDs are
unique within a tab.

  * 

`method`

(string)

Standard HTTP method.

  * 

`parentFrameId`

(integer)

ID of frame that wraps the frame which sent the request. Set to -1 if no
parent frame exists.

  * 

`requestId`

(string)

The ID of the request. Request IDs are unique within a browser session. As a
result, they could be used to relate different events of the same request.

  * 

`tabId`

(integer)

The ID of the tab in which the request takes place. Set to -1 if the request
isn’t related to a tab.

  * 

`thirdParty`

(boolean)

Indicates if this request and its content window hierarchy is third party.

  * 

`timeStamp`

(number)

The time when this signal is triggered, in milliseconds since the epoch.

  * 

`type`

(ResourceType)

How the requested resource will be used.

  * 

`url`

(string)

  * 

[`cookieStoreId`]

(string, optional)

The cookie store ID of the contextual identity.

  * 

[`documentUrl`]

(string, optional)

URL of the page into which the requested resource will be loaded.

  * 

[`incognito`]

(boolean, optional)

True for private browsing requests.

  * 

[`originUrl`]

(string, optional)

URL of the resource that triggered this request.

  * 

[`requestHeaders`]

(HttpHeaders, optional)

The HTTP request headers that are going to be sent out with this request.

  * 

[`urlClassification`]

(UrlClassification, optional)

Tracking classification if the request has been classified.

Expected return value of the listener function

  * 

BlockingResponse

If “blocking” is specified in the “extraInfoSpec” parameter, the event
listener should return an object of this type.

Required permissions

  * webRequest

### onCompleted

Fired when a request is completed.

Parameters for onCompleted.addListener(listener, filter, extraInfoSpec)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

`filter`

(RequestFilter)

A set of filters that restricts the events that will be sent to this listener.

  * 

[`extraInfoSpec`]

(array of OnCompletedOptions, optional)

Array of extra information that should be passed to the listener function.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`frameId`

(integer)

The value 0 indicates that the request happens in the main frame; a positive
value indicates the ID of a subframe in which the request happens. If the
document of a (sub-)frame is loaded (type is main_frame or sub_frame), frameId
indicates the ID of this frame, not the ID of the outer frame. Frame IDs are
unique within a tab.

  * 

`fromCache`

(boolean)

Indicates if this response was fetched from disk cache.

  * 

`method`

(string)

Standard HTTP method.

  * 

`parentFrameId`

(integer)

ID of frame that wraps the frame which sent the request. Set to -1 if no
parent frame exists.

  * 

`requestId`

(string)

The ID of the request. Request IDs are unique within a browser session. As a
result, they could be used to relate different events of the same request.

  * 

`requestSize`

(integer)

For http requests, the bytes transferred in the request. Only available in
onCompleted.

  * 

`responseSize`

(integer)

For http requests, the bytes received in the request. Only available in
onCompleted.

  * 

`statusCode`

(integer)

Standard HTTP status code returned by the server.

  * 

`statusLine`

(string)

HTTP status line of the response or the ‘HTTP/0.9 200 OK’ string for HTTP/0.9
responses (i.e., responses that lack a status line) or an empty string if
there are no headers.

  * 

`tabId`

(integer)

The ID of the tab in which the request takes place. Set to -1 if the request
isn’t related to a tab.

  * 

`thirdParty`

(boolean)

Indicates if this request and its content window hierarchy is third party.

  * 

`timeStamp`

(number)

The time when this signal is triggered, in milliseconds since the epoch.

  * 

`type`

(ResourceType)

How the requested resource will be used.

  * 

`url`

(string)

  * 

`urlClassification`

(UrlClassification)

Tracking classification if the request has been classified.

  * 

[`cookieStoreId`]

(string, optional)

The cookie store ID of the contextual identity.

  * 

[`documentUrl`]

(string, optional)

URL of the page into which the requested resource will be loaded.

  * 

[`incognito`]

(boolean, optional)

True for private browsing requests.

  * 

[`ip`]

(string, optional)

The server IP address that the request was actually sent to. Note that it may
be a literal IPv6 address.

  * 

[`originUrl`]

(string, optional)

URL of the resource that triggered this request.

  * 

[`responseHeaders`]

(HttpHeaders, optional)

The HTTP response headers that were received along with this response.

Required permissions

  * webRequest

### onErrorOccurred

Fired when an error occurs.

Parameters for onErrorOccurred.addListener(listener, filter)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

`filter`

(RequestFilter)

A set of filters that restricts the events that will be sent to this listener.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`error`

(string)

The error description. This string is _not_ guaranteed to remain backwards
compatible between releases. You must not parse and act based upon its
content.

  * 

`frameId`

(integer)

The value 0 indicates that the request happens in the main frame; a positive
value indicates the ID of a subframe in which the request happens. If the
document of a (sub-)frame is loaded (type is main_frame or sub_frame), frameId
indicates the ID of this frame, not the ID of the outer frame. Frame IDs are
unique within a tab.

  * 

`fromCache`

(boolean)

Indicates if this response was fetched from disk cache.

  * 

`method`

(string)

Standard HTTP method.

  * 

`parentFrameId`

(integer)

ID of frame that wraps the frame which sent the request. Set to -1 if no
parent frame exists.

  * 

`requestId`

(string)

The ID of the request. Request IDs are unique within a browser session. As a
result, they could be used to relate different events of the same request.

  * 

`tabId`

(integer)

The ID of the tab in which the request takes place. Set to -1 if the request
isn’t related to a tab.

  * 

`thirdParty`

(boolean)

Indicates if this request and its content window hierarchy is third party.

  * 

`timeStamp`

(number)

The time when this signal is triggered, in milliseconds since the epoch.

  * 

`type`

(ResourceType)

How the requested resource will be used.

  * 

`url`

(string)

  * 

[`cookieStoreId`]

(string, optional)

The cookie store ID of the contextual identity.

  * 

[`documentUrl`]

(string, optional)

URL of the page into which the requested resource will be loaded.

  * 

[`incognito`]

(boolean, optional)

True for private browsing requests.

  * 

[`ip`]

(string, optional)

The server IP address that the request was actually sent to. Note that it may
be a literal IPv6 address.

  * 

[`originUrl`]

(string, optional)

URL of the resource that triggered this request.

  * 

[`urlClassification`]

(UrlClassification, optional)

Tracking classification if the request has been classified.

Required permissions

  * webRequest

### onHeadersReceived

Fired when HTTP response headers of a request have been received.

Parameters for onHeadersReceived.addListener(listener, filter, extraInfoSpec)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

`filter`

(RequestFilter)

A set of filters that restricts the events that will be sent to this listener.

  * 

[`extraInfoSpec`]

(array of OnHeadersReceivedOptions, optional)

Array of extra information that should be passed to the listener function.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`frameId`

(integer)

The value 0 indicates that the request happens in the main frame; a positive
value indicates the ID of a subframe in which the request happens. If the
document of a (sub-)frame is loaded (type is main_frame or sub_frame), frameId
indicates the ID of this frame, not the ID of the outer frame. Frame IDs are
unique within a tab.

  * 

`method`

(string)

Standard HTTP method.

  * 

`parentFrameId`

(integer)

ID of frame that wraps the frame which sent the request. Set to -1 if no
parent frame exists.

  * 

`requestId`

(string)

The ID of the request. Request IDs are unique within a browser session. As a
result, they could be used to relate different events of the same request.

  * 

`statusCode`

(integer)

Standard HTTP status code returned by the server.

  * 

`statusLine`

(string)

HTTP status line of the response or the ‘HTTP/0.9 200 OK’ string for HTTP/0.9
responses (i.e., responses that lack a status line).

  * 

`tabId`

(integer)

The ID of the tab in which the request takes place. Set to -1 if the request
isn’t related to a tab.

  * 

`thirdParty`

(boolean)

Indicates if this request and its content window hierarchy is third party.

  * 

`timeStamp`

(number)

The time when this signal is triggered, in milliseconds since the epoch.

  * 

`type`

(ResourceType)

How the requested resource will be used.

  * 

`url`

(string)

  * 

[`cookieStoreId`]

(string, optional)

The cookie store ID of the contextual identity.

  * 

[`documentUrl`]

(string, optional)

URL of the page into which the requested resource will be loaded.

  * 

[`incognito`]

(boolean, optional)

True for private browsing requests.

  * 

[`originUrl`]

(string, optional)

URL of the resource that triggered this request.

  * 

[`responseHeaders`]

(HttpHeaders, optional)

The HTTP response headers that have been received with this response.

  * 

[`urlClassification`]

(UrlClassification, optional)

Tracking classification if the request has been classified.

Expected return value of the listener function

  * 

BlockingResponse

If “blocking” is specified in the “extraInfoSpec” parameter, the event
listener should return an object of this type.

Required permissions

  * webRequest

### onResponseStarted

Fired when the first byte of the response body is received. For HTTP requests,
this means that the status line and response headers are available.

Parameters for onResponseStarted.addListener(listener, filter, extraInfoSpec)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

`filter`

(RequestFilter)

A set of filters that restricts the events that will be sent to this listener.

  * 

[`extraInfoSpec`]

(array of OnResponseStartedOptions, optional)

Array of extra information that should be passed to the listener function.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`frameId`

(integer)

The value 0 indicates that the request happens in the main frame; a positive
value indicates the ID of a subframe in which the request happens. If the
document of a (sub-)frame is loaded (type is main_frame or sub_frame), frameId
indicates the ID of this frame, not the ID of the outer frame. Frame IDs are
unique within a tab.

  * 

`fromCache`

(boolean)

Indicates if this response was fetched from disk cache.

  * 

`method`

(string)

Standard HTTP method.

  * 

`parentFrameId`

(integer)

ID of frame that wraps the frame which sent the request. Set to -1 if no
parent frame exists.

  * 

`requestId`

(string)

The ID of the request. Request IDs are unique within a browser session. As a
result, they could be used to relate different events of the same request.

  * 

`statusCode`

(integer)

Standard HTTP status code returned by the server.

  * 

`statusLine`

(string)

HTTP status line of the response or the ‘HTTP/0.9 200 OK’ string for HTTP/0.9
responses (i.e., responses that lack a status line) or an empty string if
there are no headers.

  * 

`tabId`

(integer)

The ID of the tab in which the request takes place. Set to -1 if the request
isn’t related to a tab.

  * 

`thirdParty`

(boolean)

Indicates if this request and its content window hierarchy is third party.

  * 

`timeStamp`

(number)

The time when this signal is triggered, in milliseconds since the epoch.

  * 

`type`

(ResourceType)

How the requested resource will be used.

  * 

`url`

(string)

  * 

[`cookieStoreId`]

(string, optional)

The cookie store ID of the contextual identity.

  * 

[`documentUrl`]

(string, optional)

URL of the page into which the requested resource will be loaded.

  * 

[`incognito`]

(boolean, optional)

True for private browsing requests.

  * 

[`ip`]

(string, optional)

The server IP address that the request was actually sent to. Note that it may
be a literal IPv6 address.

  * 

[`originUrl`]

(string, optional)

URL of the resource that triggered this request.

  * 

[`responseHeaders`]

(HttpHeaders, optional)

The HTTP response headers that were received along with this response.

  * 

[`urlClassification`]

(UrlClassification, optional)

Tracking classification if the request has been classified.

Required permissions

  * webRequest

### onSendHeaders

Fired just before a request is going to be sent to the server (modifications
of previous onBeforeSendHeaders callbacks are visible by the time
onSendHeaders is fired).

Parameters for onSendHeaders.addListener(listener, filter, extraInfoSpec)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

`filter`

(RequestFilter)

A set of filters that restricts the events that will be sent to this listener.

  * 

[`extraInfoSpec`]

(array of OnSendHeadersOptions, optional)

Array of extra information that should be passed to the listener function.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`frameId`

(integer)

The value 0 indicates that the request happens in the main frame; a positive
value indicates the ID of a subframe in which the request happens. If the
document of a (sub-)frame is loaded (type is main_frame or sub_frame), frameId
indicates the ID of this frame, not the ID of the outer frame. Frame IDs are
unique within a tab.

  * 

`method`

(string)

Standard HTTP method.

  * 

`parentFrameId`

(integer)

ID of frame that wraps the frame which sent the request. Set to -1 if no
parent frame exists.

  * 

`requestId`

(string)

The ID of the request. Request IDs are unique within a browser session. As a
result, they could be used to relate different events of the same request.

  * 

`tabId`

(integer)

The ID of the tab in which the request takes place. Set to -1 if the request
isn’t related to a tab.

  * 

`thirdParty`

(boolean)

Indicates if this request and its content window hierarchy is third party.

  * 

`timeStamp`

(number)

The time when this signal is triggered, in milliseconds since the epoch.

  * 

`type`

(ResourceType)

How the requested resource will be used.

  * 

`url`

(string)

  * 

[`cookieStoreId`]

(string, optional)

The cookie store ID of the contextual identity.

  * 

[`documentUrl`]

(string, optional)

URL of the page into which the requested resource will be loaded.

  * 

[`incognito`]

(boolean, optional)

True for private browsing requests.

  * 

[`originUrl`]

(string, optional)

URL of the resource that triggered this request.

  * 

[`requestHeaders`]

(HttpHeaders, optional)

The HTTP request headers that have been sent out with this request.

  * 

[`urlClassification`]

(UrlClassification, optional)

Tracking classification if the request has been classified.

Required permissions

  * webRequest

## Types

### BlockingResponse

Returns value for event handlers that have the ‘blocking’ extraInfoSpec
applied. Allows the event handler to modify network requests.

object

  * 

[`authCredentials`]

(object, optional)

Only used as a response to the onAuthRequired event. If set, the request is
made using the supplied credentials.

  * 

`password`

(string)

  * 

`username`

(string)

  * 

[`cancel`]

(boolean, optional)

If true, the request is cancelled. Used in onBeforeRequest, this prevents the
request from being sent.

  * 

[`redirectUrl`]

(string, optional)

Only used as a response to the onBeforeRequest and onHeadersReceived events.
If set, the original request is prevented from being sent/completed and is
instead redirected to the given URL. Redirections to non-HTTP schemes such as
data: are allowed. Redirects initiated by a redirect action use the original
request method for the redirect, with one exception: If the redirect is
initiated at the onHeadersReceived stage, then the redirect will be issued
using the GET method.

  * 

[`requestHeaders`]

(HttpHeaders, optional)

Only used as a response to the onBeforeSendHeaders event. If set, the request
is made with these request headers instead.

  * 

[`responseHeaders`]

(HttpHeaders, optional)

Only used as a response to the onHeadersReceived event. If set, the server is
assumed to have responded with these response headers instead. Only return
responseHeaders if you really want to modify the headers in order to limit the
number of conflicts (only one extension may modify responseHeaders for each
request).

  * 

[`upgradeToSecure`]

(boolean, optional)

Only used as a response to the onBeforeRequest event. If set, the original
request is prevented from being sent/completed and is instead upgraded to a
secure request. If any extension returns redirectUrl during onBeforeRequest,
upgradeToSecure will have no affect.

### CertificateInfo

Contains the certificate properties of the request if it is a secure request.

object

  * 

`fingerprint`

(object)

  * 

`sha1`

(string)

  * 

`sha256`

(string)

  * 

`isBuiltInRoot`

(boolean)

  * 

`issuer`

(string)

  * 

`serialNumber`

(string)

  * 

`subject`

(string)

  * 

`subjectPublicKeyInfoDigest`

(object)

  * 

`sha256`

(string)

  * 

`validity`

(object)

Contains start and end timestamps.

  * 

`end`

(integer)

  * 

`start`

(integer)

  * 

[`rawDER`]

(array of integer, optional)

### CertificateTransparencyStatus

string

Supported values:

  * 

not_applicable

  * 

policy_compliant

  * 

policy_not_enough_scts

  * 

policy_not_diverse_scts

### HttpHeaders

An array of HTTP headers. Each header is represented as a dictionary
containing the keys name and either value or binaryValue.

array of object

### OnAuthRequiredOptions

string

Supported values:

  * 

responseHeaders

  * 

blocking

  * 

asyncBlocking

### OnBeforeRedirectOptions

string

Supported values:

  * 

responseHeaders

### OnBeforeRequestOptions

string

Supported values:

  * 

blocking

  * 

requestBody

### OnBeforeSendHeadersOptions

string

Supported values:

  * 

requestHeaders

  * 

blocking

### OnCompletedOptions

string

Supported values:

  * 

responseHeaders

### OnHeadersReceivedOptions

string

Supported values:

  * 

blocking

  * 

responseHeaders

### OnResponseStartedOptions

string

Supported values:

  * 

responseHeaders

### OnSendHeadersOptions

string

Supported values:

  * 

requestHeaders

### RequestFilter

An object describing filters to apply to webRequest events.

object

  * 

`urls`

(array of string)

A list of URLs or URL patterns. Requests that cannot match any of the URLs
will be filtered out.

  * 

[`incognito`]

(boolean, optional)

If provided, requests that do not match the incognito state will be filtered
out.

  * 

[`tabId`]

(integer, optional)

  * 

[`types`]

(array of ResourceType, optional)

A list of request types. Requests that cannot match any of the types will be
filtered out.

  * 

[`windowId`]

(integer, optional)

### ResourceType

string

Supported values:

  * 

main_frame

  * 

sub_frame

  * 

stylesheet

  * 

script

  * 

image

  * 

object

  * 

object_subrequest

  * 

xmlhttprequest

  * 

xslt

  * 

ping

  * 

beacon

  * 

xml_dtd

  * 

font

  * 

media

  * 

websocket

  * 

csp_report

  * 

imageset

  * 

web_manifest

  * 

speculative

  * 

other

### SecurityInfo

Contains the security properties of the request (ie. SSL/TLS information).

object

  * 

`certificates`

(array of CertificateInfo)

Certificate data if state is “secure”. Will only contain one entry unless
certificateChain is passed as an option.

  * 

`state`

(string)

Supported values:

  * 

insecure

  * 

weak

  * 

broken

  * 

secure

  * 

[`certificateTransparencyStatus`]

(CertificateTransparencyStatus, optional)

Certificate transparency compliance per RFC 6962. See https://www.certificate-
transparency.org/what-is-ct for more information.

  * 

[`cipherSuite`]

(string, optional)

The cipher suite used in this request if state is “secure”.

  * 

[`errorMessage`]

(string, optional)

Error message if state is “broken”

  * 

[`hpkp`]

(string, optional)

True if host uses Public Key Pinning and state is “secure”.

  * 

[`hsts`]

(boolean, optional)

True if host uses Strict Transport Security and state is “secure”.

  * 

[`isDomainMismatch`]

(boolean, optional) **Deprecated.**

The domain name does not match the certificate domain.

  * 

[`isExtendedValidation`]

(boolean, optional)

  * 

[`isNotValidAtThisTime`]

(boolean, optional) **Deprecated.**

The certificate is either expired or is not yet valid. See
CertificateInfo.validity for start and end dates.

  * 

[`isUntrusted`]

(boolean, optional) **Deprecated.**

  * 

[`keaGroupName`]

(string, optional)

The key exchange algorithm used in this request if state is “secure”.

  * 

[`overridableErrorCategory`]

(string, optional)

The type of certificate error that was overridden for this connection, if any.

Supported values:

  * 

trust_error

  * 

domain_mismatch

  * 

expired_or_not_yet_valid

  * 

[`protocolVersion`]

(string, optional)

Protocol version if state is “secure”

Supported values:

  * 

TLSv1

  * 

TLSv1.1

  * 

TLSv1.2

  * 

TLSv1.3

  * 

unknown

  * 

[`secretKeyLength`]

(number, optional)

The length (in bits) of the secret key.

  * 

[`signatureSchemeName`]

(string, optional)

The signature scheme used in this request if state is “secure”.

  * 

[`usedDelegatedCredentials`]

(boolean, optional)

True if the TLS connection used Delegated Credentials.

  * 

[`usedEch`]

(boolean, optional)

True if the TLS connection used Encrypted Client Hello.

  * 

[`usedOcsp`]

(boolean, optional)

True if the TLS connection made OCSP requests.

  * 

[`usedPrivateDns`]

(boolean, optional)

True if the TLS connection used a privacy-preserving DNS transport like DNS-
over-HTTPS.

  * 

[`weaknessReasons`]

(array of TransportWeaknessReasons, optional)

list of reasons that cause the request to be considered weak, if state is
“weak”

### TransportWeaknessReasons

string

Supported values:

  * 

cipher

### UploadData

Contains data uploaded in a URL request.

object

  * 

[`bytes`]

(any, optional)

An ArrayBuffer with a copy of the data.

  * 

[`file`]

(string, optional)

A string with the file’s path and name.

### UrlClassification

object

  * 

`firstParty`

(UrlClassificationParty)

Classification flags if the request has been classified and it is first party.

  * 

`thirdParty`

(UrlClassificationParty)

Classification flags if the request has been classified and it or its window
hierarchy is third party.

### UrlClassificationFlags

Tracking flags that match our internal tracking classification

string

Supported values:

  * 

fingerprinting

  * 

fingerprinting_content

  * 

cryptomining

  * 

cryptomining_content

  * 

emailtracking

  * 

emailtracking_content

  * 

tracking

  * 

tracking_ad

  * 

tracking_analytics

  * 

tracking_social

  * 

tracking_content

  * 

any_basic_tracking

  * 

any_strict_tracking

  * 

any_social_tracking

### UrlClassificationParty

If the request has been classified this is an array of UrlClassificationFlags.

array of UrlClassificationFlags

## Properties

### MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES

The maximum number of times that handlerBehaviorChanged can be called per 10
minute sustained interval. handlerBehaviorChanged is an expensive function
call that shouldn’t be called often.

