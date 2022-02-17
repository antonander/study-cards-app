# Study Cards App

This is the API for a Study Flash Cards app. Each user can have any number of decks, each deck can have any number or cards, and each card has two sides. The front side has the question or prompt, the back side has the answer. Both sides can optionally have an image attached.

## Endpoints

These are the endpoints available in the application. All of them require the user to be authenticated (except for the request to upload a file). Look at the bottom to see how to authenticate using Postman.

### Decks

#### GET /decks

Gets all decks for the user making the request. 

#### POST /decks

To create a new deck for that given user. Takes the following payload:

```json
{
  "name": "My first deck"
}
```

There is only one field (`name`) and it is mandatory.

Calling the endpoint will generate a new deck with the following structure:

* `deckId` (string) - a unique id for an item
* `userId` (string) - the id of the user making the request
* `createdAt` (timestamp) - timestamp of when the item was created
* `done` (boolean) - default to false, shows if the deck has been completed (studied)
* `name` (string) - the name of the deck

#### PATCH /decks/{deckId}

The update the given deck. It takes the following payload:

```json
{
  "name": "My first deck",
  "done": true
}
```

Both fields, `name` and `done` are mandatory.

Success will return empty body and status 200.

#### DELETE /decks/{deckId}

Deletes deck stated and all the cards (and their attachments) inside. 

Success will return empty body and status 204.

### Cards

#### GET /decks/{deckId}/cards/

Gets all cards for the deck given.

#### POST /decks/{deckId}/cards/

To create a new card for that given deck. It takes the following payload:

```json
{
	"frontside": {
        "description":"How much is 2 x 2?"
    },
    "backside": {
        "description":"Four... maybe"
    }
}
```

Both fields (`frontside.description` and `backside.description`) are mandatory.

Calling the endpoint will generate a new deck with the following structure:

* `cardId` (string) - a unique id for an item
* `deckId` (string) - the id of the deck to which the card belongs to
* `userId` (string) - the id of the user making the request
* `createdAt` (timestamp) - timestamp of when the item was created
* `frontside` (object) - holds the information for the front side of the card
  * `description` (string) - the text for the front side of the card
  * `attachmentUrl` (string) - url of the optional attachment for the front side of the card
* `backside` (object) - holds the information for the back side of the card
  * `description` (string) - the text for the back side of the card
  * `attachmentUrl` (string) - url of the optional attachment for the back side of the card


#### PATCH /decks/{deckId}/cards/{cardId}

The update the card given. It takes the following payload:

```json
{
	"backside": {
        "description":"Who is Spain's Prime Minister?"
    },
	"frontside": {
        "description":"Pedro Sánchez"
    }
}
```

Either `backside.description` or `frontside.description` must be present.

Success will return empty body and status 200.

#### POST /decks/{deckId}/cards/{cardId}/attachment?side={side}

To add an attachment to any side of the card. The `side` is sent as a query parameter, it should either be `frontside` or `backside`.

No payload is needed.

Success will return a valid `uploadUrl` with a status 200.

#### PUT `uploadUrl`

To upload the file. This is the only endpoint that does not need auth.

The payload is the file to upload. 

Success will return empty body and status 200.


#### DELETE /decks/{deckId}/cards/{cardId}

Deletes the card given and all the attachments it has.

Success will return empty body and status 204.


## Authentication and testing in Postman

To actually test the program, you will have to import the collection provided. Since this is only the backend of the application, you will need to integrate OAuth2.0 within Postman. I've done it following the instrustions here: https://auth0.com/blog/manage-a-collection-of-secure-api-endpoints-with-postman/#Authorization-in-Postman

To get an OAuth 2.0 token you will have to:

1. Import the collection included in this repo in Postman.
2. Click the collection to edit it and, in the 'Authorization' tab, click on the button 'Get New Access Token'.
3. Login when prompted to do so.
4. In the dialog that opens afterwards, click on 'Use token'.
5. Now, just make sure that, **all requests** (except for the one to upload the file), use this token as Bearer (see the Authorization tab of every request in the collection).
