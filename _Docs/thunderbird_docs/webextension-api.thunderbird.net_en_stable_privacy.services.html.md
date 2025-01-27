≡ privacy.services API

  * Permissions

  * Properties

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

# privacy.services API

Use the browser.privacy API to control usage of the features in the browser
that can affect a user’s privacy.

## Permissions

  * 

privacy

Read and modify privacy settings

Note

The permission privacy is required to use `messenger.privacy.services.*`.

## Properties

### passwordSavingEnabled

If enabled, the password manager will ask if you want to save passwords. This
preference’s value is a boolean, defaulting to true.

