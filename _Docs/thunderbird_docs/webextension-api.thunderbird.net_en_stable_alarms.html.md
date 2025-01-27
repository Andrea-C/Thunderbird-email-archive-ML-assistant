≡ alarms API

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

# alarms API

Note

The permission alarms is required to use `messenger.alarms.*`.

## Functions

### clear([name])

Clears the alarm with the given name.

Parameters

  * 

[`name`]

(string, optional)

The name of the alarm to clear. Defaults to the empty string.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

boolean

Whether an alarm of the given name was found to clear.

Required permissions

  * alarms

### clearAll()

Clears all alarms.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

boolean

Whether any alarm was found to clear.

Required permissions

  * alarms

### create([name], alarmInfo)

Creates an alarm. After the delay is expired, the onAlarm event is fired. If
there is another alarm with the same name (or no name if none is specified),
it will be cancelled and replaced by this alarm.

Parameters

  * 

[`name`]

(string, optional)

Optional name to identify this alarm. Defaults to the empty string.

  * 

`alarmInfo`

(object)

Details about the alarm. The alarm first fires either at ‘when’ milliseconds
past the epoch (if ‘when’ is provided), after ‘delayInMinutes’ minutes from
the current time (if ‘delayInMinutes’ is provided instead), or after
‘periodInMinutes’ minutes from the current time (if only ‘periodInMinutes’ is
provided). Users should never provide both ‘when’ and ‘delayInMinutes’. If
‘periodInMinutes’ is provided, then the alarm recurs repeatedly after that
many minutes.

  * 

[`delayInMinutes`]

(number, optional)

Number of minutes from the current time after which the alarm should first
fire.

  * 

[`periodInMinutes`]

(number, optional)

Number of minutes after which the alarm should recur repeatedly.

  * 

[`when`]

(number, optional)

Time when the alarm is scheduled to first fire, in milliseconds past the
epoch.

Required permissions

  * alarms

### get([name])

Retrieves details about the specified alarm.

Parameters

  * 

[`name`]

(string, optional)

The name of the alarm to get. Defaults to the empty string.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

Alarm

Required permissions

  * alarms

### getAll()

Gets an array of all the alarms.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of Alarm

Required permissions

  * alarms

## Events

### onAlarm

Fired when an alarm has expired. Useful for transient background pages.

Parameters for onAlarm.addListener(listener)

  * 

`listener(name)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`name`

(Alarm)

The alarm that has expired.

Required permissions

  * alarms

## Types

### Alarm

object

  * 

`name`

(string)

Name of this alarm.

  * 

`scheduledTime`

(number)

Time when the alarm is scheduled to fire, in milliseconds past the epoch.

  * 

[`periodInMinutes`]

(number, optional)

When present, signals that the alarm triggers periodically after so many
minutes.

