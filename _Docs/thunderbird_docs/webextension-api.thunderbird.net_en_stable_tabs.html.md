≡ tabs API

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

≡ Related information

  * [Working with WebExtension events](examples/eventListeners.html)

# tabs API

The tabs API supports creating, modifying and interacting with tabs in
Thunderbird windows.

## Permissions

  * 

activeTab

  * 

tabs

Access browser tabs

## Functions

### connect(tabId, [connectInfo])

– [Added in TB 82, backported to TB 78.4.0]

Connects to the content script(s) in the specified tab. The
[runtime.onConnect](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/runtime/onConnect) event is fired in each content script
running in the specified tab for the current extension. For more details, see
[Content Script Messaging](https://developer.mozilla.org/en-
US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts).

Parameters

  * 

`tabId`

(integer)

  * 

[`connectInfo`]

(object, optional)

  * 

[`frameId`]

(integer, optional)

Open a port to a specific frame identified by frameId instead of all frames in
the tab.

  * 

[`name`]

(string, optional)

Will be passed into onConnect for content scripts that are listening for the
connection event.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[Port](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/runtime/Port)

A port that can be used to communicate with the content scripts running in the
specified tab.

### create(createProperties)

Creates a new content tab. Use the [messageDisplay API](messageDisplay.html)
to open messages. Only supported in normal windows. Same-site links in the
loaded page are opened within Thunderbird, all other links are opened in the
user’s default browser. To override this behavior, add-ons have to register a
[content script](https://bugzilla.mozilla.org/show_bug.cgi?id=1618828#c3) ,
capture click events and handle them manually.

Parameters

  * 

`createProperties`

(object)

Properties for the new tab. Defaults to an empty tab, if no url is provided.

  * 

[`active`]

(boolean, optional)

Whether the tab should become the active tab in the window. Does not affect
whether the window is focused (see [update(windowId,
updateInfo)](windows.html#windows-update)). Defaults to true.

  * 

[`cookieStoreId`]

(string, optional)

The [CookieStore](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/contextualIdentities/ContextualIdentity#cookiestoreid)
id the new tab should use. Either a custom id created using the
[contextualIdentities API](https://developer.mozilla.org/en-
US/docs/Mozilla/Add-ons/WebExtensions/API/contextualIdentities), or a built-in
one: firefox-default, firefox-container-1, firefox-container-2, firefox-
container-3, firefox-container-4, firefox-container-5. **Note:** The naming
pattern was deliberately not changed for Thunderbird, but kept for
compatibility reasons.

  * 

[`index`]

(integer, optional)

The position the tab should take in the window. The provided value will be
clamped to between zero and the number of tabs in the window.

  * 

[`selected`]

(boolean, optional) **Unsupported.**

Whether the tab should become the selected tab in the window. Defaults to true

  * 

[`url`]

(string, optional)

The URL to navigate the tab to initially. If the URL points to a content page
(a web page, an extension page or a registered WebExtension protocol handler
page), the tab will navigate to the requested page. All other URLs will be
opened externally after creating an empty tab. Fully-qualified URLs must
include a scheme (i.e. http://www.google.com, not www.google.com). Relative
URLs will be relative to the root of the extension.

  * 

[`windowId`]

(integer, optional)

The window to create the new tab in. Defaults to the current window.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Tab

Details about the created tab. Will contain the ID of the new tab.

### duplicate(tabId)

Duplicates a tab.

Parameters

  * 

`tabId`

(integer)

The ID of the tab which is to be duplicated.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Tab

Details about the duplicated tab. The Tab object doesn’t contain url, title
and favIconUrl if the tabs permission has not been requested.

### get(tabId)

Retrieves details about the specified tab.

Parameters

  * 

`tabId`

(integer)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Tab

### getCurrent()

Gets the tab that this script call is being made from. May be undefined if
called from a non-tab context (for example: a background page or popup view).

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Tab

This may return undefined

### move(tabIds, moveProperties)

Moves one or more tabs to a new position within its current window, or to a
different window. Note that tabs can only be moved to and from windows of type
normal.

Parameters

  * 

`tabIds`

(integer or array of integer)

The tab or list of tabs to move.

  * 

`moveProperties`

(object)

  * 

`index`

(integer)

The position to move the tab to. -1 will place the tab at the end of the
window.

  * 

[`windowId`]

(integer, optional)

Defaults to the window the tab is currently in.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of Tab

Details about the moved tabs.

### query([queryInfo])

Gets all tabs that have the specified properties, or all tabs if no properties
are specified.

Parameters

  * 

[`queryInfo`]

(object, optional)

  * 

[`active`]

(boolean, optional)

Whether the tabs are active in their windows.

  * 

[`cookieStoreId`]

(array of string or string, optional)

The [CookieStore](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/contextualIdentities/ContextualIdentity#cookiestoreid)
id(s) used by the tabs. Either custom ids created using the
[contextualIdentities API](https://developer.mozilla.org/en-
US/docs/Mozilla/Add-ons/WebExtensions/API/contextualIdentities), or built-in
ones: firefox-default, firefox-container-1, firefox-container-2, firefox-
container-3, firefox-container-4, firefox-container-5. **Note:** The naming
pattern was deliberately not changed for Thunderbird, but kept for
compatibility reasons.

  * 

[`currentWindow`]

(boolean, optional)

Whether the tabs are in the current window.

  * 

[`highlighted`]

(boolean, optional)

Whether the tabs are highlighted. Works as an alias of active.

  * 

[`index`]

(integer, optional)

The position of the tabs within their windows.

  * 

[`lastFocusedWindow`]

(boolean, optional)

Whether the tabs are in the last focused window.

  * 

[`spaceId`]

(integer, optional)

The id of the space the tabs should belong to.

  * 

[`status`]

(TabStatus, optional)

Whether the tabs have completed loading.

  * 

[`title`]

(string, optional)

Match page titles against a pattern.

  * 

[`type`]

(TabType or array of TabType, optional)

– [Added in TB 91]

Match tabs against the given tab type or types.

  * 

[`url`]

(string or array of string, optional)

Match tabs against one or more [URL
Patterns](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/Match_patterns). Note that fragment identifiers are not
matched.

  * 

[`windowId`]

(integer, optional)

The ID of the parent window, or [WINDOW_ID_CURRENT](windows.html#windows-
window-id-current) for the current window.

  * 

[`windowType`]

(WindowType, optional)

The type of window the tabs are in.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of Tab

### reload([tabId], [reloadProperties])

Reload a tab. Only applicable for tabs which display a content page.

Parameters

  * 

[`tabId`]

(integer, optional)

The ID of the tab to reload; defaults to the selected tab of the current
window.

  * 

[`reloadProperties`]

(object, optional)

  * 

[`bypassCache`]

(boolean, optional)

Whether using any local cache. Default is false.

### remove(tabIds)

Closes one or more tabs.

Parameters

  * 

`tabIds`

(integer or array of integer)

The tab or list of tabs to close.

### sendMessage(tabId, message, [options])

– [Added in TB 82, backported to TB 78.4.0]

Sends a single message to the content script(s) in the specified tab, with an
optional callback to run when a response is sent back. The
[runtime.onMessage](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/runtime/onMessage) event is fired in each content script
running in the specified tab for the current extension.

Parameters

  * 

`tabId`

(integer)

  * 

`message`

(any)

  * 

[`options`]

(object, optional)

  * 

[`frameId`]

(integer, optional)

Send a message to a specific frame identified by frameId instead of all frames
in the tab.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

any

The JSON response object sent by the handler of the message. If an error
occurs while connecting to the specified tab, the callback will be called with
no arguments and [runtime.lastError](https://developer.mozilla.org/en-
US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/lastError) will be set to
the error message.

### update([tabId], updateProperties)

Modifies the properties of a tab. Properties that are not specified in
updateProperties are not modified.

Parameters

  * 

[`tabId`]

(integer, optional)

Defaults to the selected tab of the current window.

  * 

`updateProperties`

(object)

Properties which should to be updated.

  * 

[`active`]

(boolean, optional)

Set this to true, if the tab should become active. Does not affect whether the
window is focused (see [update(windowId, updateInfo)](windows.html#windows-
update)). Setting this to false has no effect.

  * 

[`url`]

(string, optional)

A URL of a page to load. If the URL points to a content page (a web page, an
extension page or a registered WebExtension protocol handler page), the tab
will navigate to the requested page. All other URLs will be opened externally
without changing the tab. **Note:** This function will throw an error, if a
content page is loaded into a non-content tab (its type must be either content
or mail).

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Tab

Details about the updated tab. The Tab object doesn’t contain url, title and
favIconUrl if the tabs permission has not been requested.

## Events

### onActivated

Fires when the active tab in a window changes. Note that the tab’s URL may not
be set at the time this event fired, but you can listen to onUpdated events to
be notified when a URL is set.

Parameters for onActivated.addListener(listener)

  * 

`listener(activeInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`activeInfo`

(object)

  * 

`tabId`

(integer)

The ID of the tab that has become active.

  * 

`windowId`

(integer)

The ID of the window the active tab changed inside of.

  * 

[`previousTabId`]

(integer, optional)

The ID of the tab that was previously active, if that tab is still open.

### onAttached

Fired when a tab is attached to a window, for example because it was moved
between windows.

Parameters for onAttached.addListener(listener)

  * 

`listener(tabId, attachInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tabId`

(integer)

  * 

`attachInfo`

(object)

  * 

`newPosition`

(integer)

  * 

`newWindowId`

(integer)

### onCreated

Fired when a tab is created. Note that the tab’s URL may not be set at the
time this event fired, but you can listen to onUpdated events to be notified
when a URL is set.

Parameters for onCreated.addListener(listener)

  * 

`listener(tab)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tab`

(Tab)

Details of the tab that was created.

### onDetached

Fired when a tab is detached from a window, for example because it is being
moved between windows.

Parameters for onDetached.addListener(listener)

  * 

`listener(tabId, detachInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tabId`

(integer)

  * 

`detachInfo`

(object)

  * 

`oldPosition`

(integer)

  * 

`oldWindowId`

(integer)

### onMoved

Fired when a tab is moved within a window. Only one move event is fired,
representing the tab the user directly moved. Move events are not fired for
the other tabs that must move in response. This event is not fired when a tab
is moved between windows. For that, see onDetached.

Parameters for onMoved.addListener(listener)

  * 

`listener(tabId, moveInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tabId`

(integer)

  * 

`moveInfo`

(object)

  * 

`fromIndex`

(integer)

  * 

`toIndex`

(integer)

  * 

`windowId`

(integer)

### onRemoved

Fired when a tab is closed.

Parameters for onRemoved.addListener(listener)

  * 

`listener(tabId, removeInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tabId`

(integer)

  * 

`removeInfo`

(object)

  * 

`isWindowClosing`

(boolean)

Is true when the tab is being closed because its window is being closed.

  * 

`windowId`

(integer)

The window whose tab is closed.

### onUpdated

Fired when a tab is updated.

Parameters for onUpdated.addListener(listener, filter)

  * 

`listener(tabId, changeInfo, tab)`

A function that will be called when this event occurs.

  * 

[`filter`]

(UpdateFilter, optional)

A set of filters that restricts the events that will be sent to this listener.

Parameters passed to the listener function

  * 

`tabId`

(integer)

  * 

`changeInfo`

(object)

Lists the changes to the state of the tab that was updated.

  * 

[`favIconUrl`]

(string, optional)

The tab’s new favicon URL.

  * 

[`status`]

(string, optional)

The status of the tab. Can be either loading or complete.

  * 

[`url`]

(string, optional)

The tab’s URL if it has changed.

  * 

`tab`

(Tab)

Gives the state of the tab that was updated.

## Types

### Tab

object

  * 

`active`

(boolean)

Whether the tab is active in its window. (Does not necessarily mean the window
is focused.)

  * 

`highlighted`

(boolean)

Whether the tab is highlighted. Works as an alias of active

  * 

`index`

(integer)

The zero-based index of the tab within its window.

  * 

`selected`

(boolean) **Unsupported.**

Whether the tab is selected.

  * 

[`cookieStoreId`]

(string, optional)

The [CookieStore](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/contextualIdentities/ContextualIdentity#cookiestoreid)
id used by the tab. Either a custom id created using the [contextualIdentities
API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/contextualIdentities), or a built-in one: firefox-
default, firefox-container-1, firefox-container-2, firefox-container-3,
firefox-container-4, firefox-container-5. **Note:** The naming pattern was
deliberately not changed for Thunderbird, but kept for compatibility reasons.

  * 

[`favIconUrl`]

(string, optional)

The URL of the tab’s favicon. This property is only present if the extension’s
manifest includes the tabs permission. It may also be an empty string if the
tab is loading.

  * 

[`height`]

(integer, optional)

The height of the tab in pixels.

  * 

[`id`]

(integer, optional)

The ID of the tab. Tab IDs are unique within a session. Under some
circumstances a Tab may not be assigned an ID. Tab ID can also be set to
TAB_ID_NONE for apps and devtools windows.

  * 

[`spaceId`]

(integer, optional)

The id of the space.

  * 

[`status`]

(string, optional)

Either loading or complete.

  * 

[`title`]

(string, optional)

The title of the tab. This property is only present if the extension’s
manifest includes the tabs permission.

  * 

[`type`]

(TabType, optional)

– [Added in TB 91]

  * 

[`url`]

(string, optional)

The URL the tab is displaying. This property is only present if the
extension’s manifest includes the tabs permission.

  * 

[`width`]

(integer, optional)

The width of the tab in pixels.

  * 

[`windowId`]

(integer, optional)

The ID of the window the tab is contained within.

### TabStatus

Whether the tabs have completed loading.

string

Supported values:

  * 

loading

  * 

complete

### TabType

Tab types supported by the tabs API.

string

Supported values:

  * 

addressBook

  * 

calendar

  * 

calendarEvent

  * 

calendarTask

  * 

chat

  * 

content

  * 

mail

  * 

messageCompose

  * 

messageDisplay

  * 

special

  * 

tasks

### UpdateFilter

An object describing filters to apply to tabs.onUpdated events.

object

  * 

[`properties`]

(array of UpdatePropertyName, optional)

A list of property names. Events that do not match any of the names will be
filtered out.

  * 

[`tabId`]

(integer, optional)

  * 

[`urls`]

(array of string, optional)

A list of URLs or URL patterns. Events that cannot match any of the URLs will
be filtered out. Filtering with urls requires the tabs or activeTab
permission.

  * 

[`windowId`]

(integer, optional)

### UpdatePropertyName

Event names supported in onUpdated.

string

Supported values:

  * 

favIconUrl

  * 

status

  * 

title

### WindowType

The type of a window. Under some circumstances a Window may not be assigned a
type property.

string

Supported values:

  * 

normal

  * 

popup

  * 

panel

  * 

app

  * 

devtools

  * 

messageCompose

  * 

messageDisplay

## Properties

### TAB_ID_NONE

An ID which represents the absence of a tab.

