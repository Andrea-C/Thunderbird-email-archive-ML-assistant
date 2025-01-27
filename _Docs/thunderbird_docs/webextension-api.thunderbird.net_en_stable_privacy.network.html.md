≡ privacy.network API

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

# privacy.network API

Use the browser.privacy API to control usage of the features in the browser
that can affect a user’s privacy.

## Permissions

  * 

privacy

Read and modify privacy settings

Note

The permission privacy is required to use `messenger.privacy.network.*`.

## Types

### HTTPSOnlyModeOption

The mode for https-only mode.

string

Supported values:

  * 

always

  * 

private_browsing

  * 

never

### IPHandlingPolicy

The IP handling policy of WebRTC.

string

Supported values:

  * 

default

  * 

default_public_and_private_interfaces

  * 

default_public_interface_only

  * 

disable_non_proxied_udp

  * 

proxy_only

### tlsVersionRestrictionConfig

An object which describes TLS minimum and maximum versions.

object

  * 

[`maximum`]

(string, optional)

The maximum TLS version supported.

Supported values:

  * 

TLSv1

  * 

TLSv1.1

  * 

TLSv1.2

  * 

TLSv1.3

  * 

unknown

  * 

[`minimum`]

(string, optional)

The minimum TLS version supported.

Supported values:

  * 

TLSv1

  * 

TLSv1.1

  * 

TLSv1.2

  * 

TLSv1.3

  * 

unknown

## Properties

### globalPrivacyControl

Allow users to query the status of ‘Global Privacy Control’. This setting’s
value is of type boolean, defaulting to false.

### httpsOnlyMode

Allow users to query the mode for ‘HTTPS-Only Mode’. This setting’s value is
of type HTTPSOnlyModeOption, defaulting to never.

### networkPredictionEnabled

If enabled, the browser attempts to speed up your web browsing experience by
pre-resolving DNS entries, prerendering sites (&lt;link rel=’prefetch’ …&gt;),
and preemptively opening TCP and SSL connections to servers. This preference’s
value is a boolean, defaulting to true.

### peerConnectionEnabled

Allow users to enable and disable RTCPeerConnections (aka WebRTC).

### tlsVersionRestriction

This property controls the minimum and maximum TLS versions. This setting’s
value is an object of tlsVersionRestrictionConfig.

### webRTCIPHandlingPolicy

Allow users to specify the media performance/privacy tradeoffs which impacts
how WebRTC traffic will be routed and how much local address information is
exposed. This preference’s value is of type IPHandlingPolicy, defaulting to
default.

