≡ declarativeNetRequest API

  * Manifest file properties

  * Permissions

  * Functions

  * Types

  * Properties

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

# declarativeNetRequest API

Use the declarativeNetRequest API to block or modify network requests by
specifying declarative rules.

## Manifest file properties

  * 

[`declarative_net_request`]

(object, optional)

  * 

`rule_resources`

(array of object)

## Permissions

  * 

declarativeNetRequest

Block content on any page

  * 

declarativeNetRequestFeedback

Read your browsing history

  * 

declarativeNetRequestWithHostAccess

Note

One of the permissions declarativeNetRequest or
declarativeNetRequestWithHostAccess is required to use
`messenger.declarativeNetRequest.*`.

## Functions

### getAvailableStaticRuleCount()

Returns the remaining number of static rules an extension can enable

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

integer

Required permissions

  * declarativeNetRequest

  * declarativeNetRequestWithHostAccess

### getDisabledRuleIds(options)

Returns the list of individual disabled static rules from a given static
ruleset id.

Parameters

  * 

`options`

(object)

  * 

`rulesetId`

(string)

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of integer

Required permissions

  * declarativeNetRequest

  * declarativeNetRequestWithHostAccess

### getDynamicRules([filter])

Returns the current set of dynamic rules for the extension.

Parameters

  * 

[`filter`]

(GetRulesFilter, optional)

An object to filter the set of dynamic rules for the extension.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of Rule

Required permissions

  * declarativeNetRequest

  * declarativeNetRequestWithHostAccess

### getEnabledRulesets()

Returns the ids for the current set of enabled static rulesets.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of string

Required permissions

  * declarativeNetRequest

  * declarativeNetRequestWithHostAccess

### getSessionRules([filter])

Returns the current set of session scoped rules for the extension.

Parameters

  * 

[`filter`]

(GetRulesFilter, optional)

An object to filter the set of session scoped rules for the extension.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of Rule

Required permissions

  * declarativeNetRequest

  * declarativeNetRequestWithHostAccess

### isRegexSupported(regexOptions)

Checks if the given regular expression will be supported as a ‘regexFilter’
rule condition.

Parameters

  * 

`regexOptions`

(object)

  * 

`regex`

(string)

The regular expresson to check.

  * 

[`isCaseSensitive`]

(boolean, optional)

Whether the ‘regex’ specified is case sensitive.

  * 

[`requireCapturing`]

(boolean, optional)

Whether the ‘regex’ specified requires capturing. Capturing is only required
for redirect rules which specify a ‘regexSubstition’ action.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

object

  * 

`isSupported`

(boolean)

Whether the given regex is supported

  * 

[`reason`]

(UnsupportedRegexReason, optional)

Specifies the reason why the regular expression is not supported. Only
provided if ‘isSupported’ is false.

Required permissions

  * declarativeNetRequest

  * declarativeNetRequestWithHostAccess

### testMatchOutcome(request, [options])

Checks if any of the extension’s declarativeNetRequest rules would match a
hypothetical request.

Parameters

  * 

`request`

(object)

The details of the request to test.

  * 

`type`

(ResourceType)

The resource type of the hypothetical request.

  * 

`url`

(string)

The URL of the hypothetical request.

  * 

[`initiator`]

(string, optional)

The initiator URL (if any) for the hypothetical request.

  * 

[`method`]

(string, optional)

Standard HTTP method of the hypothetical request.

  * 

[`tabId`]

(integer, optional)

The ID of the tab in which the hypothetical request takes place. Does not need
to correspond to a real tab ID. Default is -1, meaning that the request isn’t
related to a tab.

  * 

[`options`]

(object, optional)

  * 

[`includeOtherExtensions`]

(boolean, optional)

Whether to account for rules from other installed extensions during rule
evaluation.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

object

  * 

`matchedRules`

(array of MatchedRule)

The rules (if any) that match the hypothetical request.

Required permissions

  * declarativeNetRequest

  * declarativeNetRequestWithHostAccess

  * declarativeNetRequestFeedback

### updateDynamicRules(options)

Modifies the current set of dynamic rules for the extension. The rules with
IDs listed in options.removeRuleIds are first removed, and then the rules
given in options.addRules are added. These rules are persisted across browser
sessions and extension updates.

Parameters

  * 

`options`

(object)

  * 

[`addRules`]

(array of Rule, optional)

Rules to add.

  * 

[`removeRuleIds`]

(array of integer, optional)

IDs of the rules to remove. Any invalid IDs will be ignored.

Required permissions

  * declarativeNetRequest

  * declarativeNetRequestWithHostAccess

### updateEnabledRulesets(updateRulesetOptions)

Modifies the static rulesets enabled/disabled state.

Parameters

  * 

`updateRulesetOptions`

(object)

  * 

[`disableRulesetIds`]

(array of string, optional)

  * 

[`enableRulesetIds`]

(array of string, optional)

