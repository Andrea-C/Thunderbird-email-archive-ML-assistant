≡ notifications API

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

# notifications API

Note

The permission notifications is required to use `messenger.notifications.*`.

## Functions

### clear(notificationId)

Clears an existing notification.

Parameters

  * 

`notificationId`

(string)

The id of the notification to be updated.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

boolean

Indicates whether a matching notification existed.

Required permissions

  * notifications

### create([notificationId], options)

Creates and displays a notification.

Parameters

  * 

[`notificationId`]

(string, optional)

Identifier of the notification. If it is empty, this method generates an id.
If it matches an existing notification, this method first clears that
notification before proceeding with the create operation.

  * 

`options`

(CreateNotificationOptions)

Contents of the notification.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

The notification id (either supplied or generated) that represents the created
notification.

Required permissions

  * notifications

### getAll()

Retrieves all the notifications.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

object

The set of notifications currently in the system.

Required permissions

  * notifications

### getPermissionLevel()

Retrieves whether the user has enabled notifications from this app or
extension.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

PermissionLevel

The current permission level.

Required permissions

  * notifications

## Events

### onClicked

Fired when the user clicked in a non-button area of the notification.

Parameters for onClicked.addListener(listener)

  * 

`listener(notificationId)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`notificationId`

(string)

The notificationId of the clicked notification.

Required permissions

  * notifications

### onClosed

Fired when the notification closed, either by the system or by user action.

Parameters for onClosed.addListener(listener)

  * 

`listener(notificationId, byUser)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`notificationId`

(string)

The notificationId of the closed notification.

  * 

`byUser`

(boolean)

True if the notification was closed by the user.

Required permissions

  * notifications

### onPermissionLevelChanged

Fired when the user changes the permission level.

Parameters for onPermissionLevelChanged.addListener(listener)

  * 

`listener(level)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`level`

(PermissionLevel)

The new permission level.

Required permissions

  * notifications

### onShowSettings

Fired when the user clicked on a link for the app’s notification settings.

Parameters for onShowSettings.addListener(listener)

  * 

`listener()`

A function that will be called when this event occurs.

Required permissions

  * notifications

### onShown

Fired when the notification is shown.

Parameters for onShown.addListener(listener)

  * 

`listener(notificationId)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`notificationId`

(string)

The notificationId of the shown notification.

Required permissions

  * notifications

## Types

### CreateNotificationOptions

object

  * 

`message`

(string)

Main notification content.

  * 

`title`

(string)

Title of the notification (e.g. sender name for email).

  * 

`type`

(TemplateType)

Which type of notification to display.

  * 

[`appIconMaskUrl`]

(string, optional)

A URL to the app icon mask.

  * 

[`buttons`]

(array of object, optional) **Unsupported.**

Text and icons for up to two notification action buttons.

  * 

[`contextMessage`]

(string, optional)

Alternate notification content with a lower-weight font.

  * 

[`eventTime`]

(number, optional)

A timestamp associated with the notification, in milliseconds past the epoch.

  * 

[`iconUrl`]

(string, optional)

A URL to the sender’s avatar, app icon, or a thumbnail for image
notifications.

  * 

[`imageUrl`]

(string, optional)

A URL to the image thumbnail for image-type notifications.

  * 

[`isClickable`]

(boolean, optional)

Whether to show UI indicating that the app will visibly respond to clicks on
the body of a notification.

  * 

[`items`]

(array of NotificationItem, optional)

Items for multi-item notifications.

  * 

[`priority`]

(integer, optional)

Priority ranges from -2 to 2. -2 is lowest priority. 2 is highest. Zero is
default.

  * 

[`progress`]

(integer, optional)

Current progress ranges from 0 to 100.

### NotificationItem

object

  * 

`message`

(string)

Additional details about this item.

  * 

`title`

(string)

Title of one item of a list notification.

### PermissionLevel

string

Supported values:

  * 

granted

  * 

denied

### TemplateType

string

Supported values:

  * 

basic

  * 

image

  * 

list

  * 

progress

### UpdateNotificationOptions

object

  * 

[`appIconMaskUrl`]

(string, optional)

A URL to the app icon mask.

  * 

[`buttons`]

(array of object, optional) **Unsupported.**

Text and icons for up to two notification action buttons.

  * 

[`contextMessage`]

(string, optional)

Alternate notification content with a lower-weight font.

  * 

[`eventTime`]

(number, optional)

A timestamp associated with the notification, in milliseconds past the epoch.

  * 

[`iconUrl`]

(string, optional)

A URL to the sender’s avatar, app icon, or a thumbnail for image
notifications.

  * 

[`imageUrl`]

(string, optional)

A URL to the image thumbnail for image-type notifications.

  * 

[`isClickable`]

(boolean, optional)

Whether to show UI indicating that the app will visibly respond to clicks on
the body of a notification.

  * 

[`items`]

(array of NotificationItem, optional)

Items for multi-item notifications.

  * 

[`message`]

(string, optional)

Main notification content.

  * 

[`priority`]

(integer, optional)

Priority ranges from -2 to 2. -2 is lowest priority. 2 is highest. Zero is
default.

  * 

[`progress`]

(integer, optional)

Current progress ranges from 0 to 100.

  * 

[`title`]

(string, optional)

Title of the notification (e.g. sender name for email).

  * 

[`type`]

(TemplateType, optional)

Which type of notification to display.

