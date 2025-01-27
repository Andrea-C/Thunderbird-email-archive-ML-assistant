≡ pkcs11 API

  * Permissions

  * Functions

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

# pkcs11 API

PKCS#11 module management API

## Permissions

  * 

pkcs11

Note

The permission pkcs11 is required to use `messenger.pkcs11.*`.

## Functions

### getModuleSlots(name)

Enumerate a module’s slots, each with their name and whether a token is
present

Parameters

  * 

`name`

(string)

Required permissions

  * pkcs11

### installModule(name, [flags])

Install a PKCS#11 module with a given name

Parameters

  * 

`name`

(string)

  * 

[`flags`]

(integer, optional)

Required permissions

  * pkcs11

### isModuleInstalled(name)

checks whether a PKCS#11 module, given by name, is installed

Parameters

  * 

`name`

(string)

Required permissions

  * pkcs11

### uninstallModule(name)

Remove an installed PKCS#11 module from firefox

Parameters

  * 

`name`

(string)

Required permissions

  * pkcs11

