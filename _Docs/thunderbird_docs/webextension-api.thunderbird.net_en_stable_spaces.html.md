≡ spaces API

  * Functions

  * Types

  * External Types

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

# spaces API

The spaces API allows to manage built-in and custom spaces, and to add buttons
for custom spaces to Thunderbird’s spaces toolbar.

## Functions

### create(name, defaultUrl, [buttonProperties])

Creates a new space and adds its button to the spaces toolbar.

Parameters

  * 

`name`

(string)

The name to assign to this space. May only contain alphanumeric characters and
underscores. Must be unique for this extension.

  * 

`defaultUrl`

(string)

The default space url, loaded into a tab when the button in the spaces toolbar
is clicked. Supported are https:// and http:// links, as well as links to
WebExtension pages.

  * 

[`buttonProperties`]

(SpaceButtonProperties, optional)

Properties of the button for the new space.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Space

### get(spaceId)

Retrieves details about the specified space.

Parameters

  * 

`spaceId`

(integer)

The id of the space.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Space

### open(spaceId, [windowId])

Opens or switches to the specified space. Throws an exception if the requested
space does not exist or was not created by this extension.

Parameters

  * 

`spaceId`

(integer)

The id of the space.

  * 

[`windowId`]

(integer, optional)

The id of the normal window, where the space should be opened. Defaults to the
most recent normal window.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

[Tab](tabs.html#tabs-tab)

Details about the opened or activated space tab.

### query([queryInfo])

Gets all spaces that have the specified properties, or all spaces if no
properties are specified.

Parameters

  * 

[`queryInfo`]

(object, optional)

  * 

[`extensionId`]

(string, optional)

Id of the extension which should own the spaces. The management permission is
required to be able to match against extension ids.

  * 

[`isBuiltIn`]

(boolean, optional)

Spaces should be default Thunderbird spaces.

  * 

[`isSelfOwned`]

(boolean, optional)

Spaces should have been created by this extension.

  * 

[`name`]

(string, optional)

The name of the spaces (names are not unique).

  * 

[`spaceId`]

(integer, optional)

The id of the space.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of Space

### remove(spaceId)

Removes the specified space, closes all its tabs and removes its button from
the spaces toolbar. Throws an exception if the requested space does not exist
or was not created by this extension.

Parameters

  * 

`spaceId`

(integer)

The id of the space.

### update(spaceId, [defaultUrl], [buttonProperties])

Updates the specified space. Throws an exception if the requested space does
not exist or was not created by this extension.

Parameters

  * 

`spaceId`

(integer)

The id of the space.

  * 

[`defaultUrl`]

(string, optional)

The default space url, loaded into a tab when the button in the spaces toolbar
is clicked. Supported are https:// and http:// links, as well as links to
WebExtension pages.

  * 

[`buttonProperties`]

(SpaceButtonProperties, optional)

Only specified button properties will be updated.

## Types

### ButtonProperties

object

  * 

[`badgeBackgroundColor`]

(string or ColorArray, optional)

Sets the background color of the badge. Can be specified as an array of four
integers in the range [0,255] that make up the RGBA color of the badge. For
example, opaque red is [255, 0, 0, 255]. Can also be a string with an HTML
color name (red) or a HEX color value (#FF0000 or #F00). Reset when set to an
empty string.

  * 

[`badgeText`]

(string, optional)

Sets the badge text for the button in the spaces toolbar. The badge is
displayed on top of the icon. Any number of characters can be set, but only
about four can fit in the space. Removed when set to an empty string.

  * 

[`defaultIcons`]

(string or IconPath, optional)

The paths to one or more icons for the button in the spaces toolbar. Reset to
the extension icon, when set to an empty string.

  * 

[`themeIcons`]

(array of ThemeIcons, optional)

Specifies dark and light icons for the button in the spaces toolbar to be used
with themes: The light icons will be used on dark backgrounds and vice versa.
At least the set for _16px_ icons should be specified. The set for _32px_
icons will be used on screens with a very high pixel density, if specified.
Reset when set to an empty array.

  * 

[`title`]

(string, optional)

The title for the button in the spaces toolbar, used in the tooltip of the
button and as the displayed name in the overflow menu. Reset to the name of
the extension, when set to an empty string.

### ColorArray

An array of four integers in the range [0,255] that make up the RGBA color.
For example, opaque red is [255, 0, 0, 255].

array of integer

### Space

object

  * 

`id`

(integer)

The id of the space.

  * 

`isBuiltIn`

(boolean)

Whether this space is one of the default Thunderbird spaces, or an extension
space.

  * 

`isSelfOwned`

(boolean)

Whether this space was created by this extension.

  * 

`name`

(string)

The name of the space. Names are unique for a single extension, but different
extensions may use the same name.

  * 

[`extensionId`]

(string, optional)

The id of the extension which owns the space. The management permission is
required to include this property.

### SpaceButtonProperties

object

  * 

[`badgeBackgroundColor`]

(string or ColorArray, optional)

Sets the background color of the badge. Can be specified as an array of four
integers in the range [0,255] that make up the RGBA color of the badge. For
example, opaque red is [255, 0, 0, 255]. Can also be a string with an HTML
color name (red) or a HEX color value (#FF0000 or #F00). Reset when set to
null.

  * 

[`badgeText`]

(string, optional)

Sets the badge text for the button in the spaces toolbar. The badge is
displayed on top of the icon. Any number of characters can be set, but only
about four can fit in the space. Removed when set to null.

  * 

[`defaultIcons`]

(IconPath, optional)

The paths to one or more icons for the button in the spaces toolbar. Reset to
the extension icon, when set to null.

  * 

[`themeIcons`]

(array of ThemeIcons, optional)

Specifies dark and light icons for the button in the spaces toolbar to be used
with themes: The light icons will be used on dark backgrounds and vice versa.
At least the set for _16px_ icons should be specified. The set for _32px_
icons will be used on screens with a very high pixel density, if specified.
Reset when set to null.

  * 

[`title`]

(string, optional)

The title for the button in the spaces toolbar, used in the tooltip of the
button and as the displayed name in the overflow menu. Reset to the name of
the extension, when set to null.

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

