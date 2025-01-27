≡ webNavigation API

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

# webNavigation API

Use the browser.webNavigation API to receive notifications about the status of
navigation requests in-flight.

## Permissions

  * 

webNavigation

Access browser activity during navigation

Note

The permission webNavigation is required to use `messenger.webNavigation.*`.

## Functions

### getAllFrames(details)

Retrieves information about all frames of a given tab.

Parameters

  * 

`details`

(object)

Information about the tab to retrieve all frames from.

  * 

`tabId`

(integer)

The ID of the tab.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of object

A list of frames in the given tab, null if the specified tab ID is invalid.

Required permissions

  * webNavigation

### getFrame(details)

Retrieves information about the given frame. A frame refers to an
&lt;iframe&gt; or a &lt;frame&gt; of a web page and is identified by a tab ID
and a frame ID.

Parameters

  * 

`details`

(object)

Information about the frame to retrieve information about.

  * 

`frameId`

(integer)

The ID of the frame in the given tab.

  * 

`tabId`

(integer)

The ID of the tab in which the frame is.

  * 

[`processId`]

(integer, optional)

The ID of the process runs the renderer for this tab.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

object

Information about the requested frame, null if the specified frame ID and/or
tab ID are invalid.

  * 

`frameId`

(integer)

The ID of the frame. 0 indicates that this is the main frame; a positive value
indicates the ID of a subframe.

  * 

`parentFrameId`

(integer)

ID of frame that wraps the frame. Set to -1 of no parent frame exists.

  * 

`tabId`

(integer)

The ID of the tab in which the frame is.

  * 

`url`

(string)

The URL currently associated with this frame, if the frame identified by the
frameId existed at one point in the given tab. The fact that an URL is
associated with a given frameId does not imply that the corresponding frame
still exists.

  * 

[`errorOccurred`]

(boolean, optional)

True if the last navigation in this frame was interrupted by an error, i.e.
the onErrorOccurred event fired.

Required permissions

  * webNavigation

## Events

### onBeforeNavigate

Fired when a navigation is about to occur.

Parameters for onBeforeNavigate.addListener(listener, filters)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

[`filters`]

(EventUrlFilters, optional)

Conditions that the URL being navigated to must satisfy. The ‘schemes’ and
‘ports’ fields of UrlFilter are ignored for this event.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`frameId`

(integer)

0 indicates the navigation happens in the tab content window; a positive value
indicates navigation in a subframe. Frame IDs are unique for a given tab and
process.

  * 

`parentFrameId`

(integer)

ID of frame that wraps the frame. Set to -1 of no parent frame exists.

  * 

`processId`

(integer) **Unsupported.**

The ID of the process runs the renderer for this tab.

  * 

`tabId`

(integer)

The ID of the tab in which the navigation is about to occur.

  * 

`timeStamp`

(number)

The time when the browser was about to start the navigation, in milliseconds
since the epoch.

  * 

`url`

(string)

Required permissions

  * webNavigation

### onCommitted

Fired when a navigation is committed. The document (and the resources it
refers to, such as images and subframes) might still be downloading, but at
least part of the document has been received from the server and the browser
has decided to switch to the new document.

Parameters for onCommitted.addListener(listener, filters)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

[`filters`]

(EventUrlFilters, optional)

Conditions that the URL being navigated to must satisfy. The ‘schemes’ and
‘ports’ fields of UrlFilter are ignored for this event.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`frameId`

(integer)

0 indicates the navigation happens in the tab content window; a positive value
indicates navigation in a subframe. Frame IDs are unique within a tab.

  * 

`processId`

(integer) **Unsupported.**

The ID of the process runs the renderer for this tab.

  * 

`tabId`

(integer)

The ID of the tab in which the navigation occurs.

  * 

`timeStamp`

(number)

The time when the navigation was committed, in milliseconds since the epoch.

  * 

`transitionQualifiers`

(array of TransitionQualifier)

A list of transition qualifiers.

  * 

`transitionType`

(TransitionType)

Cause of the navigation.

  * 

`url`

(string)

Required permissions

  * webNavigation

### onCompleted

Fired when a document, including the resources it refers to, is completely
loaded and initialized.

Parameters for onCompleted.addListener(listener, filters)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

[`filters`]

(EventUrlFilters, optional)

Conditions that the URL being navigated to must satisfy. The ‘schemes’ and
‘ports’ fields of UrlFilter are ignored for this event.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`frameId`

(integer)

0 indicates the navigation happens in the tab content window; a positive value
indicates navigation in a subframe. Frame IDs are unique within a tab.

  * 

`processId`

(integer) **Unsupported.**

The ID of the process runs the renderer for this tab.

  * 

`tabId`

(integer)

The ID of the tab in which the navigation occurs.

  * 

`timeStamp`

(number)

The time when the document finished loading, in milliseconds since the epoch.

  * 

`url`

(string)

Required permissions

  * webNavigation

### onCreatedNavigationTarget

Fired when a new window, or a new tab in an existing window, is created to
host a navigation.

Parameters for onCreatedNavigationTarget.addListener(listener, filters)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

[`filters`]

(EventUrlFilters, optional)

Conditions that the URL being navigated to must satisfy. The ‘schemes’ and
‘ports’ fields of UrlFilter are ignored for this event.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`sourceFrameId`

(integer)

The ID of the frame with sourceTabId in which the navigation is triggered. 0
indicates the main frame.

  * 

`sourceProcessId`

(integer)

The ID of the process runs the renderer for the source tab.

  * 

`sourceTabId`

(integer)

The ID of the tab in which the navigation is triggered.

  * 

