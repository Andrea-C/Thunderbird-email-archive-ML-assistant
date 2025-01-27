≡ addressBooks.provider API

  * Permissions

  * Events

≡ Add-on developer resources

  * [Introduction to add-on development](https://developer.thunderbird.net/add-ons/about-add-ons)

  * ["Hello world" extension tutorial](https://developer.thunderbird.net/add-ons/hello-world-add-on)

  * [Developer community](https://developer.thunderbird.net/add-ons/community)

  * [Sample extensions (Github)](https://github.com/thunderbird/sample-extensions)

  * [Using Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

  * [Additional resources on DTN](https://developer.thunderbird.net/add-ons/resources)

≡ Related information

  * [Working with vCard contacts](examples/vcard.html)

  * [Working with WebExtension events](examples/eventListeners.html)

# addressBooks.provider API

The address book provider API allows to add address books, which are not
stored or cached by Thunderbird itself, but are handled completely by the
extension. Address books created by the this API will forward all access
requests to the WebExtension. Possible use cases:

  * implement a custom storage

  * implement search-only address books querying a remote server

So far, only the API for search-only address books is implemented.

Warning

This API will change in future releases of Thunderbird.

## Permissions

  * 

addressBooks

Read and modify your address books and contacts

  * 

sensitiveDataUpload

Transfer sensitive user data (if access has been granted) to a remote server
for further processing

Note

The permission addressBooks is required to use
`messenger.addressBooks.provider.*`.

## Events

### onSearchRequest

Registering this listener will create and list a read-only address book in
Thunderbird’s address book window, similar to LDAP address books. When
selecting this address book, users will first see no contacts, but they can
search for them, which will fire this event. Contacts returned by the listener
callback will be displayed as contact cards in the address book. Several
listeners can be registered, to create multiple address books.

The event also fires for each registered listener (for each created read-only
address book), when users type something into the mail composer’s _To:_ field,
or into similar fields like the calendar meeting attendees field. Contacts
returned by the listener callback will be added to the autocomplete results in
the dropdown of that field.

Example:

    
    
    messenger.addressBooks.provider.onSearchRequest.addListener(async (node, searchString, query) => {
        let response = await fetch("https://people.acme.com/?query=" + searchString);
        let json = await response.json();
        return {
            isCompleteResult: true,
            // Return an array of ContactProperties as results.
            results: json.map(contact => ({
                DisplayName: contact.name,
                PrimaryEmail: contact.email
            }))
        };
        
    }, {
        addressBookName: "ACME employees",
        isSecure: true,
    });
    

Parameters for onSearchRequest.addListener(listener, parameters)

  * 

`listener(node, searchString, query)`

A function that will be called when this event occurs.

  * 

`parameters`

(object)

Descriptions for the address book created by registering this listener.

  * 

[`addressBookName`]

(string, optional)

The name of the created address book.

  * 

[`id`]

(string, optional)

The unique ID of the created address book. If several listeners have been
added, the id allows to identify which address book initiated the search
request. If not provided, a unique ID will be generated for you.

  * 

[`isSecure`]

(boolean, optional)

Whether the address book search queries are using encrypted protocols like
HTTPS.

Parameters passed to the listener function

  * 

`node`

([AddressBookNode](addressBooks.html#addressbooks-addressbooknode))

  * 

[`searchString`]

(string, optional)

The search text that the user entered. Not available when invoked from the
advanced address book search dialog.

  * 

[`query`]

(string, optional)

The boolean query expression corresponding to the search. **Note:** This
parameter may change in future releases of Thunderbird.

Expected return value of the listener function

  * 

object

  * 

`isCompleteResult`

(boolean)

  * 

`results`

(array of contacts.ContactProperties)

Required permissions

  * addressBooks

