# AI SDK UI


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-ui
description: Reference documentation for the AI SDK UI
---


# [AI SDK UI](#ai-sdk-ui)


[AI SDK UI](/docs/ai-sdk-ui) is designed to help you build interactive chat, completion, and assistant applications with ease. It is framework-agnostic toolkit, streamlining the integration of advanced AI functionalities into your applications.

AI SDK UI contains the following hooks:

[

useChat

Use a hook to interact with language models in a chat interface.

](/docs/reference/ai-sdk-ui/use-chat)[

useCompletion

Use a hook to interact with language models in a completion interface.

](/docs/reference/ai-sdk-ui/use-completion)[

useObject

Use a hook for consuming a streamed JSON objects.

](/docs/reference/ai-sdk-ui/use-object)[

useAssistant

Use a hook to interact with OpenAI assistants.

](/docs/reference/ai-sdk-ui/use-assistant)[

convertToCoreMessages

Convert useChat messages to CoreMessages for AI core functions.

](/docs/reference/ai-sdk-ui/convert-to-core-messages)[

appendResponseMessages

Append CoreMessage\[\] from an AI response to an existing array of UI messages.

](/docs/reference/ai-sdk-ui/append-response-messages)[

appendClientMessage

Append a client message to an existing array of UI messages.

](/docs/reference/ai-sdk-ui/append-client-message)[

createDataStream

Create a data stream to stream additional data to the client.

](/docs/reference/ai-sdk-ui/create-data-stream)[

createDataStreamResponse

Create a response object to stream additional data to the client.

](/docs/reference/ai-sdk-ui/create-data-stream-response)[

pipeDataStreamToResponse

Pipe a data stream to a Node.js ServerResponse object.

](/docs/reference/ai-sdk-ui/pipe-data-stream-to-response)[

streamData

Stream additional data to the client along with generations.

](/docs/reference/ai-sdk-ui/stream-data)

It also contains the following helper functions:

[

AssistantResponse

Streaming helper for assistant responses.

](/docs/reference/ai-sdk-ui/assistant-response)


## [UI Framework Support](#ui-framework-support)


AI SDK UI supports the following frameworks: [React](https://react.dev/), [Svelte](https://svelte.dev/), [Vue.js](https://vuejs.org/), and [SolidJS](https://www.solidjs.com/) (deprecated). Here is a comparison of the supported functions across these frameworks:

Function

React

Svelte

Vue.js

SolidJS (deprecated)

[useChat](/docs/reference/ai-sdk-ui/use-chat)

Chat

[useCompletion](/docs/reference/ai-sdk-ui/use-completion)

Completion

[useObject](/docs/reference/ai-sdk-ui/use-object)

StructuredObject

[useAssistant](/docs/reference/ai-sdk-ui/use-assistant)

[Contributions](https://github.com/vercel/ai/blob/main/CONTRIBUTING.md) are welcome to implement missing features for non-React frameworks.
