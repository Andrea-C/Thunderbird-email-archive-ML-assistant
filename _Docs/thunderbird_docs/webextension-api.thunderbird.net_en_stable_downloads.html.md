≡ downloads API

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

# downloads API

## Permissions

  * 

downloads

Download files and read and modify the browser’s download history

  * 

downloads.open

Open files downloaded to your computer

Note

The permission downloads is required to use `messenger.downloads.*`.

## Functions

### cancel(downloadId)

Cancel a download. When callback is run, the download is cancelled, completed,
interrupted or doesn’t exist anymore.

Parameters

  * 

`downloadId`

(integer)

The id of the download to cancel.

Required permissions

  * downloads

### download(options)

Download a URL. If the URL uses the HTTP[S] protocol, then the request will
include all cookies currently set for its hostname. If both filename and
saveAs are specified, then the Save As dialog will be displayed, pre-populated
with the specified filename. If the download started successfully, callback
will be called with the new DownloadItem’s downloadId. If there was an error
starting the download, then callback will be called with downloadId=undefined
and [chrome.extension.lastError](extension.html#property-lastError) will
contain a descriptive string. The error strings are not guaranteed to remain
backwards compatible between releases. You must not parse it.

Parameters

  * 

`options`

(object)

What to download and how.

  * 

`url`

(string)

The URL to download.

  * 

[`allowHttpErrors`]

(boolean, optional)

When this flag is set to true, then the browser will allow downloads to
proceed after encountering HTTP errors such as 404 Not Found.

  * 

[`body`]

(string, optional)

Post body.

  * 

[`conflictAction`]

(FilenameConflictAction, optional)

  * 

[`cookieStoreId`]

(string, optional)

The cookie store ID of the contextual identity; requires “cookies” permission.

  * 

[`filename`]

(string, optional)

A file path relative to the Downloads directory to contain the downloaded
file.

  * 

[`headers`]

(array of object, optional)

Extra HTTP headers to send with the request if the URL uses the HTTP[s]
protocol. Each header is represented as a dictionary containing the keys name
and either value or binaryValue, restricted to those allowed by
XMLHttpRequest.

  * 

[`incognito`]

(boolean, optional)

Whether to associate the download with a private browsing session.

  * 

[`method`]

(string, optional)

The HTTP method to use if the URL uses the HTTP[S] protocol.

Supported values:

  * 

GET

  * 

POST

  * 

[`saveAs`]

(boolean, optional)

Use a file-chooser to allow the user to select a filename. If the option is
not specified, the file chooser will be shown only if the Firefox “Always ask
you where to save files” option is enabled (i.e. the pref
browser.download.useDownloadDir is set to false).

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

integer

Required permissions

  * downloads

### drag(downloadId)

Initiate dragging the file to another application.

Parameters

  * 

`downloadId`

(integer)

Required permissions

  * downloads

### erase(query)

Erase matching DownloadItems from history

Parameters

  * 

`query`

(DownloadQuery)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of integer

Required permissions

  * downloads

### getFileIcon(downloadId, [options])

Retrieve an icon for the specified download. For new downloads, file icons are
available after the onCreated event has been received. The image returned by
this function while a download is in progress may be different from the image
returned after the download is complete. Icon retrieval is done by querying
the underlying operating system or toolkit depending on the platform. The icon
that is returned will therefore depend on a number of factors including state
of the download, platform, registered file types and visual theme. If a file
icon cannot be determined,
[chrome.extension.lastError](extension.html#property-lastError) will contain
an error message.

Parameters

  * 

`downloadId`

(integer)

The identifier for the download.

  * 

[`options`]

(object, optional)

  * 

[`size`]

(integer, optional)

The size of the icon. The returned icon will be square with dimensions size *
size pixels. The default size for the icon is 32x32 pixels.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

Required permissions

  * downloads

### open(downloadId)

Open the downloaded file.

Parameters

  * 

`downloadId`

(integer)

Required permissions

  * downloads

  * downloads.open

### pause(downloadId)

Pause the download. If the request was successful the download is in a paused
state. Otherwise [chrome.extension.lastError](extension.html#property-
lastError) contains an error message. The request will fail if the download is
not active.

Parameters

  * 

`downloadId`

(integer)

The id of the download to pause.

Required permissions

  * downloads

### removeFile(downloadId)

Parameters

  * 

`downloadId`

(integer)

Required permissions

  * downloads

### resume(downloadId)

Resume a paused download. If the request was successful the download is in
progress and unpaused. Otherwise
[chrome.extension.lastError](extension.html#property-lastError) contains an
error message. The request will fail if the download is not active.

Parameters

  * 

`downloadId`

(integer)

The id of the download to resume.

Required permissions

  * downloads

### search(query)

Find DownloadItems. Set query to the empty object to get all DownloadItems. To
get a specific DownloadItem, set only the id field.

Parameters

  * 

`query`

(DownloadQuery)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of DownloadItem

Required permissions

  * downloads

### show(downloadId)

Show the downloaded file in its folder in a file manager.

Parameters

  * 

`downloadId`

(integer)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

boolean

Required permissions

  * downloads

### showDefaultFolder()

Required permissions

  * downloads

## Events

### onChanged

When any of a DownloadItem’s properties except bytesReceived changes, this
event fires with the downloadId and an object containing the properties that
changed.

Parameters for onChanged.addListener(listener)

  * 

`listener(downloadDelta)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`downloadDelta`

(object)

  * 

`id`

(integer)

The id of the DownloadItem that changed.

  * 

[`canResume`]

(BooleanDelta, optional)

  * 

[`danger`]

(StringDelta, optional)

Describes a change in a DownloadItem’s danger.

  * 

[`endTime`]

(StringDelta, optional)

Describes a change in a DownloadItem’s endTime.

  * 

[`error`]

(StringDelta, optional)

Describes a change in a DownloadItem’s error.

  * 

[`exists`]

(BooleanDelta, optional)

  * 

[`fileSize`]

(DoubleDelta, optional)

Describes a change in a DownloadItem’s fileSize.

  * 

[`filename`]

(StringDelta, optional)

Describes a change in a DownloadItem’s filename.

  * 

[`mime`]

(StringDelta, optional)

Describes a change in a DownloadItem’s mime.

  * 

[`paused`]

(BooleanDelta, optional)

Describes a change in a DownloadItem’s paused.

  * 

[`startTime`]

(StringDelta, optional)

Describes a change in a DownloadItem’s startTime.

  * 

[`state`]

(StringDelta, optional)

Describes a change in a DownloadItem’s state.

  * 

[`totalBytes`]

(DoubleDelta, optional)

Describes a change in a DownloadItem’s totalBytes.

  * 

[`url`]

(StringDelta, optional)

Describes a change in a DownloadItem’s url.

Required permissions

  * downloads

### onCreated

This event fires with the DownloadItem object when a download begins.

Parameters for onCreated.addListener(listener)

  * 

`listener(downloadItem)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`downloadItem`

(DownloadItem)

Required permissions

  * downloads

### onErased

Fires with the downloadId when a download is erased from history.

Parameters for onErased.addListener(listener)

  * 

`listener(downloadId)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`downloadId`

(integer)

The id of the DownloadItem that was erased.

Required permissions

  * downloads

## Types

### BooleanDelta

object

  * 

[`current`]

(boolean, optional)

  * 

[`previous`]

(boolean, optional)

### DangerType

<dl><dt>file</dt><dd>The download’s filename is
suspicious.</dd><dt>url</dt><dd>The download’s URL is known to be
malicious.</dd><dt>content</dt><dd>The downloaded file is known to be
malicious.</dd><dt>uncommon</dt><dd>The download’s URL is not commonly
downloaded and could be dangerous.</dd><dt>safe</dt><dd>The download presents
no known danger to the user’s computer.</dd></dl>These string constants will
never change, however the set of DangerTypes may change.

string

Supported values:

  * 

file

  * 

url

  * 

content

  * 

uncommon

  * 

host

  * 

unwanted

  * 

safe

  * 

accepted

### DoubleDelta

object

  * 

[`current`]

(number, optional)

  * 

[`previous`]

(number, optional)

### DownloadItem

object

  * 

`bytesReceived`

(number)

Number of bytes received so far from the host, without considering file
compression.

  * 

`canResume`

(boolean)

  * 

`danger`

(DangerType)

Indication of whether this download is thought to be safe or known to be
suspicious.

  * 

`exists`

(boolean)

  * 

`fileSize`

(number)

Number of bytes in the whole file post-decompression, or -1 if unknown.

  * 

`filename`

(string)

Absolute local path.

  * 

`id`

(integer)

An identifier that is persistent across browser sessions.

  * 

`incognito`

(boolean)

False if this download is recorded in the history, true if it is not recorded.

  * 

`paused`

(boolean)

True if the download has stopped reading data from the host, but kept the
connection open.

  * 

`startTime`

(string)

Number of milliseconds between the unix epoch and when this download began.

  * 

`state`

(State)

Indicates whether the download is progressing, interrupted, or complete.

  * 

`totalBytes`

(number)

Number of bytes in the whole file, without considering file compression, or -1
if unknown.

  * 

`url`

(string)

Absolute URL.

  * 

[`byExtensionId`]

(string, optional)

  * 

[`byExtensionName`]

(string, optional)

  * 

[`cookieStoreId`]

(string, optional)

The cookie store ID of the contextual identity.

  * 

[`endTime`]

(string, optional)

Number of milliseconds between the unix epoch and when this download ended.

  * 

[`error`]

(InterruptReason, optional)

Number indicating why a download was interrupted.

  * 

[`estimatedEndTime`]

(string, optional)

  * 

[`mime`]

(string, optional)

The file’s MIME type.

  * 

[`referrer`]

(string, optional)

### DownloadQuery

Parameters that combine to specify a predicate that can be used to select a
set of downloads. Used for example in search() and erase()

object

  * 

[`bytesReceived`]

(number, optional)

Number of bytes received so far from the host, without considering file
compression.

  * 

[`cookieStoreId`]

(string, optional)

The cookie store ID of the contextual identity.

  * 

[`danger`]

(DangerType, optional)

Indication of whether this download is thought to be safe or known to be
suspicious.

  * 

[`endTime`]

(string, optional)

  * 

[`endedAfter`]

(DownloadTime, optional)

Limits results to downloads that ended after the given ms since the epoch.

  * 

[`endedBefore`]

(DownloadTime, optional)

Limits results to downloads that ended before the given ms since the epoch.

  * 

[`error`]

(InterruptReason, optional)

Why a download was interrupted.

  * 

[`exists`]

(boolean, optional)

  * 

[`fileSize`]

(number, optional)

Number of bytes in the whole file post-decompression, or -1 if unknown.

  * 

[`filename`]

(string, optional)

Absolute local path.

  * 

[`filenameRegex`]

(string, optional)

Limits results to DownloadItems whose filename matches the given regular
expression.

  * 

[`id`]

(integer, optional)

  * 

[`limit`]

(integer, optional)

Setting this integer limits the number of results. Otherwise, all matching
DownloadItems will be returned.

  * 

[`mime`]

(string, optional)

The file’s MIME type.

  * 

[`orderBy`]

(array of string, optional)

Setting elements of this array to DownloadItem properties in order to sort the
search results. For example, setting orderBy=’startTime’ sorts the
DownloadItems by their start time in ascending order. To specify descending
order, prefix orderBy with a hyphen: ‘-startTime’.

  * 

[`paused`]

(boolean, optional)

True if the download has stopped reading data from the host, but kept the
connection open.

  * 

[`query`]

(array of string, optional)

This array of search terms limits results to DownloadItems whose filename or
url contain all of the search terms that do not begin with a dash ‘-’ and none
of the search terms that do begin with a dash.

  * 

[`startTime`]

(string, optional)

  * 

[`startedAfter`]

(DownloadTime, optional)

Limits results to downloads that started after the given ms since the epoch.

  * 

[`startedBefore`]

(DownloadTime, optional)

Limits results to downloads that started before the given ms since the epoch.

  * 

[`state`]

(State, optional)

Indicates whether the download is progressing, interrupted, or complete.

  * 

[`totalBytes`]

(number, optional)

Number of bytes in the whole file, without considering file compression, or -1
if unknown.

  * 

[`totalBytesGreater`]

(number, optional)

Limits results to downloads whose totalBytes is greater than the given
integer.

  * 

[`totalBytesLess`]

(number, optional)

Limits results to downloads whose totalBytes is less than the given integer.

  * 

[`url`]

(string, optional)

Absolute URL.

  * 

[`urlRegex`]

(string, optional)

Limits results to DownloadItems whose url matches the given regular
expression.

### DownloadTime

A time specified as a Date object, a number or string representing
milliseconds since the epoch, or an ISO 8601 string

string

OR

[Date](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Date)

### FilenameConflictAction

string

Supported values:

  * 

uniquify

  * 

overwrite

  * 

prompt

### InterruptReason

string

Supported values:

  * 

FILE_FAILED

  * 

FILE_ACCESS_DENIED

  * 

FILE_NO_SPACE

  * 

FILE_NAME_TOO_LONG

  * 

FILE_TOO_LARGE

  * 

FILE_VIRUS_INFECTED

  * 

FILE_TRANSIENT_ERROR

  * 

FILE_BLOCKED

  * 

FILE_SECURITY_CHECK_FAILED

  * 

FILE_TOO_SHORT

  * 

NETWORK_FAILED

  * 

NETWORK_TIMEOUT

  * 

NETWORK_DISCONNECTED

  * 

NETWORK_SERVER_DOWN

  * 

NETWORK_INVALID_REQUEST

  * 

SERVER_FAILED

  * 

SERVER_NO_RANGE

  * 

SERVER_BAD_CONTENT

  * 

SERVER_UNAUTHORIZED

  * 

SERVER_CERT_PROBLEM

  * 

SERVER_FORBIDDEN

  * 

USER_CANCELED

  * 

USER_SHUTDOWN

  * 

CRASH

### State

<dl><dt>in_progress</dt><dd>The download is currently receiving data from the
server.</dd><dt>interrupted</dt><dd>An error broke the connection with the
file host.</dd><dt>complete</dt><dd>The download completed
successfully.</dd></dl>These string constants will never change, however the
set of States may change.

string

Supported values:

  * 

in_progress

  * 

interrupted

  * 

complete

### StringDelta

object

  * 

[`current`]

(string, optional)

  * 

[`previous`]

(string, optional)

