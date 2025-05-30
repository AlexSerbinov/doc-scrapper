# LlamaIndex


---
url: https://ai-sdk.dev/providers/adapters/llamaindex
description: Learn how to use LlamaIndex with the AI SDK.
---


# [LlamaIndex](#llamaindex)


[LlamaIndex](https://ts.llamaindex.ai/) is a framework for building LLM-powered applications. LlamaIndex helps you ingest, structure, and access private or domain-specific data. LlamaIndex.TS offers the core features of LlamaIndex for Python for popular runtimes like Node.js (official support), Vercel Edge Functions (experimental), and Deno (experimental).


## [Example: Completion](#example-completion)


Here is a basic example that uses both AI SDK and LlamaIndex together with the [Next.js](https://nextjs.org/docs) App Router.

The AI SDK [`LlamaIndexAdapter`](/docs/reference/stream-helpers/llamaindex-adapter) uses the stream result from calling the `chat` method on a [LlamaIndex ChatEngine](https://ts.llamaindex.ai/modules/chat_engine) or the `query` method on a [LlamaIndex QueryEngine](https://ts.llamaindex.ai/modules/query_engines) to pipe text to the client.

app/api/completion/route.ts

```
import{OpenAI,SimpleChatEngine}from'llamaindex';import{LlamaIndexAdapter}from'ai';exportconst maxDuration =60;exportasyncfunctionPOST(req: Request){const{ prompt }=await req.json();const llm =newOpenAI({ model:'gpt-4o'});const chatEngine =newSimpleChatEngine({ llm });const stream =await chatEngine.chat({    message: prompt,    stream:true,});returnLlamaIndexAdapter.toDataStreamResponse(stream);}
```

Then, we use the AI SDK's [`useCompletion`](/docs/ai-sdk-ui/completion) method in the page component to handle the completion:

app/page.tsx

```
'use client';import{ useCompletion }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ completion, input, handleInputChange, handleSubmit }=useCompletion();return(<div>{completion}<formonSubmit={handleSubmit}><inputvalue={input}onChange={handleInputChange}/></form></div>);}
```


## [More Examples](#more-examples)


[create-llama](https://github.com/run-llama/create-llama) is the easiest way to get started with LlamaIndex. It uses the AI SDK to connect to LlamaIndex in all its generated code.
