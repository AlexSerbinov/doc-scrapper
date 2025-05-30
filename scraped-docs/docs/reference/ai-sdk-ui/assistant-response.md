# AssistantResponse


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-ui/assistant-response
description: API reference for the AssistantResponse streaming helper.
---


# [`AssistantResponse`](#assistantresponse)


The AssistantResponse class is designed to facilitate streaming assistant responses to the [`useAssistant`](/docs/reference/ai-sdk-ui/use-assistant) hook. It receives an assistant thread and a current message, and can send messages and data messages to the client.


## [Import](#import)


import { AssistantResponse } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### settings:


Settings

You can pass the id of thread and the latest message which helps establish the context for the response.

Settings


### threadId:


string

The thread ID that the response is associated with.


### messageId:


string

The id of the latest message the response is associated with.


### process:


AssistantResponseCallback

A callback in which you can run the assistant on threads, and send messages and data messages to the client.

AssistantResponseCallback


### forwardStream:


(stream: AssistantStream) => Run | undefined

Forwards the assistant response stream to the client. Returns the Run object after it completes, or when it requires an action.


### sendDataMessage:


(message: DataMessage) => void

Send a data message to the client. You can use this to provide information for rendering custom UIs while the assistant is processing the thread.
