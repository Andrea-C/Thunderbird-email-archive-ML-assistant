≡ clipboard API

  * Functions

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

# clipboard API

Offers the ability to write to the clipboard. Reading is not supported because
the clipboard can already be read through the standard web platform APIs.

Note

The permission clipboardWrite is required to use `messenger.clipboard.*`.

## Functions

### setImageData(imageData, imageType)

Copy an image to the clipboard. The image is re-encoded before it is written
to the clipboard. If the image is invalid, the clipboard is not modified.

Parameters

  * 

`imageData`

([ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBuffer))

The image data to be copied.

  * 

`imageType`

(string)

The type of imageData.

Supported values:

  * 

jpeg

  * 

png

Required permissions

  * clipboardWrite