Required permissions

  * declarativeNetRequest

  * declarativeNetRequestWithHostAccess

### updateSessionRules(options)

Modifies the current set of session scoped rules for the extension. The rules
with IDs listed in options.removeRuleIds are first removed, and then the rules
given in options.addRules are added. These rules are not persisted across
sessions and are backed in memory.

Parameters

  * 

`options`

(object)

  * 

[`addRules`]

(array of Rule, optional)

Rules to add.

  * 

[`removeRuleIds`]

(array of integer, optional)

IDs of the rules to remove. Any invalid IDs will be ignored.

Required permissions

  * declarativeNetRequest

  * declarativeNetRequestWithHostAccess

### updateStaticRules(options)

Modified individual static rules enabled/disabled state. Changes to rules
belonging to a disabled ruleset will take effect when the ruleset becomes
enabled.

Parameters

  * 

`options`

(object)

  * 

`rulesetId`

(string)

  * 

[`disableRuleIds`]

(array of integer, optional)

  * 

[`enableRuleIds`]

(array of integer, optional)

Required permissions

  * declarativeNetRequest

  * declarativeNetRequestWithHostAccess

## Types

### GetRulesFilter

object

  * 

[`ruleIds`]

(array of integer, optional)

If specified, only rules with matching IDs are included.

### MatchedRule

object

  * 

`ruleId`

(integer)

A matching rule’s ID.

  * 

`rulesetId`

(string)

ID of the Ruleset this rule belongs to.

  * 

[`extensionId`]

(string, optional)

ID of the extension, if this rule belongs to a different extension.

### ResourceType

How the requested resource will be used. Comparable to the
webRequest.ResourceType type.

string

Supported values:

  * 

main_frame

  * 

sub_frame

  * 

stylesheet

  * 

script

  * 

image

  * 

object

  * 

object_subrequest

  * 

xmlhttprequest

  * 

xslt

  * 

ping

  * 

beacon

  * 

xml_dtd

  * 

font

  * 

media

  * 

websocket

  * 

csp_report

  * 

imageset

  * 

web_manifest

  * 

speculative

  * 

other

### Rule

object

  * 

`action`

(object)

The action to take if this rule is matched.

  * 

`type`

(string)

Supported values:

  * 

block

  * 

redirect

  * 

allow

  * 

upgradeScheme

  * 

modifyHeaders

  * 

allowAllRequests

  * 

[`redirect`]

(object, optional)

Describes how the redirect should be performed. Only valid when type is
‘redirect’.

  * 

[`extensionPath`]

(string, optional)

Path relative to the extension directory. Should start with ‘/’.

  * 

[`regexSubstitution`]

(string, optional)

Substitution pattern for rules which specify a ‘regexFilter’. The first match
of regexFilter within the url will be replaced with this pattern. Within
regexSubstitution, backslash-escaped digits (1 to 9) can be used to insert the
corresponding capture groups. 0 refers to the entire matching text.

  * 

[`transform`]

(URLTransform, optional)

Url transformations to perform.

  * 

[`url`]

(string, optional)

The redirect url. Redirects to JavaScript urls are not allowed.

  * 

[`requestHeaders`]

(array of object, optional)

The request headers to modify for the request. Only valid when type is
‘modifyHeaders’.

  * 

[`responseHeaders`]

(array of object, optional)

The response headers to modify for the request. Only valid when type is
‘modifyHeaders’.

  * 

`condition`

(object)

The condition under which this rule is triggered.

  * 

[`domainType`]

(string, optional)

Specifies whether the network request is first-party or third-party to the
domain from which it originated. If omitted, all requests are matched.

Supported values:

  * 

firstParty

  * 

thirdParty

  * 

[`excludedInitiatorDomains`]

(array of string, optional)

The rule will not match network requests originating from the list of
‘initiatorDomains’. If the list is empty or omitted, no domains are excluded.
This takes precedence over ‘initiatorDomains’.

  * 

[`excludedRequestDomains`]

(array of string, optional)

The rule will not match network requests when the domains matches one from the
list of ‘excludedRequestDomains’. If the list is empty or omitted, no domains
are excluded. This takes precedence over ‘requestDomains’.

  * 

[`excludedRequestMethods`]

(array of string, optional)

List of request methods which the rule won’t match. Cannot be specified if
‘requestMethods’ is specified. If neither of them is specified, all request
methods are matched.

  * 

[`excludedResourceTypes`]

(array of ResourceType, optional)

List of resource types which the rule won’t match. Cannot be specified if
‘resourceTypes’ is specified. If neither of them is specified, all resource
types except ‘main_frame’ are matched.

  * 

[`excludedTabIds`]

(array of integer, optional)

List of tabIds which the rule should not match. An ID of -1 excludes requests
which don’t originate from a tab. Only supported for session-scoped rules.

  * 

[`initiatorDomains`]

(array of string, optional)

