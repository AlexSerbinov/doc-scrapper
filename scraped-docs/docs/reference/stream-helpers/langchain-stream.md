# LangChainStream


---
url: https://ai-sdk.dev/docs/reference/stream-helpers/langchain-stream
description: API Reference for LangChainStream.
---


# [`LangChainStream`](#langchainstream)


LangChainStream has been removed in AI SDK 4.0.

LangChainStream is part of the legacy LangChain integration. It is recommended to use the [LangChain Adapter](/providers/adapters/langchain) instead.

Helps with the integration of LangChain. It is compatible with useChat and useCompletion.


## [Import](#import)


import { LangChainStream } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



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



### stream:


ReadableStream

This is the readable stream that can be piped into another stream. This stream contains the results of the LangChain process.


### handlers:


LangChainCallbacks

This object contains handlers that can be used to handle certain callbacks provided by LangChain.
