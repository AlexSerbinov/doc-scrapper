# LangChain


---
url: https://ai-sdk.dev/providers/adapters/langchain
description: Learn how to use LangChain with the AI SDK.
---


# [LangChain](#langchain)


[LangChain](https://js.langchain.com/docs/) is a framework for developing applications powered by language models. It provides tools and abstractions for working with AI models, agents, vector stores, and other data sources for retrieval augmented generation (RAG). However, LangChain does not provide a way to easily build UIs or a standard way to stream data to the client.


## [Example: Completion](#example-completion)


Here is a basic example that uses both the AI SDK and LangChain together with the [Next.js](https://nextjs.org/docs) App Router.

The AI SDK [`LangChainAdapter`](/docs/reference/stream-helpers/langchain-adapter) uses the result from [LangChain ExpressionLanguage streaming](https://js.langchain.com/docs/expression_language/streaming) to pipe text to the client. `LangChainAdapter.toDataStreamResponse()` is compatible with the LangChain Expression Language `.stream()` function response.

app/api/completion/route.ts

```
import{ChatOpenAI}from'@langchain/openai';import{LangChainAdapter}from'ai';exportconst maxDuration =60;exportasyncfunctionPOST(req: Request){const{ prompt }=await req.json();const model =newChatOpenAI({    model:'gpt-3.5-turbo-0125',    temperature:0,});const stream =await model.stream(prompt);returnLangChainAdapter.toDataStreamResponse(stream);}
```

Then, we use the AI SDK's [`useCompletion`](/docs/ai-sdk-ui/completion) method in the page component to handle the completion:

app/page.tsx

```
'use client';import{ useCompletion }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ completion, input, handleInputChange, handleSubmit }=useCompletion();return(<div>{completion}<formonSubmit={handleSubmit}><inputvalue={input}onChange={handleInputChange}/></form></div>);}
```


## [More Examples](#more-examples)


You can find additional examples in the AI SDK [examples/next-langchain](https://github.com/vercel/ai/tree/main/examples/next-langchain) folder.
