≡ accounts API

  * Permissions

  * Functions

  * Events

  * Types

  * Examples

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

≡ Related information

  * [Working with WebExtension events](examples/eventListeners.html)

# accounts API

The accounts API provides access to the user’s server accounts.

## Permissions

  * 

accountsRead

See your mail accounts, their identities and their folders

Note

The permission accountsRead is required to use `messenger.accounts.*`.

## Functions

### get(accountId, [includeSubFolders])

Returns details of the requested account, or null if it doesn’t exist.

Parameters

  * 

`accountId`

(MailAccountId)

  * 

[`includeSubFolders`]

(boolean, optional)

– [Added in TB 91]

Specifies whether the [MailFolder](folders.html#folders-mailfolder) in the
rootFolder property of the returned MailAccount should populate its subFolders
property, and include all (nested!) subfolders. Defaults to false.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailAccount

Required permissions

  * accountsRead

### getDefault([includeSubFolders])

– [Added in TB 85, backported to TB 78.7.0]

Returns the default account, or null if it is not defined.

Parameters

  * 

[`includeSubFolders`]

(boolean, optional)

– [Added in TB 91]

Specifies whether the [MailFolder](folders.html#folders-mailfolder) in the
rootFolder property of the default MailAccount should populate its subFolders
property, and include all (nested!) subfolders. Defaults to false

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailAccount or null

Required permissions

  * accountsRead

### list([includeSubFolders])

Returns all mail accounts. They will be returned in the same order as used in
Thunderbird’s folder pane.

Parameters

  * 

[`includeSubFolders`]

(boolean, optional)

– [Added in TB 91]

Specifies whether the [MailFolder](folders.html#folders-mailfolder) in the
rootFolder property of each found MailAccount should populate its subFolders
property, and include all (nested!) subfolders. Defaults to false.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of MailAccount

Required permissions

  * accountsRead

## Events

### onCreated

– [Added in TB 98]

Fired when a new account has been created.

Parameters for onCreated.addListener(listener)

  * 

`listener(accountId, account)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`accountId`

(MailAccountId)

  * 

`account`

(MailAccount)

Required permissions

  * accountsRead

### onDeleted

– [Added in TB 98]

Fired when an account has been removed.

Parameters for onDeleted.addListener(listener)

  * 

`listener(accountId)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`accountId`

(MailAccountId)

Required permissions

  * accountsRead

### onUpdated

– [Added in TB 98]

Fired when a property of an account has been modified. Folders and identities
of accounts are not monitored by this event, use the dedicated folder and
identity events instead. A changed defaultIdentity is reported only after a
different identity has been assigned as default identity, but not after a
property of the default identity has been changed.

Parameters for onUpdated.addListener(listener)

  * 

`listener(accountId, changedValues)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`accountId`

(MailAccountId)

  * 

`changedValues`

(object)

  * 

`defaultIdentity`

([MailIdentity](identities.html#identities-mailidentity))

The default identity of this account.

  * 

`name`

(string)

The human-friendly name of this account.

Required permissions

  * accountsRead

## Types

### MailAccount

An object describing a mail account, as returned for example by the
list([includeSubFolders]) and get(accountId, [includeSubFolders]) methods.

object

  * 

`id`

(MailAccountId)

A unique identifier for this account.

  * 

`identities`

(array of [MailIdentity](identities.html#identities-mailidentity))

– [Added in TB 76]

The identities associated with this account. The default identity is listed
first, others in no particular order.

  * 

`name`

(string)

The human-friendly name of this account.

  * 

`rootFolder`

([MailFolder](folders.html#folders-mailfolder))

The root folder associated with this account.

  * 

`type`

(string)

What sort of account this is, e.g. imap, nntp, or pop3.

### MailAccountId

A unique id representing a MailAccount.

string

### MailAccountType

The type of an account.

string

Supported values:

  * 

imap

  * 

local

  * 

nntp

  * 

pop3

## Examples

### Extracting IMAP accounts

The following code can be used to find all IMAP accounts

    
    
    // Get all accounts.
    let accounts = await messenger.accounts.list();
    
    // Filter on accounts with type "imap".
    let imapAccounts = accounts.filter(account => account.type == "imap")
    

