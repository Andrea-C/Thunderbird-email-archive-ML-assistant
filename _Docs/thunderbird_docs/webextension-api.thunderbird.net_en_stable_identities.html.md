≡ identities API

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

≡ Related information

  * [Working with WebExtension events](examples/eventListeners.html)

# identities API

The identities API allows to manage the user’s identities (each account can
have multiple identities).

## Permissions

  * 

accountsIdentities

Create, modify or delete your mail account identities

Note

The permission accountsRead is required to use `messenger.identities.*`.

## Functions

### create(accountId, details)

Create a new identity in the specified account.

Parameters

  * 

`accountId`

([MailAccountId](accounts.html#accounts-mailaccountid))

  * 

`details`

(MailIdentity)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailIdentity

Required permissions

  * accountsRead

  * accountsIdentities

### delete(identityId)

Attempts to delete the requested identity. Default identities cannot be
deleted.

Parameters

  * 

`identityId`

(string)

Required permissions

  * accountsRead

  * accountsIdentities

### get(identityId)

Returns details of the requested identity, or null if it doesn’t exist.

Parameters

  * 

`identityId`

(string)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailIdentity or null

Required permissions

  * accountsRead

### getDefault(accountId)

Returns the default identity for the requested account, or null if it is not
defined.

Parameters

  * 

`accountId`

([MailAccountId](accounts.html#accounts-mailaccountid))

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailIdentity or null

Required permissions

  * accountsRead

### list([accountId])

Returns the identities of the specified account, or all identities if no
account is specified. Do not expect the returned identities to be in any
specific order. Use getDefault(accountId) to get the default identity of an
account.

Parameters

  * 

[`accountId`]

([MailAccountId](accounts.html#accounts-mailaccountid), optional)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of MailIdentity

Required permissions

  * accountsRead

### setDefault(accountId, identityId)

Sets the default identity for the requested account.

Parameters

  * 

`accountId`

([MailAccountId](accounts.html#accounts-mailaccountid))

  * 

`identityId`

(string)

Required permissions

  * accountsRead

### update(identityId, details)

Updates the details of an identity.

Parameters

  * 

`identityId`

(string)

  * 

`details`

(MailIdentity)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

MailIdentity

Required permissions

  * accountsRead

  * accountsIdentities

## Events

### onCreated

Fired when a new identity has been created and added to an account. The event
also fires for default identities that are created when a new account is
added.

Parameters for onCreated.addListener(listener)

  * 

`listener(identityId, identity)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`identityId`

(string)

  * 

`identity`

(MailIdentity)

Required permissions

  * accountsRead

### onDeleted

Fired when an identity has been removed from an account.

Parameters for onDeleted.addListener(listener)

  * 

`listener(identityId)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`identityId`

(string)

Required permissions

  * accountsRead

### onUpdated

Fired when one or more properties of an identity have been modified. The
returned MailIdentity includes only the changed values.

Parameters for onUpdated.addListener(listener)

  * 

`listener(identityId, changedValues)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`identityId`

(string)

  * 

`changedValues`

(MailIdentity)

Required permissions

  * accountsRead

## Types

### EncryptionCapabilities

object

  * 

`canEncrypt`

(boolean)

Whether the encryption technology is configured to support message encryption.

  * 

`canSign`

(boolean)

Whether the encryption technology is configured to support message signing.

### MailIdentity

– [Added in TB 76]

object

  * 

[`accountId`]

([MailAccountId](accounts.html#accounts-mailaccountid), optional)

The id of the [MailAccount](accounts.html#accounts-mailaccount) this identity
belongs to. The accountId property is read-only.

  * 

[`composeHtml`]

(boolean, optional)

– [Added in TB 85, backported to TB 78.7.0]

If the identity uses HTML as the default compose format.

  * 

[`email`]

(string, optional)

The user’s email address as used when messages are sent from this identity.

  * 

[`encryptionCapabilities`]

(object, optional)

– [Added in TB 128]

The encryption capabilities of this identity. Read only.

  * 

`OpenPGP`

(EncryptionCapabilities)

The capabilities of this identity for the OpenPGP encryption technology.

  * 

`S/MIME`

(EncryptionCapabilities)

The capabilities of this identity for the S/MIME encryption technology.

  * 

[`id`]

(string, optional)

A unique identifier for this identity. The id property is read-only.

  * 

[`label`]

(string, optional)

A user-defined label for this identity.

  * 

[`name`]

(string, optional)

The user’s name as used when messages are sent from this identity.

  * 

[`organization`]

(string, optional)

The organization associated with this identity.

  * 

[`replyTo`]

(string, optional)

The reply-to email address associated with this identity.

  * 

[`signature`]

(string, optional)

– [Added in TB 91]

The signature of the identity.

  * 

[`signatureIsPlainText`]

(boolean, optional)

– [Added in TB 91]

If the signature should be interpreted as plain text or as HTML.

