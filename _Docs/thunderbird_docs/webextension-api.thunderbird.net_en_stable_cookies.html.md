≡ cookies API

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

# cookies API

Use the browser.cookies API to query and modify cookies, and to be notified
when they change.

## Permissions

  * 

cookies

Note

The permission cookies is required to use `messenger.cookies.*`.

## Functions

### get(details)

Retrieves information about a single cookie. If more than one cookie of the
same name exists for the given URL, the one with the longest path will be
returned. For cookies with the same path length, the cookie with the earliest
creation time will be returned.

Parameters

  * 

`details`

(object)

Details to identify the cookie being retrieved.

  * 

`name`

(string)

The name of the cookie to retrieve.

  * 

`url`

(string)

The URL with which the cookie to retrieve is associated. This argument may be
a full URL, in which case any data following the URL path (e.g. the query
string) is simply ignored. If host permissions for this URL are not specified
in the manifest file, the API call will fail.

  * 

[`firstPartyDomain`]

(string, optional)

The first-party domain which the cookie to retrieve is associated. This
attribute is required if First-Party Isolation is enabled.

  * 

[`partitionKey`]

(PartitionKey, optional)

The storage partition, if the cookie is part of partitioned storage. By
default, only non-partitioned cookies are returned.

  * 

[`storeId`]

(string, optional)

The ID of the cookie store in which to look for the cookie. By default, the
current execution context’s cookie store will be used.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Cookie

Contains details about the cookie. This parameter is null if no such cookie
was found.

Required permissions

  * cookies

### getAll(details)

Retrieves all cookies from a single cookie store that match the given
information. The cookies returned will be sorted, with those with the longest
path first. If multiple cookies have the same path length, those with the
earliest creation time will be first.

Parameters

  * 

`details`

(object)

Information to filter the cookies being retrieved.

  * 

[`domain`]

(string, optional)

Restricts the retrieved cookies to those whose domains match or are subdomains
of this one.

  * 

[`firstPartyDomain`]

(string, optional)

Restricts the retrieved cookies to those whose first-party domains match this
one. This attribute is required if First-Party Isolation is enabled. To not
filter by a specific first-party domain, use null or undefined.

  * 

[`name`]

(string, optional)

Filters the cookies by name.

  * 

[`partitionKey`]

(PartitionKey, optional)

Selects a specific storage partition to look up cookies. Defaults to null, in
which case only non-partitioned cookies are retrieved. If an object iis
passed, partitioned cookies are also included, and filtered based on the keys
present in the given PartitionKey description. An empty object ({}) returns
all cookies (partitioned + unpartitioned), a non-empty object (e.g.
{topLevelSite: ‘…’}) only returns cookies whose partition match all given
attributes.

  * 

[`path`]

(string, optional)

Restricts the retrieved cookies to those whose path exactly matches this
string.

  * 

[`secure`]

(boolean, optional)

Filters the cookies by their Secure property.

  * 

[`session`]

(boolean, optional)

Filters out session vs. persistent cookies.

  * 

[`storeId`]

(string, optional)

The cookie store to retrieve cookies from. If omitted, the current execution
context’s cookie store will be used.

  * 

[`url`]

(string, optional)

Restricts the retrieved cookies to those that would match the given URL.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of Cookie

All the existing, unexpired cookies that match the given cookie info.

Required permissions

  * cookies

### getAllCookieStores()

Lists all existing cookie stores.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of CookieStore

All the existing cookie stores.

Required permissions

  * cookies

### remove(details)

Deletes a cookie by name.

Parameters

  * 

`details`

(object)

Information to identify the cookie to remove.

  * 

`name`

(string)

The name of the cookie to remove.

  * 

`url`

(string)

The URL associated with the cookie. If host permissions for this URL are not
specified in the manifest file, the API call will fail.

  * 

[`firstPartyDomain`]

(string, optional)

The first-party domain associated with the cookie. This attribute is required
if First-Party Isolation is enabled.

  * 

[`partitionKey`]

(PartitionKey, optional)

The storage partition, if the cookie is part of partitioned storage. By
default, non-partitioned storage is used.

  * 

[`storeId`]

(string, optional)

The ID of the cookie store to look in for the cookie. If unspecified, the
cookie is looked for by default in the current execution context’s cookie
store.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

object

Contains details about the cookie that’s been removed. If removal failed for
any reason, this will be “null”, and [lastError](runtime.html#runtime-
lasterror) will be set.

  * 

`firstPartyDomain`

(string)

The first-party domain associated with the cookie that’s been removed.

  * 

`name`

(string)

The name of the cookie that’s been removed.

  * 

`storeId`

(string)

The ID of the cookie store from which the cookie was removed.

  * 

`url`

(string)

The URL associated with the cookie that’s been removed.

  * 

[`partitionKey`]

(PartitionKey, optional)

The storage partition, if the cookie is part of partitioned storage. null if
not partitioned.

Required permissions

  * cookies

### set(details)

Sets a cookie with the given cookie data; may overwrite equivalent cookies if
they exist.

Parameters

  * 

`details`

(object)

Details about the cookie being set.

  * 

`url`

(string)

The request-URI to associate with the setting of the cookie. This value can
affect the default domain and path values of the created cookie. If host
permissions for this URL are not specified in the manifest file, the API call
will fail.

  * 

[`domain`]

(string, optional)

The domain of the cookie. If omitted, the cookie becomes a host-only cookie.

  * 