`tabId`

(integer)

The ID of the tab in which the url is opened

  * 

`timeStamp`

(number)

The time when the browser was about to create a new view, in milliseconds
since the epoch.

  * 

`url`

(string)

The URL to be opened in the new window.

Required permissions

  * webNavigation

### onDOMContentLoaded

Fired when the page’s DOM is fully constructed, but the referenced resources
may not finish loading.

Parameters for onDOMContentLoaded.addListener(listener, filters)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

[`filters`]

(EventUrlFilters, optional)

Conditions that the URL being navigated to must satisfy. The ‘schemes’ and
‘ports’ fields of UrlFilter are ignored for this event.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`frameId`

(integer)

0 indicates the navigation happens in the tab content window; a positive value
indicates navigation in a subframe. Frame IDs are unique within a tab.

  * 

`processId`

(integer) **Unsupported.**

The ID of the process runs the renderer for this tab.

  * 

`tabId`

(integer)

The ID of the tab in which the navigation occurs.

  * 

`timeStamp`

(number)

The time when the page’s DOM was fully constructed, in milliseconds since the
epoch.

  * 

`url`

(string)

Required permissions

  * webNavigation

### onErrorOccurred

Fired when an error occurs and the navigation is aborted. This can happen if
either a network error occurred, or the user aborted the navigation.

Parameters for onErrorOccurred.addListener(listener, filters)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

[`filters`]

(EventUrlFilters, optional)

Conditions that the URL being navigated to must satisfy. The ‘schemes’ and
‘ports’ fields of UrlFilter are ignored for this event.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`error`

(string) **Unsupported.**

The error description.

  * 

`frameId`

(integer)

0 indicates the navigation happens in the tab content window; a positive value
indicates navigation in a subframe. Frame IDs are unique within a tab.

  * 

`processId`

(integer) **Unsupported.**

The ID of the process runs the renderer for this tab.

  * 

`tabId`

(integer)

The ID of the tab in which the navigation occurs.

  * 

`timeStamp`

(number)

The time when the error occurred, in milliseconds since the epoch.

  * 

`url`

(string)

Required permissions

  * webNavigation

### onHistoryStateUpdated

Fired when the frame’s history was updated to a new URL. All future events for
that frame will use the updated URL.

Parameters for onHistoryStateUpdated.addListener(listener, filters)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

[`filters`]

(EventUrlFilters, optional)

Conditions that the URL being navigated to must satisfy. The ‘schemes’ and
‘ports’ fields of UrlFilter are ignored for this event.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`frameId`

(integer)

0 indicates the navigation happens in the tab content window; a positive value
indicates navigation in a subframe. Frame IDs are unique within a tab.

  * 

`processId`

(integer) **Unsupported.**

The ID of the process runs the renderer for this tab.

  * 

`tabId`

(integer)

The ID of the tab in which the navigation occurs.

  * 

`timeStamp`

(number)

The time when the navigation was committed, in milliseconds since the epoch.

  * 

`transitionQualifiers`

(array of TransitionQualifier)

A list of transition qualifiers.

  * 

`transitionType`

(TransitionType)

Cause of the navigation.

  * 

`url`

(string)

Required permissions

  * webNavigation

### onReferenceFragmentUpdated

Fired when the reference fragment of a frame was updated. All future events
for that frame will use the updated URL.

Parameters for onReferenceFragmentUpdated.addListener(listener, filters)

  * 

`listener(details)`

A function that will be called when this event occurs.

  * 

[`filters`]

(EventUrlFilters, optional)

Conditions that the URL being navigated to must satisfy. The ‘schemes’ and
‘ports’ fields of UrlFilter are ignored for this event.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`frameId`

(integer)

0 indicates the navigation happens in the tab content window; a positive value
indicates navigation in a subframe. Frame IDs are unique within a tab.

  * 

`processId`

(integer) **Unsupported.**

The ID of the process runs the renderer for this tab.

  * 

`tabId`

(integer)

The ID of the tab in which the navigation occurs.

  * 

`timeStamp`

(number)

The time when the navigation was committed, in milliseconds since the epoch.

  * 

`transitionQualifiers`

(array of TransitionQualifier)

A list of transition qualifiers.

  * 

`transitionType`

(TransitionType)

Cause of the navigation.

  * 

`url`

(string)

Required permissions

  * webNavigation

### onTabReplaced

Fired when the contents of the tab is replaced by a different (usually
previously pre-rendered) tab.

Parameters for onTabReplaced.addListener(listener)

  * 

`listener(details)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`details`

(object)

  * 

`replacedTabId`

(integer)

The ID of the tab that was replaced.

  * 

`tabId`

(integer)

The ID of the tab that replaced the old tab.

  * 

`timeStamp`

(number)

The time when the replacement happened, in milliseconds since the epoch.

Required permissions

  * webNavigation

## Types

### EventUrlFilters

object

  * 

`url`

(array of [UrlFilter](events.html#events-urlfilter))

### TransitionQualifier

string

Supported values:

  * 

client_redirect

  * 

server_redirect

  * 

forward_back

  * 

from_address_bar

### TransitionType

Cause of the navigation. The same transition types as defined in the history
API are used. These are the same transition types as defined in the
$(topic:transition_types)[history API] except with “start_page” in place of
“auto_toplevel” (for backwards compatibility).

string

Supported values:

  * 

link

  * 

typed

  * 

auto_bookmark

  * 

auto_subframe

  * 

manual_subframe

  * 

generated

  * 

start_page

  * 

form_submit

  * 

reload

  * 

keyword

  * 

keyword_generated

