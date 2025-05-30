# MistralStream


---
url: https://ai-sdk.dev/docs/reference/stream-helpers/mistral-stream
description: Learn to use MistralStream helper function in your application.
---


# [`MistralStream`](#mistralstream)


MistralStream has been removed in AI SDK 4.0.

MistralStream is part of the legacy Mistral integration. It is not compatible with the AI SDK 3.1 functions. It is recommended to use the [AI SDK Mistral Provider](/providers/ai-sdk-providers/mistral) instead.

Transforms the output from Mistral's language models into a ReadableStream.

This works with the official Mistral API, and it's supported in both Node.js, the Edge Runtime, and browser environments.


## [Import](#import)



### [React](#react)


import { MistralStream } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### response:


Response

The response object returned by a call made by the Provider SDK.


### callbacks?:


AIStreamCallbacksAndOptions

An object containing callback functions to handle the start, each token, and completion of the AI response. In the absence of this parameter, default behavior is implemented.

AIStreamCallbacksAndOptions


### onStart:


() => Promise<void>

An optional function that is called at the start of the stream processing.


### onCompletion:


(completion: string) => Promise<void>

An optional function that is called for every completion. It's passed the completion as a string.


### onFinal:


(completion: string) => Promise<void>

An optional function that is called once when the stream is closed with the final completion message.


### onToken:


(token: string) => Promise<void>

An optional function that is called for each token in the stream. It's passed the token as a string.


### [Returns](#returns)


A `ReadableStream`.
