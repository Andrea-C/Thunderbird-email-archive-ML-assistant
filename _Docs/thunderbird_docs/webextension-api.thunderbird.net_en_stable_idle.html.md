≡ idle API

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

# idle API

Use the browser.idle API to detect when the machine’s idle state changes.

Note

The permission idle is required to use `messenger.idle.*`.

## Functions

### queryState(detectionIntervalInSeconds)

Returns “idle” if the user has not generated any input for a specified number
of seconds, or “active” otherwise.

Parameters

  * 

`detectionIntervalInSeconds`

(integer)

The system is considered idle if detectionIntervalInSeconds seconds have
elapsed since the last user input detected.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

IdleState

Required permissions

  * idle

### setDetectionInterval(intervalInSeconds)

Sets the interval, in seconds, used to determine when the system is in an idle
state for onStateChanged events. The default interval is 60 seconds.

Parameters

  * 

`intervalInSeconds`

(integer)

Threshold, in seconds, used to determine when the system is in an idle state.

Required permissions

  * idle

## Events

### onStateChanged

Fired when the system changes to an active or idle state. The event fires with
“idle” if the the user has not generated any input for a specified number of
seconds, and “active” when the user generates input on an idle system.

Parameters for onStateChanged.addListener(listener)

  * 

`listener(newState)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`newState`

(IdleState)

Required permissions

  * idle

## Types

### IdleState

string

Supported values:

  * 

active

  * 

idle

