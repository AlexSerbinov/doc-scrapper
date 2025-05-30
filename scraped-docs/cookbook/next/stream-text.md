# Stream Text


---
url: https://ai-sdk.dev/cookbook/next/stream-text
description: Learn how to stream text using the AI SDK and Next.js
---


# [Stream Text](#stream-text)


Text generation can sometimes take a long time to complete, especially when you're generating a couple of paragraphs. In such cases, it is useful to stream the text generation process to the client in real-time. This allows the client to display the generated text as it is being generated, rather than have users wait for it to complete before displaying the result.

http://localhost:3000

Answer


## [Client](#client)


Let's create a simple React component that imports the `useCompletion` hook from the `@ai-sdk/react` module. The `useCompletion` hook will call the `/api/completion` endpoint when a button is clicked. The endpoint will generate text based on the input prompt and stream it to the client.

app/page.tsx

```
'use client';import{ useCompletion }from'@ai-sdk/react';exportdefaultfunctionPage(){const{ completion, complete }=useCompletion({    api:'/api/completion',});return(<div><divonClick={async()=>{awaitcomplete('Why is the sky blue?');}}>Generate</div>{completion}</div>);}
```


## [Server](#server)


Let's create a route handler for `/api/completion` that will generate text based on the input prompt. The route will call the `streamText` function from the `ai` module, which will then generate text based on the input prompt and stream it to the client.

app/api/completion/route.ts

```
import{ streamText }from'ai';import{ openai }from'@ai-sdk/openai';exportasyncfunctionPOST(req:Request){const{ prompt }:{ prompt:string}=await req.json();const result =streamText({    model:openai('gpt-4'),    system:'You are a helpful assistant.',    prompt,});return result.toDataStreamResponse();}
```

[

View Example on GitHub

](https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/basics/stream-text/index.tsx)
