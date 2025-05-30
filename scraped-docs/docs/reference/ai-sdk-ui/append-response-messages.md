# appendResponseMessages()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-ui/append-response-messages
description: Appends ResponseMessage[] from an AI response to an existing array of UI messages, generating timestamps and reusing IDs for useChat (API Reference)
---


# [`appendResponseMessages()`](#appendresponsemessages)


Appends an array of ResponseMessage objects (from the AI response) to an existing array of UI messages. It reuses the existing IDs from the response messages, generates new timestamps, and merges tool-call results with the previous assistant message (if any). This is useful for maintaining a unified message history when working with AI responses in a client-side chat application.


## [Import](#import)


import { appendResponseMessages } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### messages:


Message\[\]

An existing array of UI messages for useChat (usually from state).


### responseMessages:


ResponseMessage\[\]

The new array of AI messages returned from the AI service to be appended. For example, "assistant" messages get added as new items, while tool-call results (role: "tool") are merged with the previous assistant message.


### [Returns](#returns)


An updated array of Message objects.


### Message\[\]:


Array

A new array of UI messages with the appended AI response messages (and updated tool-call results for the preceding assistant message).
