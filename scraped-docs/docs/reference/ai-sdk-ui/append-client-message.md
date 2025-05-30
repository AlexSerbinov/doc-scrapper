# appendClientMessage()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-ui/append-client-message
description: Appends or updates a client Message to an existing array of UI messages for useChat (API Reference)
---


# [`appendClientMessage()`](#appendclientmessage)


Appends a client Message object to an existing array of UI messages. If the last message in the array has the same ID as the new message, it will replace the existing message instead of appending. This is useful for maintaining a unified message history in a client-side chat application, especially when updating existing messages.


## [Import](#import)


import { appendClientMessage } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### messages:


Message\[\]

An existing array of UI messages for useChat (usually from state).


### message:


Message

The new client message to be appended or used to replace an existing message with the same ID.


### [Returns](#returns)



### Message\[\]:


Array

A new array of UI messages with either the appended message or the updated message replacing the previous one with the same ID.
