≡ windows API

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

≡ Related examples on Github

  * [“Await Popup” example](https://github.com/thunderbird/sample-extensions/tree/master/manifest_v3/awaitPopup)

# windows API

Note

These APIs are for the main Thunderbird windows which can contain webpage tabs
and also other window types like composer that cannot contain webpage tabs.
Make sure your code interacts with windows appropriately, depending on their
type.

The windows API supports creating, modifying and interacting with Thunderbird
windows.

## Functions

### create([createData])

Creates (opens) a new window with any optional sizing, position or default URL
provided. When loading a page into a popup window, same-site links are opened
within the same window, all other links are opened in the user’s default
browser. To override this behavior, add-ons have to register a [content
script](https://bugzilla.mozilla.org/show_bug.cgi?id=1618828#c3) , capture
click events and handle them manually. Same-site links with targets other than
_self are opened in a new tab in the most recent normal Thunderbird window.

Parameters

  * 

[`createData`]

(object, optional)

  * 

[`allowScriptsToClose`]

(boolean, optional)

Allow scripts running inside the window to close the window by calling
window.close().

  * 

[`cookieStoreId`]

(string, optional)

The CookieStoreId to use for all tabs that were created when the window is
opened.

  * 

[`focused`]

(boolean, optional) **Unsupported.**

If true, opens an active window. If false, opens an inactive window.

  * 

[`height`]

(integer, optional)

The height in pixels of the new window, including the frame. If not specified
defaults to a natural height.

  * 

[`incognito`]

(boolean, optional) **Unsupported.**

  * 

[`left`]

(integer, optional)

The number of pixels to position the new window from the left edge of the
screen. If not specified, the new window is offset naturally from the last
focused window.

  * 

[`state`]

(WindowState, optional)

The initial state of the window. The minimized, maximized and fullscreen
states cannot be combined with left, top, width or height.

  * 

[`tabId`]

(integer, optional)

The id of the tab for which you want to adopt to the new window.

  * 

[`titlePreface`]

(string, optional)

A string to add to the beginning of the window title.

  * 

[`top`]

(integer, optional)

The number of pixels to position the new window from the top edge of the
screen. If not specified, the new window is offset naturally from the last
focused window.

  * 

[`type`]

(CreateType, optional)

Specifies what type of window to create. Thunderbird does not support panel
and detached_panel, they are interpreted as popup.

  * 

[`url`]

(string or array of string, optional)

A URL to be opened in a popup window, ignored in all other window types. This
may also be an array, but only the first element is used (popup windows may
not have multiple tabs). If the URL points to a content page (a web page, an
extension page or a registered WebExtension protocol handler page), the popup
window will navigate to the requested page. All other URLs will be opened
externally after creating an empty popup window. Fully-qualified URLs must
include a scheme (i.e. http://www.google.com, not www.google.com). Relative
URLs will be relative to the root of the extension. Defaults to the New Tab
Page.

  * 

[`width`]

(integer, optional)

The width in pixels of the new window, including the frame. If not specified
defaults to a natural width.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Window

Contains details about the created window.

### get(windowId, [getInfo])

Gets details about a window.

Parameters

  * 

`windowId`

(integer)

  * 

[`getInfo`]

(GetInfo, optional)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Window

### getAll([getInfo])

Gets all windows.

Parameters

  * 

[`getInfo`]

(GetInfo, optional)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of Window

### getCurrent([getInfo])

Gets the active or topmost window.

Parameters

  * 

[`getInfo`]

(GetInfo, optional)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Window

### getLastFocused([getInfo])

Gets the window that was most recently focused — typically the window ‘on
top’.

Parameters

  * 

[`getInfo`]

(GetInfo, optional)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Window

### openDefaultBrowser(url)

– [Added in TB 84, backported to TB 78.6.0]

Opens the provided URL in the default system browser.

Parameters

  * 

`url`

(string)

### remove(windowId)

Removes (closes) a window, and all the tabs inside it.

Parameters

  * 

`windowId`

(integer)

### update(windowId, updateInfo)

Updates the properties of a window. Specify only the properties that you want
to change; unspecified properties will be left unchanged.

Parameters

  * 

`windowId`

(integer)

  * 

`updateInfo`

(object)

  * 

[`drawAttention`]

(boolean, optional)

Setting this to true will cause the window to be displayed in a manner that
draws the user’s attention to the window, without changing the focused window.
The effect lasts until the user changes focus to the window. This option has
no effect if the window already has focus.

  * 

[`focused`]

(boolean, optional)

If true, brings the window to the front. If false, brings the next window in
the z-order to the front.

  * 

[`height`]

(integer, optional)

The height to resize the window to in pixels.

  * 

[`left`]

(integer, optional)

The offset from the left edge of the screen to move the window to in pixels.
This value is ignored for panels.

  * 

[`state`]

(WindowState, optional)

The new state of the window. The minimized, maximized and fullscreen states
cannot be combined with left, top, width or height.

  * 

[`titlePreface`]

(string, optional)

A string to add to the beginning of the window title.

  * 

[`top`]

(integer, optional)

The offset from the top edge of the screen to move the window to in pixels.
This value is ignored for panels.

  * 

[`width`]

(integer, optional)

The width to resize the window to in pixels.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Window

## Events

### onCreated

Fired when a window is created.

Parameters for onCreated.addListener(listener)

  * 

`listener(window)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`window`

(Window)

Details of the window that was created.

### onFocusChanged

Fired when the currently focused window changes. Will be WINDOW_ID_NONE, if
all windows have lost focus. **Note:** On some Linux window managers,
WINDOW_ID_NONE will always be sent immediately preceding a switch from one
window to another.

Parameters for onFocusChanged.addListener(listener)

  * 

`listener(windowId)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`windowId`

(integer)

ID of the newly focused window.

### onRemoved

Fired when a window is removed (closed).

Parameters for onRemoved.addListener(listener)

  * 

`listener(windowId)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`windowId`

(integer)

ID of the removed window.

## Types

### CreateType

Specifies what type of window to create. Thunderbird does not support panel
and detached_panel, they are interpreted as popup.

string

Supported values:

  * 

normal

A normal Thunderbird window, a.k.a. 3-pane-window (folder pane, message pane
and preview pane).

  * 

popup

A non-modal stand-alone popup window.

  * 

panel

Not supported, same as popup

  * 

detached_panel

Not supported, same as popup

### GetInfo

Specifies additional requirements for the returned windows.

object

  * 

[`populate`]

(boolean, optional)

If true, the Window returned will have a tabs property that contains an array
of [Tab](tabs.html#tabs-tab) objects representing the tabs inside the window.
The [Tab](tabs.html#tabs-tab) objects only contain the url, title and
favIconUrl properties if the extension’s manifest file includes the tabs
permission.

  * 

[`windowTypes`]

(array of WindowType, optional)

If set, the Window returned will be filtered based on its type. Supported by
getAll([getInfo]) only, ignored in all other functions.

### Window

object

  * 

`alwaysOnTop`

(boolean)

Whether the window is set to be always on top.

  * 

`focused`

(boolean)

Whether the window is currently the focused window.

  * 

`incognito`

(boolean)

Whether the window is incognito. Since Thunderbird does not support the
incognito mode, this is always false.

  * 

[`height`]

(integer, optional)

The height of the window, including the frame, in pixels.

  * 

[`id`]

(integer, optional)

The ID of the window. Window IDs are unique within a session.

  * 

[`left`]

(integer, optional)

The offset of the window from the left edge of the screen in pixels.

  * 

[`state`]

(WindowState, optional)

The state of this window.

  * 

[`tabs`]

(array of [Tab](tabs.html#tabs-tab), optional)

Array of [Tab](tabs.html#tabs-tab) objects representing the current tabs in
the window. Only included if requested by get(windowId, [getInfo]),
getCurrent([getInfo]), getAll([getInfo]) or getLastFocused([getInfo]), and the
optional GetInfo parameter has its populate member set to true.

  * 

[`title`]

(string, optional)

The title of the window. Read-only.

  * 

[`top`]

(integer, optional)

The offset of the window from the top edge of the screen in pixels.

  * 

[`type`]

(WindowType, optional)

The type of window this is.

  * 

[`width`]

(integer, optional)

The width of the window, including the frame, in pixels.

### WindowState

The state of this window.

string

Supported values:

  * 

normal

  * 

minimized

  * 

maximized

  * 

fullscreen

  * 

docked

### WindowType

The type of a window. Under some circumstances a window may not be assigned a
type property.

string

Supported values:

  * 

normal

A normal Thunderbird window, a.k.a. 3-pane-window (folder pane, message pane
and preview pane).

  * 

popup

A non-modal stand-alone popup window.

  * 

messageCompose

– [Added in TB 70, backported to TB 68.1.1]

A non-modal stand-alone message compose window.

  * 

messageDisplay

– [Added in TB 70, backported to TB 68.1.1]

A non-modal stand-alone message display window, viewing a single message.

## Properties

### WINDOW_ID_CURRENT

The windowId value that represents the current window.

### WINDOW_ID_NONE

The windowId value that represents the absence of a window.

