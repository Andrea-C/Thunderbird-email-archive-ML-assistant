≡ On this page

  * Getting started

  * Examples

  * Experiment APIs

  * Changelog

  * Where to get help and more information

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

# WebExtension Documentation for Thunderbird 128

## Getting started

These documents assume you already have some familiarity with the WebExtension
technology. If not, it is highly recommended to start with the following
pages:

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * [Hello world Add-on tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

For any problems or feature requests please [file a
bug](https://bugzilla.mozilla.org/enter_bug.cgi?product=Thunderbird&component=Add-
Ons%3A+Extensions+API).

Hint

In Thunderbird, all WebExtension API can be accessed through the _browser.*_
namespace, as with Firefox, but also through the _messenger.*_ namespace,
which is a better fit for Thunderbird.

Important

WebExtension APIs are asynchronous, that is, they return a
[Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise) object which resolves
when ready. See [Using Promises](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Guide/Using_promises) for more information about
Promises.

The documentation for the APIs listed in the left side panel is generated
automatically from Thunderbird’s schema files. The [webext-
schemas](https://github.com/thunderbird/webext-schemas) repository can be used
to obtain a copy of the relevant files.

Examples

  * [Extracting IMAP accounts](examples/accounts.html)
  * [Working with WebExtension events](examples/eventListeners.html)
  * [Working with message lists](examples/messageLists.html)
  * [Working with vCard contacts](examples/vcard.html)

Experiment APIs

  * [Introduction to Experiment APIs](experiments/introduction.html)
  * [The Experiment API generator](experiments/generator.html)
  * [Using folder and message types](experiments/folders_and_messages.html)
  * [Using tabs and windows](experiments/tabs_and_windows.html)
  * [Getting your API added to Thunderbird](experiments/contribute.html)

Changelog

  * [Changes in Manifest Version 3](changes/esr128.html)

## Where to get help and more information

[Introduction to add-on development](https://developer.thunderbird.net/add-
ons/)

    

Find information about creating and updating extensions for Thunderbird.
Includes getting-started-tutorials and a collection of helpful articles and
guides.

[Add-on developer community](https://developer.thunderbird.net/add-
ons/community)

    

Learn how to get in touch with other Thunderbird add-on developers, to ask
questions and to share knowledge.

[Sample extensions](https://github.com/thunderbird/sample-extensions)

    

A collection of MailExtensions, showing how to use Thunderbird WebExtension
APIs.

[MDN sample extensions](https://github.com/mdn/webextensions-examples)

    

A collection of WebExtensions, showing how to use WebExtension APIs in
Firefox. They probably won’t work directly in Thunderbird, but they may
provide hints on how to use some of the WebExtension APIs that Thunderbird
inherited from Firefox.

[MDN WebExtension documentation](https://developer.mozilla.org/en-
US/docs/Mozilla/Add-ons/WebExtensions)

    

Find general information about the WebExtensions API cross-browser technology
used by Firefox and many Chromium-based browsers. Not all information listed
there apply to Thunderbird.

