≡ action API

  * Manifest file properties

  * Functions

  * Events

  * Types

  * External Types

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

  * [“API List” example](https://github.com/thunderbird/sample-extensions/tree/master/manifest_v3/apiList)

# action API

The action API was introduced as part of the Manifest V3 specification. It is
identical to the old `browserAction` and very similar to Firefox’s [action
API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/action).

Use the action API to add a button to Thunderbird’s unified toolbar. In
addition to its icon, an action button can also have a tooltip, a badge, and a
popup.

## Manifest file properties

  * 

[`action`]

(object, optional)

  * 

[`allowed_spaces`]

(array of string, optional)

Defines for which spaces the action button will be added to Thunderbird’s
unified toolbar. Defaults to only allowing the action in the mail space. The
default space is for tabs that don’t belong to any space. If this is an empty
array, the action button is shown in all spaces.

Supported values:

  * 

mail

  * 

addressbook

  * 

calendar

  * 

tasks

  * 

chat

  * 

settings

  * 

default

  * 

[`browser_style`]

(boolean, optional)

Enable browser styles. See the [MDN documentation on browser
styles](https://developer.mozilla.org/docs/Mozilla/Add-
ons/WebExtensions/user_interface/Browser_styles) for more information.

  * 

[`default_area`]

(string, optional) **Deprecated.**

Defines the location the action button will appear. Deprecated and ignored.
Replaced by allowed_spaces

  * 

[`default_icon`]

(IconPath, optional)

The paths to one or more icons for the action button.

  * 

[`default_label`]

(string, optional)

The label of the action button, defaults to its title. Can be set to an empty
string to not display any label. If the containing toolbar is configured to
display text only, the title will be used as fallback.

  * 

[`default_popup`]

(string, optional)

The html document to be opened as a popup when the user clicks on the action
button. Ignored for action buttons with type menu.

  * 

[`default_title`]

(string, optional)

The title of the action button. This shows up in the tooltip and the label.
Defaults to the add-on name.

  * 

[`default_windows`]

(array of string, optional)

Defines the windows, the action button should appear in. Defaults to showing
it only in the normal Thunderbird window, but can also be shown in the
messageDisplay window.

Supported values:

  * 

normal

  * 

messageDisplay

  * 

[`theme_icons`]

(array of ThemeIcons, optional)

Specifies dark and light icons to be used with themes. The light icon is used
on dark backgrounds and vice versa. **Note:** The default theme uses the
default_icon for light backgrounds (if specified).

  * 

[`type`]

(string, optional)

Specifies the type of the button. Default type is button.

Supported values:

  * 

button

  * 

menu

Note

A manifest entry named action is required to use `messenger.action.*`.

## Functions

### disable([tabId])

Disables the action button for a specific tab (if a tabId is provided), or for
all tabs which do not have a custom enable state. Once the enable state of a
tab has been updated individually, all further changes to its state have to be
done individually as well.

Parameters

  * 

[`tabId`]

(integer, optional)

The id of the tab for which you want to modify the action button.

### enable([tabId])

Enables the action button for a specific tab (if a tabId is provided), or for
all tabs which do not have a custom enable state. Once the enable state of a
tab has been updated individually, all further changes to its state have to be
done individually as well. By default, an action button is enabled.

Parameters

  * 

[`tabId`]

(integer, optional)

The id of the tab for which you want to modify the action button.

### getBadgeBackgroundColor(details)

Gets the badge background color of the action button.

Parameters

  * 

`details`

(object)

  * 

[`tabId`]

(integer, optional)

Specifies for which tab the badge background color should be retrieved. If no
tab is specified, the global value is retrieved.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

ColorArray

### getBadgeText(details)

Gets the badge text of the action button.

Parameters

  * 

`details`

(object)

  * 

[`tabId`]

(integer, optional)

Specifies for which tab the badge text should be retrieved. If no tab is
specified, the global value is retrieved.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

### getBadgeTextColor(details)

– [Added in TB 128]

Gets the text color of the badge.

Parameters

  * 

`details`

(object)

  * 

[`tabId`]

(integer, optional)

Specifies for which tab the badge text color should be retrieved. If no tab is
specified, the global value is retrieved.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

ColorArray

### getLabel(details)

– [Added in TB 84.0b3, backported to TB 78.6.1]

Gets the label of the action button. Returns null, if no label has been set
and the title is used.

Parameters

  * 

`details`

(object)

  * 

[`tabId`]

(integer, optional)

Specifies for which tab the label should be retrieved. If no tab is specified,
the global value is retrieved.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string or null

### getPopup(details)

Gets the html document set as the popup for this action button.

Parameters

  * 

`details`

(object)

  * 

[`tabId`]

(integer, optional)

Specifies for which tab the popup document should be retrieved. If no tab is
specified, the global value is retrieved.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

### getTitle(details)

Gets the title of the action button.

Parameters

  * 

`details`

(object)

  * 

[`tabId`]

(integer, optional)

Specifies for which tab the title should be retrieved. If no tab is specified,
the global value is retrieved.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

### isEnabled(details)

Checks whether the action button is enabled.

Parameters

  * 

`details`

(object)

  * 

[`tabId`]

(integer, optional)

Specifies for which tab the state should be retrieved. If no tab is specified,
the global value is retrieved.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

boolean

### openPopup([options])

Opens the action’s popup window in the specified window. Defaults to the
current window. Returns false if the popup could not be opened because the
action has no popup, is of type menu, is disabled or has been removed from the
toolbar.

Parameters

  * 

[`options`]

(object, optional)

An object with information about the popup to open.

  * 

[`windowId`]

(integer, optional)

Defaults to the current window.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

boolean

### setBadgeBackgroundColor(details)

Sets the background color for the badge.

Parameters

  * 

`details`

(object)

  * 

`color`

(string or ColorArray or null)

The color to use as background in the badge. Cleared by setting it to null.

  * 

[`tabId`]

(integer, optional)

Sets the background color for the badge only for the given tab.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

### setBadgeText(details)

Sets the badge text for the action button. The badge is displayed on top of
the icon.

Parameters

  * 

`details`

(object)

  * 

`text`

(string or null)

Any number of characters can be passed, but only about four can fit in the
space. Cleared by setting it to null or an empty string.

  * 

[`tabId`]

(integer, optional)

Sets the badge text only for the given tab.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

### setBadgeTextColor(details)

– [Added in TB 128]

Sets the text color for the badge.

Parameters

  * 

`details`

(object)

  * 

`color`

(string or ColorArray or null)

The color to use as text color in the badge. Cleared by setting it to null.

  * 

[`tabId`]

(integer, optional)

Sets the text color for the badge only for the given tab.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

### setIcon(details)

Sets the icon for the action button. Either the path or the imageData property
must be specified.

Parameters

  * 

`details`

(object)

  * 

[`imageData`]

(ImageDataType or ImageDataDictionary, optional)

The image data for one or more icons for the action button.

  * 

[`path`]

(IconPath, optional)

The paths to one or more icons for the action button.

  * 

[`tabId`]

(integer, optional)

Sets the icon only for the given tab.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

### setLabel(details)

– [Added in TB 84.0b3, backported to TB 78.6.1]

Sets the label of the action button. Can be used to set different values for
the tooltip (defined by the title) and the label. Additionally, the label can
be set to an empty string, not showing any label at all.

Parameters

  * 

`details`

(object)

  * 

`label`

(string or null)

A string the action button should use as its label, overriding the defined
title. Can be set to an empty string to not display any label at all. If the
containing toolbar is configured to display text only, its title will be used.
Cleared by setting it to null.

  * 

[`tabId`]

(integer, optional)

Sets the label only for the given tab.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

### setPopup(details)

Sets the html document to be opened as a popup when the user clicks on the
action button.

Parameters

  * 

`details`

(object)

  * 

`popup`

(string or null)

The html file to show in a popup. Can be set to an empty string to not open a
popup. Cleared by setting it to null (popup value defined the manifest will be
used).

  * 

[`tabId`]

(integer, optional)

Sets the popup only for the given tab.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

### setTitle(details)

Sets the title of the action button. Is used as tooltip and as the label.

Parameters

  * 

`details`

(object)

  * 

`title`

(string or null)

A string the action button should display as its label and when moused over.
Cleared by setting it to null or an empty string (title defined the manifest
will be used).

  * 

[`tabId`]

(integer, optional)

Sets the title only for the given tab.

  * 

[`windowId`]

(integer, optional) **Unsupported.**

Will throw an error if used.

## Events

### onClicked

Fired when an action button is clicked. This event will not fire if the action
has a popup. This is a user input event handler. For asynchronous listeners
some [restrictions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/User_actions) apply.

Parameters for onClicked.addListener(listener)

  * 

`listener(tab, info)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`tab`

([Tab](tabs.html#tabs-tab))

– [Added in TB 74.0b2]

  * 

[`info`]

(OnClickData, optional)

– [Added in TB 74.0b2]

## Types

### ColorArray

An array of four integers in the range [0,255] that make up the RGBA color.
For example, opaque red is [255, 0, 0, 255].

array of integer

### ImageDataDictionary

A _dictionary object_ to specify multiple
[ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)
objects in different sizes, so the icon does not have to be scaled for a
device with a different pixel density. Each entry is a _name-value_ pair with
_value_ being an [ImageData](https://developer.mozilla.org/en-
US/docs/Web/API/ImageData) object, and _name_ its size. Example:

    
    
    {
      "16": icon16,
      "32": icon32
    }
    

See the [MDN documentation about choosing icon
sizes](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/manifest.json/browser_action#choosing_icon_sizes) for more
information on this.

object

### ImageDataType

Pixel data for an image. Must be an
[ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) object
(for example, from a [canvas](https://developer.mozilla.org/en-
US/docs/Web/HTML/Element/canvas) element).

[ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)

### OnClickData

– [Added in TB 74.0b2]

Information sent when an action button is clicked.

object

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

Only available on macOS.

  * 

Ctrl

Not available on macOS.

  * 

MacCtrl

Only available on macOS, but of limited use in a click event: Holding down the
CTRL key while clicking with the mouse is referred to as a ‘CTRL click’ under
macOS and is interpreted as a right mouse click. In a default profile the
dom.event.treat_ctrl_click_as_right_click.disabled preference is not enabled
and the MacCtrl modifier key is not forwarded to the API.

  * 

[`button`]

(integer, optional)

An integer value of button by which menu item was clicked.

## External Types

The following types are not defined by this API, but by the underlying Mozilla
WebExtension code base. They are included here, because there is no other
public documentation available.

### IconPath

Either a _string_ to specify a relative path of a single icon to be used for
all sizes, or a _dictionary object_ to specify paths for multiple icons in
different sizes, so the icon does not have to be scaled for a device with a
different pixel density. Each entry is a _name-value_ pair with _value_ being
a relative path to an icon file, and _name_ its size. Example:

    
    
    {
      "16": "icon16.png",
      "32": "icon32.png"
    }
    

See the [MDN documentation about choosing icon
sizes](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/manifest.json/browser_action#choosing_icon_sizes) for more
information on this.

### ThemeIcons

Define a set of icons for themes depending on whether Thunderbird detects that
the theme uses dark or light text. All provided URLs must be relative to the
manifest.json file.

object

  * 

`dark`

(string)

A URL pointing to an icon. This icon displays when a theme using dark text is
active (such as the Light theme, and the Default theme if no `default_icon` is
specified).

  * 

`light`

(string)

A URL pointing to an icon. This icon displays when a theme using light text is
active (such as the Dark theme).

  * 

`size`

(integer)

The size of the two icons in pixels, for example 16 or 32.

