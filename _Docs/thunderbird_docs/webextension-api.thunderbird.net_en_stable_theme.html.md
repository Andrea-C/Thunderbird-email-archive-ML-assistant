≡ theme API

  * Manifest file properties

  * Permissions

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

  * [Theme guide](https://developer.thunderbird.net/add-ons/web-extension-themes)

  * [Working with WebExtension events](examples/eventListeners.html)

# theme API

The theme API is more or less the same as the [Firefox theme
API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/manifest.json/theme), but has been extended to better fit
the needs of Thunderbird.

The theme API allows for customization of Thunderbird’s visual elements.

## Manifest file properties

  * 

[`theme`]

(ThemeType, optional)

Properties for a static theme. A static theme must not contain any other
WebExtension logic. If additional logic is required, request the theme
permission and load/update the theme dynamically. More information about
themes can be found in the [theme
guide](https://developer.thunderbird.net/add-ons/web-extension-themes).

  * 

[`dark_theme`]

(ThemeType, optional)

Fallback properties for the dark system theme in a static theme.

  * 

[`theme_experiment`]

(ThemeExperiment, optional)

A theme experiment allows modifying the user interface of Thunderbird beyond
what is currently possible using the built-in color, image and property keys
of ThemeType. These experiments are a precursor to proposing new theme
features for inclusion in Thunderbird. Experimentation is done by mapping
internal CSS color, image and property variables to new theme keys and using
them in ThemeType and by loading additional style sheets to add new CSS
variables, extending the theme-able areas of Thunderbird. Can be used in
static and dynamic themes.

## Permissions

  * 

theme

Dynamically apply themes to Thunderbird’s user interface.

## Functions

### getCurrent([windowId])

Returns the current theme for the specified window or the last focused window.

Parameters

  * 

[`windowId`]

(integer, optional)

The window for which we want the theme.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

ThemeType

### reset([windowId])

Removes the updates made to the theme.

Parameters

  * 

[`windowId`]

(integer, optional)

The id of the window to reset. No id resets all windows.

Required permissions

  * theme

### update([windowId], details)

Make complete updates to the theme. Resolves when the update has completed.

Parameters

  * 

[`windowId`]

(integer, optional)

The id of the window to update. No id updates all windows.

  * 

`details`

(ThemeType)

The properties of the theme to update.

Required permissions

  * theme

## Events

### onUpdated

Fired when a new theme has been applied

Parameters for onUpdated.addListener(listener)

  * 

`listener(updateInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`updateInfo`

(ThemeUpdateInfo)

Details of the theme update

## Types

### ImageDataOrExtensionURL

Defines an image resource.

string

A relative URL for an image bundled with the extension. For example
images/background.png. The following image formats are supported:

  * JPEG

  * PNG

  * APNG

  * SVG (animated SVG is supported from Thunderbird 59)

  * GIF (animated GIF isn’t supported)

OR

string

A data URL using a base64 encoded representation of a PNG or JPG image. For
example:

    
    
    data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
    

### ThemeColor

Defines a color value.

string

A string containing a valid [CSS color
string](https://developer.mozilla.org/en-
US/docs/Web/CSS/CSS_colors/Color_values), including hexadecimal or functional
representations. For example the color _crimson_ can be specified as:

  * crimson

  * #dc143c

  * rgb(220, 20, 60) (or rgba(220, 20, 60, 0.5) to set 50% opacity)

  * hsl(348, 83%, 47%) (or hsla(348, 83%, 47%, 0.5) to set 50% opacity)

OR

array of integer

An RGB array of 3 integers. For example [220, 20, 60] for the color _crimson_.

OR

array of number

An RGBA array of 3 integers and a fractional (a float between 0 and 1). For
example [220, 20, 60, 0.5]:value: for the color _crimson_ with 50% opacity.

### ThemeExperiment

Defines additional color, image and property keys to be used in ThemeType,
extending the theme-able areas of Thunderbird.

object

  * 

[`colors`]

(object, optional)

A _dictionary object_ with one or more _key-value_ pairs to map new theme
color keys to internal Thunderbird CSS color variables. The example shown
below maps the theme color key popup_affordance to the CSS color variable
–arrowpanel-dimmed. The new color key is usable as a color reference in
ThemeType.

    
    
    {
     "popup_affordance": "--arrowpanel-dimmed"
    }
    

  * 

[`images`]

(object, optional)

A _dictionary object_ with one or more _key-value_ pairs to map new theme
image keys to internal Thunderbird CSS image variables. The new image key is
usable as an image reference in ThemeType. Example:

    
    
    {
     "theme_toolbar": "--toolbar-bgimage"
    }
    

  * 

[`properties`]

(object, optional)

A _dictionary object_ with one or more _key-value_ pairs to map new theme
property keys to internal Thunderbird CSS property variables. The new property
key is usable as a property reference in ThemeType. Example:

    
    
    {
     "toolbar_image_alignment": "--toolbar-bgalignment"
    }
    

  * 

[`stylesheet`]

(ExtensionURL, optional)

URL to a stylesheet introducing additional CSS variables, extending the theme-
able areas of Thunderbird. The [theme_experiment add-on in our example
repository](https://github.com/thunderbird/sample-
extensions/tree/master/manifest_v2/theme_experiment) is using the stylesheet
shown below, to add the –chat-button-color CSS color variable:

    
    
    image.toolbarbutton-icon[label="Chat"] {
      fill: var(--chat-button-color);
    }
    

The following _manifest.json_ file maps the –chat-button-color CSS color
variable to the theme color key exp_chat_button and uses it to set a color for
the chat button:

    
    
    {
      "name": "Theme Experiment",
      "description": "Changing the color of the chat icon using a theme_experiment.",
      "version": "1",
      "applications": {
        "gecko": {
          "id": "[[email protected]](/cdn-cgi/l/email-protection)",
          "strict_min_version": "78.0"
        }
      },
      "manifest_version": 2,
      "theme_experiment": {
        "stylesheet": "style.css",
        "colors": {
          "exp_chat_button": "--chat-button-color"
        }
      },
      "theme": {
        "colors": {
          "exp_chat_button": "orange"
        }
      }
    }
    

### ThemeType

Contains the color, image and property settings of a theme.

object

  * 

[`colors`]

(object, optional)

A _dictionary object_ with one or more _key-value_ pairs to map color values
to theme color keys. The following built-in theme color keys are supported:

  * 

[`button_background_active`]

(ThemeColor, optional)

The color of the background of the pressed toolbar buttons.

  * 

[`button_background_hover`]

(ThemeColor, optional)

The color of the background of the toolbar buttons on hover.

  * 

[`frame`]

(ThemeColor, optional)

The background color of the header area.

  * 

[`frame_inactive`]

(ThemeColor, optional)

The background color of the header area when the window is inactive.

  * 

[`icons`]

(ThemeColor, optional)

The color of the toolbar icons. Defaults to the color specified by
toolbar_text.

  * 

[`icons_attention`]

(ThemeColor, optional)

The color of the toolbar icons in attention state such as the chat icon with
new messages.

  * 

[`popup`]

(ThemeColor, optional)

The background color of popups such as the AppMenu.

  * 

[`popup_border`]

(ThemeColor, optional)

The border color of popups.

  * 

[`popup_highlight`]

(ThemeColor, optional)

The background color of items highlighted using the keyboard inside popups.

  * 

[`popup_highlight_text`]

(ThemeColor, optional)

The text color of items highlighted using the keyboard inside popups.

  * 

[`popup_text`]

(ThemeColor, optional)

The text color of popups.

  * 

[`sidebar`]

(ThemeColor, optional)

The background color of the trees.

  * 

[`sidebar_border`]

(ThemeColor, optional)

The border color of the trees.

  * 

[`sidebar_highlight`]

(ThemeColor, optional)

The background color of highlighted rows in trees.

  * 

[`sidebar_highlight_border`]

(ThemeColor, optional)

– [Added in TB 86, backported to TB 78.7.1]

The border color of highlighted rows in trees.

  * 

[`sidebar_highlight_text`]

(ThemeColor, optional)

The text color of highlighted rows in trees.

  * 

[`sidebar_text`]

(ThemeColor, optional)

The text color of the trees. Needed to enable the tree theming.

  * 

[`tab_background_separator`]

(ThemeColor, optional)

The color of the vertical separator of the background tabs.

  * 

[`tab_background_text`]

(ThemeColor, optional)

The text color of the unselected tabs.

  * 

[`tab_line`]

(ThemeColor, optional)

The color of the selected tab line.

  * 

[`tab_loading`]

(ThemeColor, optional)

The color of the tab loading indicator.

  * 

[`tab_selected`]

(ThemeColor, optional)

Background color of the selected tab. Defaults to the color specified by
toolbar.

  * 

[`tab_text`]

(ThemeColor, optional)

The text color for the selected tab. Defaults to the color specified by
toolbar_text.

  * 

[`toolbar`]

(ThemeColor, optional)

The background color of the toolbars. Also used as default value for
tab_selected.

  * 

[`toolbar_bottom_separator`]

(ThemeColor, optional)

The color of the line separating the bottom of the toolbar from the region
below.

  * 

[`toolbar_field`]

(ThemeColor, optional)

The background color for fields in the toolbar, such as the search field.

  * 

[`toolbar_field_border`]

(ThemeColor, optional)

The border color for fields in the toolbar.

  * 

[`toolbar_field_border_focus`]

(ThemeColor, optional)

The focused border color for fields in the toolbar.

  * 

[`toolbar_field_focus`]

(ThemeColor, optional)

The focused background color for fields in the toolbar.

  * 

[`toolbar_field_highlight`]

(ThemeColor, optional)

The background color used to indicate the current selection of text in the
search field.

  * 

[`toolbar_field_highlight_text`]

(ThemeColor, optional)

The color used to draw text that’s currently selected in the search field.

  * 

[`toolbar_field_text`]

(ThemeColor, optional)

The text color for fields in the toolbar.

  * 

[`toolbar_field_text_focus`]

(ThemeColor, optional)

The text color in the focused fields in the toolbar.

  * 

[`toolbar_text`]

(ThemeColor, optional)

The text color in the main Thunderbird toolbar. Also used as default value for
icons and tab_text.

  * 

[`toolbar_top_separator`]

(ThemeColor, optional)

The color of the line separating the top of the toolbar from the region above.

  * 

[`toolbar_vertical_separator`]

(ThemeColor, optional)

The color of the vertical separators on the toolbars.

  * 

[`images`]

(object, optional)

A _dictionary object_ with one or more _key-value_ pairs to map images to
theme image keys. The following built-in theme image keys are supported:

  * 

[`additional_backgrounds`]

(array of ImageDataOrExtensionURL, optional)

Additional images added to the header area and displayed behind the
theme_frame image.

  * 

[`theme_frame`]

(ImageDataOrExtensionURL, optional)

Foreground image on the header area.

  * 

[`properties`]

(object, optional)

A _dictionary object_ with one or more _key-value_ pairs to map property
values to theme property keys. The following built-in theme property keys are
supported:

  * 

[`additional_backgrounds_alignment`]

(array of string, optional)

Supported values:

  * 

bottom

  * 

center

  * 

left

  * 

right

  * 

top

  * 

center bottom

  * 

center center

  * 

center top

  * 

left bottom

  * 

left center

  * 

left top

  * 

right bottom

  * 

right center

  * 

right top

  * 

[`additional_backgrounds_tiling`]

(array of string, optional)

Supported values:

  * 

no-repeat

  * 

repeat

  * 

repeat-x

  * 

repeat-y

  * 

[`color_scheme`]

(string, optional)

If set, overrides the general theme (context menus, toolbars, content area).

Supported values:

  * 

light

  * 

dark

  * 

auto

  * 

[`content_color_scheme`]

(string, optional)

If set, overrides the color scheme for the content area.

Supported values:

  * 

light

  * 

dark

  * 

auto

### ThemeUpdateInfo

Info provided in the onUpdated listener.

object

  * 

`theme`

(ThemeType)

The new theme after update

  * 

[`windowId`]

(integer, optional)

The id of the window the theme has been applied to

## External Types

The following types are not defined by this API, but by the underlying Mozilla
WebExtension code base. They are included here, because there is no other
public documentation available.

### ExtensionURL

A path relative to the root of the extension.

string

