# Stopping Streams


---
url: https://ai-sdk.dev/docs/advanced/stopping-streams
description: Learn how to cancel streams with the AI SDK
---


# [Stopping Streams](#stopping-streams)


Cancelling ongoing streams is often needed. For example, users might want to stop a stream when they realize that the response is not what they want.

The different parts of the AI SDK support cancelling streams in different ways.


## [AI SDK Core](#ai-sdk-core)


The AI SDK functions have an `abortSignal` argument that you can use to cancel a stream. You would use this if you want to cancel a stream from the server side to the LLM API, e.g. by forwarding the `abortSignal` from the request.

```
import{ openai }from'@ai-sdk/openai';import{ streamText }from'ai';exportasyncfunctionPOST(req: Request){const{ prompt }=await req.json();const result =streamText({    model:openai('gpt-4-turbo'),    prompt,// forward the abort signal:    abortSignal: req.signal,});return result.toTextStreamResponse();}
```


## [AI SDK UI](#ai-sdk-ui)


The hooks, e.g. `useChat` or `useCompletion`, provide a `stop` helper function that can be used to cancel a stream. This will cancel the stream from the client side to the server.

```
'use client';import{ useCompletion }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ input, completion, stop, status, handleSubmit, handleInputChange }=useCompletion();return(<div>{(status ==='submitted'| status ==='streaming')&&(<buttontype="button"onClick={()=>stop()}>Stop</button>)}{completion}<formonSubmit={handleSubmit}><inputvalue={input}onChange={handleInputChange}/></form></div>);}
```


## [AI SDK RSC](#ai-sdk-rsc)


The AI SDK RSC does not currently support stopping streams.
