# LangChainAdapter


---
url: https://ai-sdk.dev/docs/reference/stream-helpers/langchain-adapter
description: API Reference for LangChainAdapter.
---


# [`LangChainAdapter`](#langchainadapter)


The `LangChainAdapter` module provides helper functions to transform LangChain output streams into data streams and data stream responses. See the [LangChain Adapter documentation](/providers/adapters/langchain) for more information.

It supports:

-   LangChain StringOutputParser streams
-   LangChain AIMessageChunk streams
-   LangChain StreamEvents v2 streams


## [Import](#import)


import { LangChainAdapter } from "ai"


## [API Signature](#api-signature)



### [Methods](#methods)



### toDataStream:


(stream: ReadableStream<LangChainAIMessageChunk> | ReadableStream<string>, AIStreamCallbacksAndOptions) => AIStream

Converts LangChain output streams to data stream.


### toDataStreamResponse:


(stream: ReadableStream<LangChainAIMessageChunk> | ReadableStream<string>, options?: {init?: ResponseInit, data?: StreamData, callbacks?: AIStreamCallbacksAndOptions}) => Response

Converts LangChain output streams to data stream response.


### mergeIntoDataStream:


(stream: ReadableStream<LangChainStreamEvent> | ReadableStream<LangChainAIMessageChunk> | ReadableStream<string>, options: { dataStream: DataStreamWriter; callbacks?: StreamCallbacks }) => void

Merges LangChain output streams into an existing data stream.


## [Examples](#examples)



### [Convert LangChain Expression Language Stream](#convert-langchain-expression-language-stream)


app/api/completion/route.ts

```
import{ChatOpenAI}from'@langchain/openai';import{LangChainAdapter}from'ai';exportasyncfunctionPOST(req: Request){const{ prompt }=await req.json();const model =newChatOpenAI({    model:'gpt-3.5-turbo-0125',    temperature:0,});const stream =await model.stream(prompt);returnLangChainAdapter.toDataStreamResponse(stream);}
```


### [Convert StringOutputParser Stream](#convert-stringoutputparser-stream)


app/api/completion/route.ts

```
import{ChatOpenAI}from'@langchain/openai';import{LangChainAdapter}from'ai';import{StringOutputParser}from'@langchain/core/output_parsers';exportasyncfunctionPOST(req: Request){const{ prompt }=await req.json();const model =newChatOpenAI({    model:'gpt-3.5-turbo-0125',    temperature:0,});const parser =newStringOutputParser();const stream =await model.pipe(parser).stream(prompt);returnLangChainAdapter.toDataStreamResponse(stream);}
```
