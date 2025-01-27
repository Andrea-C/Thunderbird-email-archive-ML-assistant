≡ commands API

  * Manifest file properties

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

# commands API

The commands API is more or less the same as the [Firefox commands
API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/API/commands) and allows to define key shortcuts to trigger
certain actions.

Use the commands API to add keyboard shortcuts that trigger actions in your
extension, for example opening one of the action popups or sending a command
to the extension.

## Manifest file properties

  * 

[`commands`]

(object, optional)

A _dictionary object_ defining one or more commands as _name-value_ pairs, the
_name_ being the name of the command and the _value_ being a CommandsShortcut.
The _name_ may also be one of the following built-in special shortcuts:

>   * _execute_action
>
>   * _execute_compose_action
>
>   * _execute_message_display_action
>
>

Example:

    
    
    "commands": {
      "toggle-feature": {
        "suggested_key": {
          "default": "Ctrl+Shift+Y",
          "linux": "Ctrl+Shift+U"
        },
        "description": "Send a 'toggle-feature' event"
      },
      "_execute_compose_action": {
        "suggested_key": {
          "default": "Alt+F5"
        },
        "description": "Open the compose action popup"
      }
    }
    

Note

A manifest entry named commands is required to use `messenger.commands.*`.

## Functions

### getAll()

Returns all the registered extension commands for this extension and their
shortcut (if active).

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of Command

### reset(name)

Reset a command’s details to what is specified in the manifest.

Parameters

  * 

`name`

(string)

The name of the command.

### update(detail)

Update the details of an already defined command.

Parameters

  * 

`detail`

(object)

The new details for the command.

  * 

`name`

(string)

The name of the command.

  * 

[`description`]

(string, optional)

The description for the command.

  * 

[`shortcut`]

(string, optional)

An empty string to clear the shortcut, or a string matching the format defined
by the [MDN page of the commands API](https://developer.mozilla.org/en-
US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/commands#shortcut_values)
to set a new shortcut key. If the string does not match this format, the
function throws an error.

## Events

### onChanged

Fired when a registered command’s shortcut is changed.

Parameters for onChanged.addListener(listener)

  * 

`listener(changeInfo)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`changeInfo`

(object)

  * 

`name`

(string)

The name of the shortcut.

  * 

`newShortcut`

(string)

The new shortcut active for this command, or blank if not active.

  * 

`oldShortcut`

(string)

The old shortcut which is no longer active for this command, or blank if the
shortcut was previously inactive.

### onCommand

Fired when a registered command is activated using a keyboard shortcut. This
is a user input event handler. For asynchronous listeners some
[restrictions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/User_actions) apply.

Parameters for onCommand.addListener(listener)

  * 

`listener(command, tab)`

A function that will be called when this event occurs.

Parameters passed to the listener function

  * 

`command`

(string)

  * 

`tab`

([Tab](tabs.html#tabs-tab))

– [Added in TB 106]

The details of the active tab while the command occurred.

## Types

### Command

object

  * 

[`description`]

(string, optional)

The Extension Command description

  * 

[`name`]

(string, optional)

The name of the Extension Command

  * 

[`shortcut`]

(string, optional)

The shortcut active for this command, or blank if not active.

### CommandsShortcut

object

  * 

[`description`]

(string, optional)

  * 

[`suggested_key`]

(object, optional)

  * 

[`default`]

(KeyName, optional)

Default key combination.

  * 

[`linux`]

(KeyName, optional)

Key combination on Linux.

  * 

[`mac`]

(KeyName, optional)

Key combination on Mac.

  * 

[`windows`]

(KeyName, optional)

Key combination on Windows.

### KeyName

Definition of a shortcut, for example Alt+F5. The string must match the
shortcut format as defined by the [MDN page of the commands
API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-
ons/WebExtensions/manifest.json/commands#shortcut_values).

string

