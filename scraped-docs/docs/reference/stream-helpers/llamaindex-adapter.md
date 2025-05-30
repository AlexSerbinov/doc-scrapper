# LlamaIndexAdapter


---
url: https://ai-sdk.dev/docs/reference/stream-helpers/llamaindex-adapter
description: API Reference for LlamaIndexAdapter.
---


# [`LlamaIndexAdapter`](#llamaindexadapter)


The `LlamaIndexAdapter` module provides helper functions to transform LlamaIndex output streams into data streams and data stream responses. See the [LlamaIndex Adapter documentation](/providers/adapters/llamaindex) for more information.

It supports:

-   LlamaIndex ChatEngine streams
-   LlamaIndex QueryEngine streams


## [Import](#import)


import { LlamaIndexAdapter } from "ai"


## [API Signature](#api-signature)



### [Methods](#methods)



### toDataStream:


(stream: AsyncIterable<EngineResponse>, AIStreamCallbacksAndOptions) => AIStream

Converts LlamaIndex output streams to data stream.


### toDataStreamResponse:


(stream: AsyncIterable<EngineResponse>, options?: {init?: ResponseInit, data?: StreamData, callbacks?: AIStreamCallbacksAndOptions}) => Response

Converts LlamaIndex output streams to data stream response.


### mergeIntoDataStream:


(stream: AsyncIterable<EngineResponse>, options: { dataStream: DataStreamWriter; callbacks?: StreamCallbacks }) => void

Merges LlamaIndex output streams into an existing data stream.


## [Examples](#examples)



### [Convert LlamaIndex ChatEngine Stream](#convert-llamaindex-chatengine-stream)


app/api/completion/route.ts

```
import{OpenAI,SimpleChatEngine}from'llamaindex';import{LlamaIndexAdapter}from'ai';exportasyncfunctionPOST(req: Request){const{ prompt }=await req.json();const llm =newOpenAI({ model:'gpt-4o'});const chatEngine =newSimpleChatEngine({ llm });const stream =await chatEngine.chat({    message: prompt,    stream:true,});returnLlamaIndexAdapter.toDataStreamResponse(stream);}
```
