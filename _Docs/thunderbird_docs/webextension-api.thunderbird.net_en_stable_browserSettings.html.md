≡ browserSettings API

  * Permissions

  * Types

  * Properties

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

# browserSettings API

Use the browser.browserSettings API to control global settings of the browser.

## Permissions

  * 

browserSettings

Read and modify browser settings

Note

The permission browserSettings is required to use
`messenger.browserSettings.*`.

## Types

### ColorManagementMode

Color management mode.

string

Supported values:

  * 

off

  * 

full

  * 

tagged_only

### ContextMenuMouseEvent

After which mouse event context menus should popup.

string

Supported values:

  * 

mouseup

  * 

mousedown

### ImageAnimationBehavior

How images should be animated in the browser.

string

Supported values:

  * 

normal

  * 

none

  * 

once

## Properties

### allowPopupsForUserEvents

Allows or disallows pop-up windows from opening in response to user events.

### cacheEnabled

Enables or disables the browser cache.

### contextMenuShowEvent

Controls after which mouse event context menus popup. This setting’s value is
of type ContextMenuMouseEvent, which has possible values of mouseup and
mousedown.

### ftpProtocolEnabled

Returns whether the FTP protocol is enabled. Read-only.

### imageAnimationBehavior

Controls the behaviour of image animation in the browser. This setting’s value
is of type ImageAnimationBehavior, defaulting to normal.

### overrideContentColorScheme

This setting controls whether a light or dark color scheme overrides the
page’s preferred color scheme.

### overrideDocumentColors

This setting controls whether the user-chosen colors override the page’s
colors.

### useDocumentFonts

This setting controls whether the document’s fonts are used.

### webNotificationsDisabled

Disables webAPI notifications.

### zoomFullPage

This boolean setting controls whether zoom is applied to the full page or to
text only.

