≡ dns API

  * Permissions

  * Functions

  * Types

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

# dns API

Asynchronous DNS API

## Permissions

  * 

dns

Note

The permission dns is required to use `messenger.dns.*`.

## Functions

### resolve(hostname, [flags])

Resolves a hostname to a DNS record.

Parameters

  * 

`hostname`

(string)

  * 

[`flags`]

(ResolveFlags, optional)

Required permissions

  * dns

## Types

### DNSRecord

An object encapsulating a DNS Record.

object

  * 

`addresses`

(array of string)

  * 

`isTRR`

(string)

Record retreived with TRR.

  * 

[`canonicalName`]

(string, optional)

The canonical hostname for this record. this value is empty if the record was
not fetched with the ‘canonical_name’ flag.

### ResolveFlags

array of string

Supported values:

  * 

allow_name_collisions

  * 

bypass_cache

  * 

canonical_name

  * 

disable_ipv4

  * 

disable_ipv6

  * 

disable_trr

  * 

offline

  * 

priority_low

  * 

priority_medium

  * 

speculate

