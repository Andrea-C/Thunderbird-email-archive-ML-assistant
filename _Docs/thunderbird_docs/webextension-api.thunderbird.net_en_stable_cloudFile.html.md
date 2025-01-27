≡ cloudFile API

  * Manifest file properties

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

≡ Related information

  * [Working with WebExtension events](examples/eventListeners.html)

≡ Related examples on Github

  * [“DropBox Uploader” example](https://github.com/thunderbird/sample-extensions/tree/master/manifest_v3/dropbox)

# cloudFile API

The cloudFile (a.k.a. fileLink) API allows to create a provider to store large
attachments in the cloud instead of attaching them directly to the message.

## Manifest file properties

  * 

[`cloud_file`]

(object, optional)

  * 

`management_url`

(string)

A page for configuring accounts, to be displayed in the preferences UI.
**Note:** Within this UI only a limited subset of the WebExtension APIs is
available: cloudFile, extension, i18n, runtime, storage, test.

  * 

`name`

(string)

Name of the cloud file service.

  * 

[`browser_style`]

(boolean, optional)

– [Added in TB 90]

Enable browser styles in the management_url page. See the [MDN documentation
on browser styles](https://developer.mozilla.org/docs/Mozilla/Add-
ons/WebExtensions/user_interface/Browser_styles) for more information.

  * 

[`data_format`]

(string, optional) **Deprecated.**

This property is no longer used. The only supported data format for the data
argument in onFileUpload is
[File](https://developer.mozilla.org/docs/Web/API/File).

  * 

[`new_account_url`]

(string, optional) **Deprecated.**

This property was never used.

  * 

[`reuse_uploads`]

(boolean, optional)

– [Added in TB 98]

If a previously uploaded cloud file attachment is reused at a later time in a
different message, Thunderbird may use the already known url and templateInfo
values without triggering the registered onFileUpload listener again. Setting
this option to false will always trigger the registered listener, providing
the already known values through the relatedFileInfo parameter of the
onFileUpload event, to let the provider decide how to handle these cases.

  * 

[`service_url`]

(string, optional) **Deprecated.**

This property is no longer used. The service_url property of the
CloudFileTemplateInfo object returned by the onFileUpload event can be used to
add a _Learn more about_ link to the footer of the cloud file attachment
element.

Note

A manifest entry named cloud_file is required to use `messenger.cloudFile.*`.

## Functions

### getAccount(accountId)

Retrieve information about a single cloud file account, or undefined if it
does not exists

Parameters

  * 

`accountId`

(string)

Unique identifier of the account.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

CloudFileAccount

This may return undefined

### getAllAccounts()

Retrieve all cloud file accounts for the current add-on.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of CloudFileAccount

### updateAccount(accountId, updateProperties)

Update a cloud file account.

Parameters

  * 

`accountId`

(string)

Unique identifier of the account.

  * 

`updateProperties`

(object)

  * 

[`configured`]

(boolean, optional)

If true, the account is configured and ready to use. Only configured accounts
are offered to the user.

  * 

[`managementUrl`]

(string, optional)

A page for configuring accounts, to be displayed in the preferences UI.

  * 

[`spaceRemaining`]

(integer, optional)

The amount of remaining space on the cloud provider, in bytes. Set to -1 if
unsupported.

  * 

[`spaceUsed`]

(integer, optional)

The amount of space already used on the cloud provider, in bytes. Set to -1 if
unsupported.

  * 

[`uploadSizeLimit`]

(integer, optional)

The maximum size in bytes for a single file to upload. Set to -1 if unlimited.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

CloudFileAccount

This may return undefined

## Events

### onAccountAdded

Fired when a cloud file account of this add-on was created.

Parameters for onAccountAdded.addListener(listener)

  * 

`listener(account)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`account`

(CloudFileAccount)

The created account.

### onAccountDeleted

Fired when a cloud file account of this add-on was deleted.

Parameters for onAccountDeleted.addListener(listener)

  * 

`listener(accountId)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`accountId`

(string)

The id of the removed account.

### onFileDeleted

Fired when a previously uploaded file should be deleted.

Parameters for onFileDeleted.addListener(listener)

  * 

`listener(account, fileId, tab)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`account`

(CloudFileAccount)

The account used for the file upload.

  * 

`fileId`

(integer)

An identifier for this file.

  * 

`tab`

([Tab](tabs.html#tabs-tab))

– [Added in TB 91]

The tab where the upload was initiated. Currently only available for the
message composer.

### onFileRename

– [Added in TB 96, backported to TB 91.4.1]

Fired when a previously uploaded file should be renamed.

Parameters for onFileRename.addListener(listener)

  * 

`listener(account, fileId, newName, tab)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`account`

(CloudFileAccount)

The account used for the file upload.

  * 

`fileId`

(integer)

An identifier for the file which should be renamed.

  * 

`newName`

(string)

The new name of the file.

  * 

`tab`

([Tab](tabs.html#tabs-tab))

The tab where the rename was initiated. Currently only available for the
message composer.

Expected return value of the listener function

  * 

object

  * 

[`error`]

(boolean or string, optional)

Report an error to the user. Set this to true for showing a generic error
message, or set a specific error message.

  * 

[`url`]

(string, optional)

The URL where the renamed file can be accessed.

### onFileUpload

Fired when a file should be uploaded to the cloud file provider.

Parameters for onFileUpload.addListener(listener)

  * 

`listener(account, fileInfo, tab, relatedFileInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`account`

(CloudFileAccount)

The account used for the file upload.

  * 

`fileInfo`

(CloudFile)

The file to upload.

  * 

`tab`

([Tab](tabs.html#tabs-tab))

– [Added in TB 91]

The tab where the upload was initiated. Currently only available for the
message composer.

  * 

[`relatedFileInfo`]

(RelatedCloudFile, optional)

– [Added in TB 98]

Information about an already uploaded file, which is related to this upload.

Expected return value of the listener function

  * 

object

  * 

[`aborted`]

(boolean, optional)

Set this to true if the file upload was aborted by the user and an
onFileUploadAbort event has been received. No error message will be shown to
the user.

  * 

[`error`]

(boolean or string, optional)

– [Added in TB 96]

Report an error to the user. Set this to true for showing a generic error
message, or set a specific error message.

  * 

[`templateInfo`]

(CloudFileTemplateInfo, optional)

– [Added in TB 96, backported to TB 91.4.1]

Additional file information used in the cloud file entry added to the message.

  * 

[`url`]

(string, optional)

The URL where the uploaded file can be accessed.

### onFileUploadAbort

Parameters for onFileUploadAbort.addListener(listener)

  * 

`listener(account, fileId, tab)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`account`

(CloudFileAccount)

The account used for the file upload.

  * 

`fileId`

(integer)

An identifier for this file.

  * 

`tab`

([Tab](tabs.html#tabs-tab))

– [Added in TB 91]

The tab where the upload was initiated. Currently only available for the
message composer.

## Types

### CloudFile

Information about a cloud file.

object

  * 

`data`

([File](https://developer.mozilla.org/en-US/docs/Web/API/File))

Contents of the file to be transferred.

  * 

`id`

(integer)

An identifier for this file.

  * 

`name`

(string)

Filename of the file to be transferred.

### CloudFileAccount

Information about a cloud file account.

object

  * 

`configured`

(boolean)

If true, the account is configured and ready to use. Only configured accounts
are offered to the user.

  * 

`id`

(string)

Unique identifier of the account.

  * 

`managementUrl`

(string)

A page for configuring accounts, to be displayed in the preferences UI.

  * 

`name`

(string)

A user-friendly name for this account.

  * 

[`spaceRemaining`]

(integer, optional)

The amount of remaining space on the cloud provider, in bytes. Set to -1 if
unsupported.

  * 

[`spaceUsed`]

(integer, optional)

The amount of space already used on the cloud provider, in bytes. Set to -1 if
unsupported.

  * 

[`uploadSizeLimit`]

(integer, optional)

The maximum size in bytes for a single file to upload. Set to -1 if unlimited.

### CloudFileTemplateInfo

– [Added in TB 97]

Defines information to be used in the cloud file entry added to the message.

object

  * 

[`download_expiry_date`]

(object, optional)

– [Added in TB 98]

If set, the cloud file entry for this upload will include a hint, that the
link will only be available for a limited time.

  * 

`timestamp`

(integer)

The expiry date of the link as the number of milliseconds since the UNIX
epoch.

  * 

[`format`]

(object, optional)

A format options object as used by
[Intl.DateTimeFormat](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat).
Defaults to:

    
    
    {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short"
    }
    

  * 

[`download_limit`]

(integer, optional)

– [Added in TB 98]

If set, the cloud file entry for this upload will include a hint, that the
file has a download limit.

  * 

[`download_password_protected`]

(boolean, optional)

– [Added in TB 98]

If set to true, the cloud file entry for this upload will include a hint, that
the download link is password protected.

  * 

[`service_icon`]

(string, optional)

A URL pointing to an icon to represent the used cloud file service. Defaults
to the icon of the provider add-on.

  * 

[`service_name`]

(string, optional)

A name to represent the used cloud file service. Defaults to the associated
cloud file account name.

  * 

[`service_url`]

(string, optional)

A URL pointing to a web page of the used cloud file service. Will be used in a
_Learn more about_ link in the footer of the cloud file attachment element.

### RelatedCloudFile

Information about an already uploaded cloud file, which is related to a new
upload. For example if the content of a cloud attachment is updated, if a
repeatedly used cloud attachment is renamed (and therefore should be re-
uploaded to not invalidate existing links) or if the provider has its manifest
property reuse_uploads set to false.

object

  * 

`dataChanged`

(boolean)

The content of the new upload differs from the related file.

  * 

`name`

(string)

Filename of the related file.

  * 

[`id`]

(integer, optional)

The identifier for the related file. In some circumstances, the id is
unavailable.

  * 

[`templateInfo`]

(CloudFileTemplateInfo, optional)

Additional information of the related file, used in the cloud file entry added
to the message.

  * 

[`url`]

(string, optional)

The URL where the upload of the related file can be accessed.