The rule will only match network requests originating from the list of
‘initiatorDomains’. If the list is omitted, the rule is applied to requests
from all domains.

  * 

[`isUrlFilterCaseSensitive`]

(boolean, optional)

Whether ‘urlFilter’ or ‘regexFilter’ is case-sensitive.

  * 

[`regexFilter`]

(string, optional)

Regular expression to match against the network request url. Only one of
‘urlFilter’ or ‘regexFilter’ can be specified.

  * 

[`requestDomains`]

(array of string, optional)

The rule will only match network requests when the domain matches one from the
list of ‘requestDomains’. If the list is omitted, the rule is applied to
requests from all domains.

  * 

[`requestMethods`]

(array of string, optional)

List of HTTP request methods which the rule can match. Should be a lower-case
method such as ‘connect’, ‘delete’, ‘get’, ‘head’, ‘options’, ‘patch’, ‘post’,
‘put’.’

  * 

[`resourceTypes`]

(array of ResourceType, optional)

List of resource types which the rule can match. When the rule action is
‘allowAllRequests’, this must be specified and may only contain ‘main_frame’
or ‘sub_frame’. Cannot be specified if ‘excludedResourceTypes’ is specified.
If neither of them is specified, all resource types except ‘main_frame’ are
matched.

  * 

[`tabIds`]

(array of integer, optional)

List of tabIds which the rule should match. An ID of -1 matches requests which
don’t originate from a tab. Only supported for session-scoped rules.

  * 

[`urlFilter`]

(string, optional)

TODO: link to doc explaining supported pattern. The pattern which is matched
against the network request url. Only one of ‘urlFilter’ or ‘regexFilter’ can
be specified.

  * 

`id`

(integer)

An id which uniquely identifies a rule. Mandatory and should be >= 1.

  * 

[`priority`]

(integer, optional)

Rule priority. Defaults to 1. When specified, should be >= 1

### URLTransform

Describes the type of the Rule.action.redirect.transform property.

object

  * 

[`fragment`]

(string, optional)

The new fragment for the request. Should be either empty, in which case the
existing fragment is cleared; or should begin with ‘#’.

  * 

[`host`]

(string, optional)

The new host name for the request.

  * 

[`password`]

(string, optional)

The new password for the request.

  * 

[`path`]

(string, optional)

The new path for the request. If empty, the existing path is cleared.

  * 

[`port`]

(string, optional)

The new port for the request. If empty, the existing port is cleared.

  * 

[`query`]

(string, optional)

The new query for the request. Should be either empty, in which case the
existing query is cleared; or should begin with ‘?’. Cannot be specified if
‘queryTransform’ is specified.

  * 

[`queryTransform`]

(object, optional)

Add, remove or replace query key-value pairs. Cannot be specified if ‘query’
is specified.

  * 

[`addOrReplaceParams`]

(array of object, optional)

The list of query key-value pairs to be added or replaced.

  * 

[`removeParams`]

(array of string, optional)

The list of query keys to be removed.

  * 

[`scheme`]

(string, optional)

The new scheme for the request.

Supported values:

  * 

http

  * 

https

  * 

moz-extension

  * 

[`username`]

(string, optional)

The new username for the request.

### UnsupportedRegexReason

Describes the reason why a given regular expression isn’t supported.

string

Supported values:

  * 

syntaxError

  * 

memoryLimitExceeded

## Properties

### DYNAMIC_RULESET_ID

Ruleset ID for the dynamic rules added by the extension.

### GUARANTEED_MINIMUM_STATIC_RULES

The minimum number of static rules guaranteed to an extension across its
enabled static rulesets. Any rules above this limit will count towards the
global static rule limit.

### MAX_NUMBER_OF_DISABLED_STATIC_RULES

The maximum number of static rules that can be disabled on each static
ruleset.

### MAX_NUMBER_OF_DYNAMIC_AND_SESSION_RULES

Deprecated property returning the maximum number of dynamic and session rules
an extension can add, replaced by
MAX_NUMBER_OF_DYNAMIC_RULES/MAX_NUMBER_OF_SESSION_RULES.

### MAX_NUMBER_OF_DYNAMIC_RULES

The maximum number of dynamic session rules an extension can add.

### MAX_NUMBER_OF_ENABLED_STATIC_RULESETS

The maximum number of static Rulesets an extension can enable at any one time.

### MAX_NUMBER_OF_REGEX_RULES

The maximum number of regular expression rules that an extension can add. This
limit is evaluated separately for the set of session rules, dynamic rules and
those specified in the rule_resources file.

### MAX_NUMBER_OF_SESSION_RULES

The maximum number of dynamic session rules an extension can add.

### MAX_NUMBER_OF_STATIC_RULESETS

The maximum number of static Rulesets an extension can specify as part of the
rule_resources manifest key.

### SESSION_RULESET_ID

Ruleset ID for the session-scoped rules added by the extension.

