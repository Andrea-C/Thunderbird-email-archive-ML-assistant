≡ menus API

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

≡ Related examples on Github

  * [“Quickfilter” example](https://github.com/thunderbird/sample-extensions/tree/master/manifest_v3/quickfilter)

  * [“Menu” example](https://github.com/thunderbird/sample-extensions/tree/master/manifest_v2/menu)

# menus API

The menus API is basically the same as the [Firefox menus
API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/menus), but modified to suit Thunderbird. Note that
Thunderbird does not include the _contextMenus_ alias for this API.

The menus API allows to add items to Thunderbird’s menus. You can choose what
types of objects your context menu additions apply to, such as images,
hyperlinks, and pages.

## Permissions

  * 

menus

  * 

menus.overrideContext

Note

The permission menus is required to use `messenger.menus.*`.

## Functions

### create(createProperties, [callback])

Creates a new context menu item. Note that if an error occurs during creation,
you may not find out until the creation callback fires (the details will be in
[runtime.lastError](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/runtime/lastError)).

Parameters

  * 

`createProperties`

(object)

  * 

[`checked`]

(boolean, optional)

The initial state of a checkbox or radio item: true for selected and false for
unselected. Only one radio item can be selected at a time in a given group of
radio items.

  * 

[`command`]

(string or MenuActionCommand, optional)

Specifies a command to issue for the context click. Can either be a user
defined command, or one of the predefined action commands.

  * 

[`contexts`]

(array of ContextType, optional)

List of contexts this menu item will appear in. Defaults to [‘page’] if not
specified.

  * 

[`documentUrlPatterns`]

(array of string, optional)

Lets you restrict the item to apply only to documents whose URL matches one of
the given patterns. (This applies to frames as well.) For details on the
format of a pattern, see [Match Patterns](https://developer.mozilla.org/en-
US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns).

  * 

[`enabled`]

(boolean, optional)

Whether this context menu item is enabled or disabled. Defaults to true.

  * 

[`icons`]

(MenuIconPath or MenuIconDictionary, optional)

Custom icons to display next to the menu item. Custom icons can only be set
for items appearing in submenus.

  * 

[`id`]

(string, optional)

The unique ID to assign to this item. Mandatory for event pages. Cannot be the
same as another ID for this extension.

  * 

[`onclick`]

(function, optional)

A function that will be called back when the menu item is clicked. Event pages
cannot use this.

  * 

[`parentId`]

(integer or string, optional)

The ID of a parent menu item; this makes the item a child of a previously
added item.

  * 

[`targetUrlPatterns`]

(array of string, optional)

Similar to documentUrlPatterns, but lets you filter based on the src attribute
of img/audio/video tags and the href of anchor tags.

  * 

[`title`]

(string, optional)

The text to be displayed in the item; this is _required_ unless type is
separator. When the context is selection, you can use %s within the string to
show the selected text. For example, if this parameter’s value is Translate
‘%s’ to Latin and the user selects the word cool, the context menu item for
the selection is Translate ‘cool’ to Latin. To specify an access key for the
new menu entry, include a & before the desired letter in the title. For
example &Help.

  * 

[`type`]

(ItemType, optional)

The type of menu item. Defaults to normal if not specified.

  * 

[`viewTypes`]

(array of [ViewType](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/extension/ViewType), optional)

List of view types where the menu item will be shown. Defaults to any view,
including those without a viewType.

  * 

[`visible`]

(boolean, optional)

Whether the item is visible in the menu.

  * 

[`callback`]

(function, optional)

Called when the item has been created in the browser. If there were any
problems creating the item, details will be available in
[runtime.lastError](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/runtime/lastError).

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

integer or string

The ID of the newly created item.

Required permissions

  * menus

### getTargetElement(targetElementId)

Retrieve the element that was associated with a recent
[contextmenu](https://developer.mozilla.org/en-
US/docs/Web/API/Element/contextmenu_event) event.

Parameters

  * 

`targetElementId`

(integer)

The identifier of the clicked element, available as info.targetElementId in
the onShown and onClicked events.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)

Required permissions

  * menus

### overrideContext(contextOptions)

Show the matching menu items from this extension instead of the default menu.
This should be called during a [contextmenu](https://developer.mozilla.org/en-
US/docs/Web/API/Element/contextmenu_event) event handler, and only applies to
the menu that opens after this event.

Parameters

  * 

`contextOptions`

(object)

  * 

[`context`]

(string, optional)

ContextType to override, to allow menu items from other extensions in the
menu. Currently only tab is supported. contextOptions.showDefaults cannot be
used with this option.

Supported values:

  * 

tab

  * 

[`showDefaults`]

(boolean, optional)

Whether to also include default menu items in the menu.

  * 

[`tabId`]

(integer, optional)

Required when context is tab. Requires the tabs permission.

Required permissions

  * menus

  * menus.overrideContext

### refresh()

Updates the extension items in the shown menu, including changes that have
been made since the menu was shown. Has no effect if the menu is hidden.
Rebuilding a shown menu is an expensive operation, only invoke this method
when necessary.

Required permissions

  * menus

### remove(menuItemId)

Removes a context menu item.

Parameters

  * 

`menuItemId`

(integer or string)

The ID of the context menu item to remove.

Required permissions

  * menus

### removeAll()

Removes all context menu items added by this extension.

Required permissions

  * menus

### update(id, updateProperties)

Updates a previously created context menu item.

Parameters

  * 

`id`

(integer or string)

The ID of the item to update.

  * 

`updateProperties`

(object)

The properties to update. Accepts the same values as the create function.

  * 

[`checked`]

(boolean, optional)

  * 

[`contexts`]

(array of ContextType, optional)

  * 

[`documentUrlPatterns`]

(array of string, optional)

  * 

[`enabled`]

(boolean, optional)

  * 

[`icons`]

(MenuIconPath or MenuIconDictionary, optional)

  * 

[`onclick`]

(function, optional)

  * 

[`parentId`]

(integer or string, optional)

**Note:** You cannot change an item to be a child of one of its own
descendants.

  * 

[`targetUrlPatterns`]

(array of string, optional)

  * 

[`title`]

(string, optional)

  * 

[`type`]

(ItemType, optional)

  * 

[`viewTypes`]

(array of [ViewType](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/extension/ViewType), optional)

  * 

[`visible`]

(boolean, optional)

Whether the item is visible in the menu.

Required permissions

  * menus

## Events

### onClicked

Fired when a context menu item is clicked. This is a user input event handler.
For asynchronous listeners some
[restrictions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/User_actions) apply.

Parameters for onClicked.addListener(listener)

  * 

`listener(info, tab)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`info`

(OnClickData)

Information about the item clicked and the context where the click happened.

  * 

[`tab`]

([Tab](tabs.html#tabs-tab), optional)

The details of the tab where the click took place. If the click did not take
place in a tab, this parameter will be missing.

Required permissions

  * menus

### onHidden

Fired when a menu is hidden. This event is only fired if onShown has fired
before.

Parameters for onHidden.addListener(listener)

  * 

`listener()`

A function that will be called when this event occurs.

Required permissions

  * menus

### onShown

Fired when a menu is shown. The extension can add, modify or remove menu items
and call refresh() to update the menu.

Parameters for onShown.addListener(listener)

  * 

`listener(info, tab)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`info`

(OnShowData)

Information about the context of the menu action and the created menu items.

  * 

`tab`

([Tab](tabs.html#tabs-tab))

The details of the tab where the menu was opened.

Required permissions

  * menus

## Types

### ContextType

The different contexts a menu can appear in. More information about each
context can be found in the [Supported UI Elements](|link-ui-elements|)
article on developer.thunderbird.net.

string

Supported values:

  * 

action

Applies when the user context-clicks a browserAction button in a Manifest V3
extension.

  * 

action_menu

– [Added in TB 115]

Applies when the user opened a browserAction button of type menu in a Manifest
V3 extension.

  * 

all

Equivalent to the combination of all other contexts except for tab and
tools_menu.

  * 

all_message_attachments

Applies when the user context-clicks the summary of the message attachments of
a displayed message with more than one attachment.

  * 

audio

Applies when the user context-clicks an audio element.

  * 

compose_action

– [Added in TB 89]

Applies when the user context-clicks a composeAction button.

  * 

compose_action_menu

– [Added in TB 115]

Applies when the user opened a composeAction button of type menu.

  * 

compose_attachments

– [Added in TB 83, backported to TB 78.5.0]

Applies when the user context-clicks an attachment in the compose window.

  * 

compose_body

– [Added in TB 115]

Applies when the user context-clicks in the compose editor.

  * 

editable

Applies when the user context-clicks an editable element, like a textarea.

  * 

folder_pane

Applies when the user context-clicks in the folder pane of the main
Thunderbird window.

  * 

frame

Applies when the user context-clicks in a nested iframe.

  * 

image

Applies when the user context-clicks an image.

  * 

link

Applies when the user context-clicks on a link.

  * 

message_attachments

Applies when the user context-clicks a single attachment of a displayed
message.

  * 

message_display_action

– [Added in TB 89]

Applies when the user context-clicks a messageDisplayAction button.

  * 

message_display_action_menu

– [Added in TB 115]

Applies when the user opened a messageDisplayAction button of type menu.

  * 

message_list

Applies when the user context-clicks in the message list (a.k.a. thread pane)
of the main Thunderbird window.

  * 

page

Applies when the user context-clicks in the page, but none of the other page
contexts apply (for example, the click is not on an image or a nested iframe
or a link).

  * 

password

Applies when the user context-clicks on a password input element.

  * 

selection

Applies when part of the page is selected.

  * 

tab

Applies when the user context-clicks on a tab (specifically, this refers to
the tab-strip or other user interface element enabling the user to switch from
one tab to another, not to the page itself).

  * 

tools_menu

– [Added in TB 88]

Applies when the user opens the Tools menu of Thunderbird’s main menu.

  * 

video

Applies when the user context-clicks a video element.

### ItemType

The type of menu item.

string

Supported values:

  * 

normal

  * 

checkbox

  * 

radio

  * 

separator

### MenuActionCommand

A predefined command to open an action popup.

string

Supported values:

  * 

_execute_action

  * 

_execute_compose_action

  * 

_execute_message_display_action

### MenuIconDictionary

A _dictionary object_ to specify paths for multiple icons in different sizes,
so the best matching icon can be used, instead of scaling a standard icon to
fit the pixel density of the user’s display. Each entry is a _name-value_
pair, with _name_ being a size and _value_ being a MenuIconPath. Example:

    
    
    {
      "16": "icon16.png",
      "32": "icon32.png"
    }
    

See the [MDN documentation about choosing icon
sizes](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/manifest.json/browser_action#choosing_icon_sizes) for more
information on this.

object

### MenuIconPath

The path for a menu icon may be a relative path to an icon file, a moz-
extension: URL, an image data: URL, a blob: URL, or a remote http(s): URL.

string

### OnClickData

Information sent when a context menu item is clicked.

object

  * 

`editable`

(boolean)

A flag indicating whether the element is editable (text input, textarea,
etc.).

  * 

`menuItemId`

(integer or string)

The ID of the menu item that was clicked.

  * 

`modifiers`

(array of string)

An array of keyboard modifiers that were held while the menu item was clicked.

Supported values:

  * 

Shift

  * 

Alt

  * 

Command

  * 

Ctrl

  * 

MacCtrl

  * 

[`attachments`]

(array of [ComposeAttachment](compose.html#compose-composeattachment) or
[MessageAttachment](messages.html#messages-messageattachment), optional)

– [Added in TB 83]

The selected attachments. The compose permission is required to return
attachments of a message being composed. The messagesRead permission is
required to return attachments of displayed messages.

  * 

[`button`]

(integer, optional)

An integer value of button by which menu item was clicked.

  * 

[`checked`]

(boolean, optional)

A flag indicating the state of a checkbox or radio item after it is clicked.

  * 

[`displayedFolder`]

([MailFolder](folders.html#folders-mailfolder), optional)

The displayed folder. Only available for the message_list context. The
accountsRead permission is required.

  * 

[`fieldId`]

(string, optional)

– [Added in TB 89]

An identifier of the clicked Thunderbird UI element, if any.

Supported values:

  * 

composeSubject

  * 

composeTo

  * 

composeCc

  * 

composeBcc

  * 

composeReplyTo

  * 

composeNewsgroupTo

  * 

[`frameId`]

(integer, optional)

The id of the frame of the element where the context menu was clicked.

  * 

[`frameUrl`]

(string, optional)

The URL of the frame of the element where the context menu was clicked, if it
was in a frame.

  * 

[`linkText`]

(string, optional)

If the element is a link, the text of that link.

  * 

[`linkUrl`]

(string, optional)

If the element is a link, the URL it points to.

  * 

[`mediaType`]

(string, optional)

One of image, video, or audio if the context menu was activated on one of
these types of elements.

  * 

[`pageUrl`]

(string, optional)

The URL of the page where the menu item was clicked. This property is not set
if the click occurred in a context where there is no current page, such as in
a launcher context menu.

  * 

[`parentMenuItemId`]

(integer or string, optional)

The parent ID, if any, for the item clicked.

  * 

[`selectedFolders`]

(array of [MailFolder](folders.html#folders-mailfolder), optional)

– [Added in TB 128]

The selected folders in the folder pane. Only available for the folder_pane
context. The accountsRead permission is required. The returned selection
includes the folders which would be affected by a context action through
Thunderbirds UI, which may not be the actuall selected folders. For example,
if the user has multiple folders selected and opens the context menu for a
folder outside that selection, only the folder for which the context menu was
opened, is returned.

  * 

[`selectedMessages`]

([MessageList](messages.html#messages-messagelist), optional)

The selected message(s) in the message list (a.k.a. the thread pane). Only
available for the message_list context. The messagesRead permission is
required. The returned selection includes the messages which would be affected
by a context action through Thunderbirds UI, which may not be the actuall
selected messages. For example, if the user has multiple messages selected and
opens the context menu for a message outside that selection, only the message
for which the context menu was opened, is returned.

  * 

[`selectionText`]

(string, optional)

The text for the context selection, if any.

  * 

[`srcUrl`]

(string, optional)

Will be present for elements with a _src_ URL.

  * 

[`targetElementId`]

(integer, optional)

An identifier of the clicked content element, if any. Use
getTargetElement(targetElementId) in the page to find the corresponding
element.

  * 

[`viewType`]

([ViewType](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/extension/ViewType), optional)

The type of view where the menu is clicked. May be unset if the menu is not
associated with a view.

  * 

[`wasChecked`]

(boolean, optional)

A flag indicating the state of a checkbox or radio item before it was clicked.

### OnShowData

Information sent when a context menu is being shown. Some properties are only
included if the extension has host permission for the given context, for
example activeTab for content tabs, compose for compose tabs and messagesRead
for message display tabs.

object

  * 

`contexts`

(array of ContextType)

A list of all contexts that apply to the menu.

  * 

`editable`

(boolean)

A flag indicating whether the element is editable (text input, textarea,
etc.).

  * 

`menuIds`

(array of integer or string)

A list of IDs of the menu items that were shown.

  * 

[`attachments`]

(array of [ComposeAttachment](compose.html#compose-composeattachment) or
[MessageAttachment](messages.html#messages-messageattachment), optional)

– [Added in TB 83]

The selected attachments. The compose permission is required to return
attachments of a message being composed. The messagesRead permission is
required to return attachments of displayed messages.

  * 

[`displayedFolder`]

([MailFolder](folders.html#folders-mailfolder), optional)

The displayed folder. Only available for the message_list context. The
accountsRead permission is required.

  * 

[`fieldId`]

(string, optional)

– [Added in TB 89]

An identifier of the clicked Thunderbird UI element, if any.

Supported values:

  * 

composeSubject

  * 

composeTo

  * 

composeCc

  * 

composeBcc

  * 

composeReplyTo

  * 

composeNewsgroupTo

  * 

[`frameUrl`]

(string, optional)

The URL of the frame of the element where the context menu was clicked, if it
was in a frame. **Note:** Host permission is required.

  * 

[`linkText`]

(string, optional)

If the element is a link, the text of that link. **Note:** Host permission is
required.

  * 

[`linkUrl`]

(string, optional)

If the element is a link, the URL it points to. **Note:** Host permission is
required.

  * 

[`mediaType`]

(string, optional)

One of image, video, or audio if the context menu was activated on one of
these types of elements.

  * 

[`pageUrl`]

(string, optional)

The URL of the page where the menu item was clicked. This property is not set
if the click occurred in a context where there is no current page, such as in
a launcher context menu. **Note:** Host permission is required.

  * 

[`selectedFolders`]

(array of [MailFolder](folders.html#folders-mailfolder), optional)

– [Added in TB 128]

The selected folders in the folder pane. Only available for the folder_pane
context. The accountsRead permission is required. The returned selection
includes the folders which would be affected by a context action through
Thunderbirds UI, which may not be the actuall selected folders. For example,
if the user has multiple folders selected and opens the context menu for a
folder outside that selection, only the folder for which the context menu was
opened, is returned.

  * 

[`selectedMessages`]

([MessageList](messages.html#messages-messagelist), optional)

The selected message(s) in the message list (a.k.a. the thread pane). Only
available for the message_list context. The messagesRead permission is
required. The returned selection includes the messages which would be affected
by a context action through Thunderbirds UI, which may not be the actuall
selected messages. For example, if the user has multiple messages selected and
opens the context menu for a message outside that selection, only the message
for which the context menu was opened, is returned.

  * 

[`selectionText`]

(string, optional)

The text for the context selection, if any. **Note:** Host permission is
required.

  * 

[`srcUrl`]

(string, optional)

Will be present for elements with a _src_ URL. **Note:** Host permission is
required.

  * 

[`targetElementId`]

(integer, optional)

An identifier of the clicked content element, if any. Use
getTargetElement(targetElementId) in the page to find the corresponding
element.

  * 

[`viewType`]

([ViewType](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/extension/ViewType), optional)

The type of view where the menu is shown. May be unset if the menu is not
associated with a view.

## Properties

### ACTION_MENU_TOP_LEVEL_LIMIT

The maximum number of top level extension items that can be added to an
extension action context menu. Any items beyond this limit will be ignored.

