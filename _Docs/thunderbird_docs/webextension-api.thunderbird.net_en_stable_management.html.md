≡ management API

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

# management API

The browser.management API provides ways to manage the list of extensions that
are installed and running.

## Permissions

  * 

management

Monitor extension usage and manage themes

## Functions

### get(id)

Returns information about the installed extension that has the given ID.

Parameters

  * 

`id`

(management.ExtensionID)

The ID from an item of ExtensionInfo.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

ExtensionInfo

Required permissions

  * management

### getAll()

Returns a list of information about installed extensions.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of ExtensionInfo

Required permissions

  * management

### getSelf()

Returns information about the calling extension. Note: This function can be
used without requesting the ‘management’ permission in the manifest.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

ExtensionInfo

### install(options)

Installs and enables a theme extension from the given url.

Parameters

  * 

`options`

(object)

  * 

`url`

(management.HttpURL)

URL pointing to the XPI file on addons.mozilla.org or similar.

  * 

[`hash`]

(string, optional)

A hash of the XPI file, using sha256 or stronger.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

object

  * 

`id`

(management.ExtensionID)

Required permissions

  * management

### setEnabled(id, enabled)

Enables or disables the given add-on.

Parameters

  * 

`id`

(string)

ID of the add-on to enable/disable.

  * 

`enabled`

(boolean)

Whether to enable or disable the add-on.

Required permissions

  * management

### uninstallSelf([options])

Uninstalls the calling extension. Note: This function can be used without
requesting the ‘management’ permission in the manifest.

Parameters

  * 

[`options`]

(object, optional)

  * 

[`dialogMessage`]

(string, optional)

The message to display to a user when being asked to confirm removal of the
extension.

  * 

[`showConfirmDialog`]

(boolean, optional)

Whether or not a confirm-uninstall dialog should prompt the user. Defaults to
false.

## Events

### onDisabled

Fired when an addon has been disabled.

Parameters for onDisabled.addListener(listener)

  * 

`listener(info)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`info`

(ExtensionInfo)

Required permissions

  * management

### onEnabled

Fired when an addon has been enabled.

Parameters for onEnabled.addListener(listener)

  * 

`listener(info)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`info`

(ExtensionInfo)

Required permissions

  * management

### onInstalled

Fired when an addon has been installed.

Parameters for onInstalled.addListener(listener)

  * 

`listener(info)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`info`

(ExtensionInfo)

Required permissions

  * management

### onUninstalled

Fired when an addon has been uninstalled.

Parameters for onUninstalled.addListener(listener)

  * 

`listener(info)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`info`

(ExtensionInfo)

Required permissions

  * management

## Types

### ExtensionDisabledReason

A reason the item is disabled.

string

Supported values:

  * 

unknown

  * 

permissions_increase

### ExtensionInfo

Information about an installed extension.

object

  * 

`description`

(string)

The description of this extension.

  * 

`enabled`

(boolean)

Whether it is currently enabled or disabled.

  * 

`id`

(string)

The extension’s unique identifier.

  * 

`installType`

(ExtensionInstallType)

How the extension was installed.

  * 

`mayDisable`

(boolean)

Whether this extension can be disabled or uninstalled by the user.

  * 

`name`

(string)

The name of this extension.

  * 

`optionsUrl`

(string)

The url for the item’s options page, if it has one.

  * 

`type`

(ExtensionType)

The type of this extension, ‘extension’ or ‘theme’.

  * 

`version`

(string)

The [version](manifest/version) of this extension.

  * 

[`disabledReason`]

(ExtensionDisabledReason, optional)

A reason the item is disabled.

  * 

[`homepageUrl`]

(string, optional)

The URL of the homepage of this extension.

  * 

[`hostPermissions`]

(array of string, optional)

Returns a list of host based permissions.

  * 

[`icons`]

(array of IconInfo, optional)

A list of icon information. Note that this just reflects what was declared in
the manifest, and the actual image at that url may be larger or smaller than
what was declared, so you might consider using explicit width and height
attributes on img tags referencing these images. See the [manifest
documentation on icons](manifest/icons) for more details.

  * 

[`permissions`]

(array of string, optional)

Returns a list of API based permissions.

  * 

[`shortName`]

(string, optional)

A short version of the name of this extension.

  * 

[`updateUrl`]

(string, optional)

The update URL of this extension.

  * 

[`versionName`]

(string, optional)

The [version name](manifest/version#version_name) of this extension if the
manifest specified one.

### ExtensionInstallType

How the extension was installed. One of<br>:value:development: The extension
was loaded unpacked in developer mode,<br>:value:normal: The extension was
installed normally via an .xpi file,<br>:value:sideload: The extension was
installed by other software on the machine,<br>:value:admin: The extension was
installed by policy,<br>:value:other: The extension was installed by other
means.

string

Supported values:

  * 

development

  * 

normal

  * 

sideload

  * 

admin

  * 

other

### ExtensionType

The type of this extension, ‘extension’ or ‘theme’.

string

Supported values:

  * 

extension

  * 

theme

### IconInfo

Information about an icon belonging to an extension.

object

  * 

`size`

(integer)

A number representing the width and height of the icon. Likely values include
(but are not limited to) 128, 48, 24, and 16.

  * 

`url`

(string)

The URL for this icon image. To display a grayscale version of the icon (to
indicate that an extension is disabled, for example), append ?grayscale=true
to the URL.

