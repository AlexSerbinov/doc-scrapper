# useAssistant()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-assistant
description: API reference for the useAssistant hook.
---


# [`useAssistant()`](#useassistant)


Allows you to handle the client state when interacting with an OpenAI compatible assistant API. This hook is useful when you want to integrate assistant capabilities into your application, with the UI updated automatically as the assistant is streaming its execution.

This works in conjunction with [`AssistantResponse`](./assistant-response) in the backend.


## [Import](#import)


React

Svelte

import { useAssistant } from '@ai-sdk/react'


## [API Signature](#api-signature)



### [Parameters](#parameters)



### api:


string

The API endpoint that accepts a threadId and message object and returns an AssistantResponse stream. It can be a relative path (starting with \`/\`) or an absolute URL.


### threadId?:


string | undefined

Represents the ID of an existing thread. If not provided, a new thread will be created.


### credentials?:


'omit' | 'same-origin' | 'include' = 'same-origin'

Sets the mode of credentials to be used on the request.


### headers?:


Record<string, string> | Headers

Headers to be passed to the API endpoint.


### body?:


any

Additional body to be passed to the API endpoint.


### onError?:


(error: Error) => void

Callback that will be called when the assistant encounters an error


### fetch?:


FetchFunction

Optional. A custom fetch function to be used for the API call. Defaults to the global fetch function.


### [Returns](#returns)



### messages:


Message\[\]

The current array of chat messages.


### setMessages:


React.Dispatch<React.SetStateAction<Message>>

Function to update the \`messages\` array.


### threadId:


string | undefined

The current thread ID.


### setThreadId:


(threadId: string | undefined) => void

Set the current thread ID. Specifying a thread ID will switch to that thread, if it exists. If set to 'undefined', a new thread will be created. For both cases, \`threadId\` will be updated with the new value and \`messages\` will be cleared.


### input:


string

The current value of the input field.


### setInput:


React.Dispatch<React.SetStateAction<string>>

Function to update the \`input\` value.


### handleInputChange:


(event: any) => void

Handler for the \`onChange\` event of the input field to control the input's value.


### submitMessage:


(event?: { preventDefault?: () => void }) => void

Form submission handler that automatically resets the input field and appends a user message.


### status:


'awaiting\_message' | 'in\_progress'

The current status of the assistant. This can be used to show a loading indicator.


### append:


(message: Message | CreateMessage, chatRequestOptions: { options: { headers, body } }) => Promise<string | undefined>

Function to append a user message to the current thread. This triggers the API call to fetch the assistant's response.


### stop:


() => void

Function to abort the current request from streaming the assistant response. Note that the run will still be in progress.


### error:


undefined | Error

The error thrown during the assistant message processing, if any.
