≡ browserSettings.colorManagement API

  * Permissions

  * Properties

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

# browserSettings.colorManagement API

Use the browserSettings.colorManagement API to query and set items related to
color management.

## Permissions

  * 

browserSettings

Read and modify browser settings

Note

The permission browserSettings is required to use
`messenger.browserSettings.colorManagement.*`.

## Properties

### mode

This setting controls the mode used for color management and must be a string
from [ColorManagementMode](browserSettings.html#browsersettings-
colormanagementmode)

### useNativeSRGB

This boolean setting controls whether or not native sRGB color management is
used.

### useWebRenderCompositor

This boolean setting controls whether or not the WebRender compositor is used.