[`expirationDate`]

(number, optional)

The expiration date of the cookie as the number of seconds since the UNIX
epoch. If omitted, the cookie becomes a session cookie.

  * 

[`firstPartyDomain`]

(string, optional)

The first-party domain of the cookie. This attribute is required if First-
Party Isolation is enabled.

  * 

[`httpOnly`]

(boolean, optional)

Whether the cookie should be marked as HttpOnly. Defaults to false.

  * 

[`name`]

(string, optional)

The name of the cookie. Empty by default if omitted.

  * 

[`partitionKey`]

(PartitionKey, optional)

The storage partition, if the cookie is part of partitioned storage. By
default, non-partitioned storage is used.

  * 

[`path`]

(string, optional)

The path of the cookie. Defaults to the path portion of the url parameter.

  * 

[`sameSite`]

(SameSiteStatus, optional)

The cookie’s same-site status.

  * 

[`secure`]

(boolean, optional)

Whether the cookie should be marked as Secure. Defaults to false.

  * 

[`storeId`]

(string, optional)

The ID of the cookie store in which to set the cookie. By default, the cookie
is set in the current execution context’s cookie store.

  * 

[`value`]

(string, optional)

The value of the cookie. Empty by default if omitted.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Cookie

Contains details about the cookie that’s been set. If setting failed for any
reason, this will be “null”, and [lastError](runtime.html#runtime-lasterror)
will be set.

Required permissions

  * cookies

## Events

### onChanged

Fired when a cookie is set or removed. As a special case, note that updating a
cookie’s properties is implemented as a two step process: the cookie to be
updated is first removed entirely, generating a notification with “cause” of
“overwrite” . Afterwards, a new cookie is written with the updated values,
generating a second notification with “cause” “explicit”.

Parameters for onChanged.addListener(listener)

  * 

`listener(changeInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`changeInfo`

(object)

  * 

`cause`

(OnChangedCause)

The underlying reason behind the cookie’s change.

  * 

`cookie`

(Cookie)

Information about the cookie that was set or removed.

  * 

`removed`

(boolean)

True if a cookie was removed.

Required permissions

  * cookies

## Types

### Cookie

Represents information about an HTTP cookie.

object

  * 

`domain`

(string)

The domain of the cookie (e.g. “www.google.com”, “example.com”).

  * 

`firstPartyDomain`

(string)

The first-party domain of the cookie.

  * 

`hostOnly`

(boolean)

True if the cookie is a host-only cookie (i.e. a request’s host must exactly
match the domain of the cookie).

  * 

`httpOnly`

(boolean)

True if the cookie is marked as HttpOnly (i.e. the cookie is inaccessible to
client-side scripts).

  * 

`name`

(string)

The name of the cookie.

  * 

`path`

(string)

The path of the cookie.

  * 

`sameSite`

(SameSiteStatus)

The cookie’s same-site status (i.e. whether the cookie is sent with cross-site
requests).

  * 

`secure`

(boolean)

True if the cookie is marked as Secure (i.e. its scope is limited to secure
channels, typically HTTPS).

  * 

`session`

(boolean)

True if the cookie is a session cookie, as opposed to a persistent cookie with
an expiration date.

  * 

`storeId`

(string)

The ID of the cookie store containing this cookie, as provided in
getAllCookieStores().

  * 

`value`

(string)

The value of the cookie.

  * 

[`expirationDate`]

(number, optional)

The expiration date of the cookie as the number of seconds since the UNIX
epoch. Not provided for session cookies.

  * 

[`partitionKey`]

(PartitionKey, optional)

The cookie’s storage partition, if any. null if not partitioned.

### CookieStore

Represents a cookie store in the browser. An incognito mode window, for
instance, uses a separate cookie store from a non-incognito window.

object

  * 

`id`

(string)

The unique identifier for the cookie store.

  * 

`incognito`

(boolean)

Indicates if this is an incognito cookie store

  * 

`tabIds`

(array of integer)

Identifiers of all the browser tabs that share this cookie store.

### OnChangedCause

The underlying reason behind the cookie’s change. If a cookie was inserted, or
removed via an explicit call to remove(details), “cause” will be “explicit”.
If a cookie was automatically removed due to expiry, “cause” will be
“expired”. If a cookie was removed due to being overwritten with an already-
expired expiration date, “cause” will be set to “expired_overwrite”. If a
cookie was automatically removed due to garbage collection, “cause” will be
“evicted”. If a cookie was automatically removed due to a “set” call that
overwrote it, “cause” will be “overwrite”. Plan your response accordingly.

string

Supported values:

  * 

evicted

  * 

expired

  * 

explicit

  * 

expired_overwrite

  * 

overwrite

### PartitionKey

The description of the storage partition of a cookie. This object may be
omitted (null) if a cookie is not partitioned.

object

  * 

[`topLevelSite`]

(string, optional)

The first-party URL of the cookie, if the cookie is in storage partitioned by
the top-level site.

### SameSiteStatus

A cookie’s ‘SameSite’ state (<https://tools.ietf.org/html/draft-west-first-
party-cookies>). ‘no_restriction’ corresponds to a cookie set without a
‘SameSite’ attribute, ‘lax’ to ‘SameSite=Lax’, and ‘strict’ to
‘SameSite=Strict’.

string

Supported values:

  * 

no_restriction

  * 

lax

  * 

strict

