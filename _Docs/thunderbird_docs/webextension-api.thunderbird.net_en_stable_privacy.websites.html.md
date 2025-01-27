≡ privacy.websites API

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

# privacy.websites API

Use the browser.privacy API to control usage of the features in the browser
that can affect a user’s privacy.

## Permissions

  * 

privacy

Read and modify privacy settings

Note

The permission privacy is required to use `messenger.privacy.websites.*`.

## Types

### CookieConfig

The settings for cookies.

object

  * 

[`behavior`]

(string, optional)

The type of cookies to allow.

Supported values:

  * 

allow_all

  * 

reject_all

  * 

reject_third_party

  * 

allow_visited

  * 

reject_trackers

  * 

reject_trackers_and_partition_foreign

  * 

[`nonPersistentCookies`]

(boolean, optional) **Deprecated.**

Whether to create all cookies as nonPersistent (i.e., session) cookies.

### TrackingProtectionModeOption

The mode for tracking protection.

string

Supported values:

  * 

always

  * 

never

  * 

private_browsing

## Properties

### cookieConfig

Allow users to specify the default settings for allowing cookies, as well as
whether all cookies should be created as non-persistent cookies. This
setting’s value is of type CookieConfig.

### firstPartyIsolate

If enabled, the browser will associate all data (including cookies, HSTS data,
cached images, and more) for any third party domains with the domain in the
address bar. This prevents third party trackers from using directly stored
information to identify you across different websites, but may break websites
where you login with a third party account (such as a Facebook or Google
login.) The value of this preference is of type boolean, and the default value
is false.

### hyperlinkAuditingEnabled

If enabled, the browser sends auditing pings when requested by a website
(&lt;a ping&gt;). The value of this preference is of type boolean, and the
default value is true.

### protectedContentEnabled

<strong>Available on Windows and ChromeOS only</strong>: If enabled, the
browser provides a unique ID to plugins in order to run protected content. The
value of this preference is of type boolean, and the default value is true.

### referrersEnabled

If enabled, the browser sends referer headers with your requests. Yes, the
name of this preference doesn’t match the misspelled header. No, we’re not
going to change it. The value of this preference is of type boolean, and the
default value is true.

### resistFingerprinting

If enabled, the browser attempts to appear similar to other users by reporting
generic information to websites. This can prevent websites from uniquely
identifying users. Examples of data that is spoofed include number of CPU
cores, precision of JavaScript timers, the local timezone, and disabling
features such as GamePad support, and the WebSpeech and Navigator APIs. The
value of this preference is of type boolean, and the default value is false.

### thirdPartyCookiesAllowed

If disabled, the browser blocks third-party sites from setting cookies. The
value of this preference is of type boolean, and the default value is true.

### trackingProtectionMode

Allow users to specify the mode for tracking protection. This setting’s value
is of type TrackingProtectionModeOption, defaulting to private_browsing_only.

