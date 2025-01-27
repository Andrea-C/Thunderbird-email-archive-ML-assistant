≡ i18n API

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

# i18n API

Use the browser.i18n infrastructure to implement internationalization across
your whole app or extension.

## Manifest file properties

  * 

[`default_locale`]

(string, optional)

  * 

[`l10n_resources`]

(array of string, optional)

## Functions

### detectLanguage(text)

Detects the language of the provided text using CLD.

Parameters

  * 

`text`

(string)

User input string to be translated.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

object

LanguageDetectionResult object that holds detected langugae reliability and
array of DetectedLanguage

  * 

`isReliable`

(boolean)

CLD detected language reliability

  * 

`languages`

(array of object)

array of detectedLanguage

### getAcceptLanguages()

Gets the accept-languages of the browser. This is different from the locale
used by the browser; to get the locale, use getUILanguage().

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

array of LanguageCode

Array of LanguageCode

### getMessage(messageName, [substitutions])

Gets the localized string for the specified message. If the message is
missing, this method returns an empty string (‘’). If the format of the
getMessage() call is wrong — for example, _messageName_ is not a string or the
_substitutions_ array has more than 9 elements — this method returns
undefined.

Parameters

  * 

`messageName`

(string)

The name of the message, as specified in the
$(topic:i18n-messages)[messages.json] file.

  * 

[`substitutions`]

(any, optional)

Substitution strings, if the message requires any.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

Message localized for current locale.

### getUILanguage()

Gets the browser UI language of the browser. This is different from
getAcceptLanguages() which returns the preferred user languages.

Return type ([Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise))

  * 

string

The browser UI language code such as en-US or fr-FR.

## Events

## Types

### LanguageCode

An ISO language code such as en or fr. For a complete list of languages
supported by this method, see
[kLanguageInfoTable](http://src.chromium.org/viewvc/chrome/trunk/src/third_party/cld/languages/internal/languages.cc).
For an unknown language, und will be returned, which means that [percentage]
of the text is unknown to CLD

string

