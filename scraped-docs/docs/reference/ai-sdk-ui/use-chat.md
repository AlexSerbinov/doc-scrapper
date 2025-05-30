# useChat()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat
description: API reference for the useChat hook.
---


# [`useChat()`](#usechat)


Allows you to easily create a conversational user interface for your chatbot application. It enables the streaming of chat messages from your AI provider, manages the state for chat input, and updates the UI automatically as new messages are received.


## [Import](#import)


React

Svelte

Vue

Solid

import { useChat } from '@ai-sdk/react'


## [API Signature](#api-signature)



### [Parameters](#parameters)



### api?:


string = '/api/chat'

The API endpoint that is called to generate chat responses. It can be a relative path (starting with \`/\`) or an absolute URL.


### id?:


string

An unique identifier for the chat. If not provided, a random one will be generated. When provided, the \`useChat\` hook with the same \`id\` will have shared states across components. This is useful when you have multiple components showing the same chat stream.


### initialInput?:


string = ''

An optional string for the initial prompt input.


### initialMessages?:


Messages\[\] = \[\]

An optional array of initial chat messages


### onToolCall?:


({toolCall: ToolCall}) => void | unknown| Promise<unknown>

Optional callback function that is invoked when a tool call is received. Intended for automatic client-side tool execution. You can optionally return a result for the tool call, either synchronously or asynchronously.


### onResponse?:


(response: Response) => void

An optional callback that will be called with the response from the API endpoint. Useful for throwing customized errors or logging


### onFinish?:


(message: Message, options: OnFinishOptions) => void

An optional callback function that is called when the completion stream ends.

OnFinishOptions


### usage:


CompletionTokenUsage

The token usage for the completion.

CompletionTokenUsage


### promptTokens:


number

The total number of tokens in the prompt.


### completionTokens:


number

The total number of tokens in the completion.


### totalTokens:


number

The total number of tokens generated.


### finishReason:


'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other' | 'unknown'

The reason why the generation ended.


### onError?:


(error: Error) => void

A callback that will be called when the chat stream encounters an error. Optional.


### generateId?:


() => string

A custom id generator for message ids and the chat id. Optional.


### headers?:


Record<string, string> | Headers

Additional headers to be passed to the API endpoint. Optional.


### body?:


any

Additional body object to be passed to the API endpoint. Optional.


### credentials?:


'omit' | 'same-origin' | 'include'

An optional literal that sets the mode of credentials to be used on the request. Defaults to same-origin.


### sendExtraMessageFields?:


boolean

An optional boolean that determines whether to send extra fields you've added to \`messages\`. Defaults to \`false\` and only the \`content\` and \`role\` fields will be sent to the API endpoint. If set to \`true\`, the \`name\`, \`data\`, and \`annotations\` fields will also be sent.


### maxSteps?:


number

Maximum number of backend calls to generate a response. A maximum number is required to prevent infinite loops in the case of misconfigured tools. By default, it is set to 1.


### streamProtocol?:


'text' | 'data'

An optional literal that sets the type of stream to be used. Defaults to \`data\`. If set to \`text\`, the stream will be treated as a text stream.


### fetch?:


FetchFunction

Optional. A custom fetch function to be used for the API call. Defaults to the global fetch function.


### experimental\_prepareRequestBody?:


(options: { messages: UIMessage\[\]; requestData?: JSONValue; requestBody?: object, id: string }) => unknown

Experimental (React, Solid & Vue only). When a function is provided, it will be used to prepare the request body for the chat API. This can be useful for customizing the request body based on the messages and data in the chat.


### experimental\_throttle?:


number

React only. Custom throttle wait time in milliseconds for the message and data updates. When specified, updates will be throttled using this interval. Defaults to undefined (no throttling).


### [Returns](#returns)



### messages:


UIMessage\[\]

The current array of chat messages.

UIMessage


### id:


string

The unique identifier of the message.


### role:


'system' | 'user' | 'assistant' | 'data'

The role of the message.


### createdAt?:


Date

The creation date of the message.


### content:


string

The content of the message.


### annotations?:


Array<JSONValue>

Additional annotations sent along with the message.


### parts:


Array<TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart | StepStartUIPart>

An array of message parts that are associated with the message.

TextUIPart


### type:


"text"


### text:


string

The text content of the part.

ReasoningUIPart


### type:


"reasoning"


### reasoning:


string

The reasoning content of the part.

ToolInvocationUIPart


### type:


"tool-invocation"


### toolInvocation:


ToolInvocation

ToolInvocation


### state:


'partial-call'

The state of the tool call when it was partially created.


### toolCallId:


string

ID of the tool call. This ID is used to match the tool call with the tool result.


### toolName:


string

Name of the tool that is being called.


### args:


any

Partial arguments of the tool call. This is a JSON-serializable object.

ToolInvocation


### state:


'call'

The state of the tool call when it was fully created.


### toolCallId:


string

ID of the tool call. This ID is used to match the tool call with the tool result.


### toolName:


string

Name of the tool that is being called.


### args:


any

Arguments of the tool call. This is a JSON-serializable object that matches the tools input schema.

ToolInvocation


### state:


'result'

The state of the tool call when the result is available.


### toolCallId:


string

ID of the tool call. This ID is used to match the tool call with the tool result.


### toolName:


string

Name of the tool that is being called.


### args:


any

Arguments of the tool call. This is a JSON-serializable object that matches the tools input schema.


### result:


any

The result of the tool call.

SourceUIPart


### type:


"source"


### source:


Source

Source


### sourceType:


'url'

The type of the source.


### id:


string

ID of the source.


### url:


string

URL of the source.


### title?:


string

The title of the source.

StepStartUIPart


### type:


"step-start"


### experimental\_attachments?:


Array<Attachment>

Additional attachments sent along with the message.

Attachment


### name?:


string

The name of the attachment, usually the file name.


### contentType?:


string

A string indicating the media type of the file.


### url:


string

The URL of the attachment. It can either be a URL to a hosted file or a Data URL.


### error:


Error | undefined

An error object returned by SWR, if any.


### append:


(message: Message | CreateMessage, options?: ChatRequestOptions) => Promise<string | undefined>

Function to append a message to the chat, triggering an API call for the AI response. It returns a promise that resolves to full response message content when the API call is successfully finished, or throws an error when the API call fails.

ChatRequestOptions


### headers:


Record<string, string> | Headers

Additional headers that should be to be passed to the API endpoint.


### body:


object

Additional body JSON properties that should be sent to the API endpoint.


### data:


JSONValue

Additional data to be sent to the API endpoint.


### experimental\_attachments?:


FileList | Array<Attachment>

An array of attachments to be sent to the API endpoint.

FileList

A list of files that have been selected by the user using an <input type='file'> element. It's also used for a list of files dropped into web content when using the drag and drop API.

Attachment


### name?:


string

The name of the attachment, usually the file name.


### contentType?:


string

A string indicating the media type of the file.


### url:


string

The URL of the attachment. It can either be a URL to a hosted file or a Data URL.


### reload:


(options?: ChatRequestOptions) => Promise<string | undefined>

Function to reload the last AI chat response for the given chat history. If the last message isn't from the assistant, it will request the API to generate a new response.

ChatRequestOptions


### headers:


Record<string, string> | Headers

Additional headers that should be to be passed to the API endpoint.


### body:


object

Additional body JSON properties that should be sent to the API endpoint.


### data:


JSONValue

Additional data to be sent to the API endpoint.


### stop:


() => void

Function to abort the current API request.


### experimental\_resume:


() => void

Function to resume an ongoing chat generation stream.


### setMessages:


(messages: Message\[\] | ((messages: Message\[\]) => Message\[\]) => void

Function to update the \`messages\` state locally without triggering an API call.


### input:


string

The current value of the input field.


### setInput:


React.Dispatch<React.SetStateAction<string>>

Function to update the \`input\` value.


### handleInputChange:


(event: any) => void

Handler for the \`onChange\` event of the input field to control the input's value.


### handleSubmit:


(event?: { preventDefault?: () => void }, options?: ChatRequestOptions) => void

Form submission handler that automatically resets the input field and appends a user message. You can use the \`options\` parameter to send additional data, headers and more to the server.

ChatRequestOptions


### headers:


Record<string, string> | Headers

Additional headers that should be to be passed to the API endpoint.


### body:


object

Additional body JSON properties that should be sent to the API endpoint.


### data:


JSONValue

Additional data to be sent to the API endpoint.


### allowEmptySubmit?:


boolean

A boolean that determines whether to allow submitting an empty input that triggers a generation. Defaults to \`false\`.


### experimental\_attachments?:


FileList | Array<Attachment>

An array of attachments to be sent to the API endpoint.

FileList

A list of files that have been selected by the user using an <input type='file'> element. It's also used for a list of files dropped into web content when using the drag and drop API.

Attachment


### name?:


string

The name of the attachment, usually the file name.


### contentType?:


string

A string indicating the media type of the file.


### url:


string

The URL of the attachment. It can either be a URL to a hosted file or a Data URL.


### status:


"submitted" | "streaming" | "ready" | "error"

Status of the chat request: submitted (message sent to API), streaming (receiving response chunks), ready (response complete), or error (request failed).


### id:


string

The unique identifier of the chat.


### data:


JSONValue\[\]

Data returned from StreamData.


### setData:


(data: JSONValue\[\] | undefined | ((data: JSONValue\[\] | undefined) => JSONValue\[\] | undefined)) => void

Function to update the \`data\` state which contains data from StreamData.


### addToolResult:


({toolCallId: string; result: any;}) => void

Function to add a tool result to the chat. This will update the chat messages with the tool result and call the API route if all tool results for the last message are available.


## [Learn more](#learn-more)


-   [Chatbot](/docs/ai-sdk-ui/chatbot)
-   [Chatbot with Tools](/docs/ai-sdk-ui/chatbot-with-tool-calling)
