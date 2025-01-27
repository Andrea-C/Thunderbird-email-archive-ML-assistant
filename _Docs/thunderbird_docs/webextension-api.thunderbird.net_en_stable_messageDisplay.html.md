≡ messageDisplay API

  * Functions

  * Events

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

≡ Related examples on Github

  * [“Message Display” example](https://github.com/thunderbird/sample-extensions/tree/master/manifest_v3/messageDisplay)

# messageDisplay API

A message can be displayed in either a 3-pane tab, a tab of its own, or in a
window of its own. All are referenced by `tabId` in this API. Display windows
are considered to have exactly one tab, which has limited functionality
compared to tabs from the main window.

Note

The permission messagesRead is required to use `messenger.messageDisplay.*`.

## Functions

### getDisplayedMessages([tabId])

– [Added in TB 81, backported to TB 78.4.0]

Gets an array of the currently displayed messages in the specified tab (even
if the tab itself is currently not visible), or the currently active tab. The
array is empty if no messages are displayed.

Parameters

  * 

[`tabId`]

(integer, optional)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[MessageList](messages.html#messages-messagelist)

Required permissions

  * messagesRead

### open(openProperties)

– [Added in TB 102]

Opens a message in a new tab or in a new window.

Parameters

  * 

`openProperties`

(object)

Settings for opening the message. Exactly one of messageId, headerMessageId or
file must be specified.

  * 

[`active`]

(boolean, optional)

Whether the new tab should become the active tab in the window. Only
applicable to messages opened in tabs.

  * 

[`file`]

([File](https://developer.mozilla.org/en-US/docs/Web/API/File), optional)

The DOM file object of a message to be opened.

  * 

[`headerMessageId`]

(string, optional)

The headerMessageId of a message to be opened. Will throw an _ExtensionError_
, if the provided headerMessageId is unknown or invalid. Not supported for
external messages.

  * 

[`location`]

(string, optional)

Where to open the message. If not specified, the users preference is honoured.

Supported values:

  * 

tab

  * 

window

  * 

[`messageId`]

([MessageId](messages.html#messages-messageid), optional)

The id of a message to be opened. Will throw an _ExtensionError_ , if the
provided messageId is unknown or invalid.

  * 

[`windowId`]

(integer, optional)

The id of the window, where the new tab should be created. Defaults to the
current window. Only applicable to messages opened in tabs.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[Tab](tabs.html#tabs-tab)

Required permissions

  * messagesRead

## Events

### onMessagesDisplayed

– [Added in TB 81, backported to TB 78.4.0]

Fired when either a single message is displayed or when multiple messages are
displayed, whether in a 3-pane tab, a message tab, or a message window.

Parameters for onMessagesDisplayed.addListener(listener)

  * 

`listener(tab, displayedMessages)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tab`

([Tab](tabs.html#tabs-tab))

  * 

`displayedMessages`

([MessageList](messages.html#messages-messagelist))

Required permissions

  * messagesRead

