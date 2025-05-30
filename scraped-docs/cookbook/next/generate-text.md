# Generate Text


---
url: https://ai-sdk.dev/cookbook/next/generate-text
description: Learn how to generate text using the AI SDK and Next.js.
---


# [Generate Text](#generate-text)


A situation may arise when you need to generate text based on a prompt. For example, you may want to generate a response to a question or summarize a body of text. The `generateText` function can be used to generate text based on the input prompt.

http://localhost:3000

Answer


## [Client](#client)


Let's create a simple React component that will make a POST request to the `/api/completion` endpoint when a button is clicked. The endpoint will generate text based on the input prompt.

app/page.tsx

```
'use client';import{ useState }from'react';exportdefaultfunctionPage(){const[generation, setGeneration]=useState('');const[isLoading, setIsLoading]=useState(false);return(<div><div        onClick={async()=>{setIsLoading(true);awaitfetch('/api/completion',{            method:'POST',            body:JSON.stringify({              prompt:'Why is the sky blue?',}),}).then(response=>{            response.json().then(json=>{setGeneration(json.text);setIsLoading(false);});});}}>Generate</div>{isLoading ?'Loading...': generation}</div>);}
```


## [Server](#server)


Let's create a route handler for `/api/completion` that will generate text based on the input prompt. The route will call the `generateText` function from the `ai` module, which will then generate text based on the input prompt and return it.

app/api/completion/route.ts

```
import{ generateText }from'ai';import{ openai }from'@ai-sdk/openai';exportasyncfunctionPOST(req:Request){const{ prompt }:{ prompt:string}=await req.json();const{ text }=awaitgenerateText({    model:openai('gpt-4'),    system:'You are a helpful assistant.',    prompt,});returnResponse.json({ text });}
```

[

View Example on GitHub

](https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/basics/generate-text/index.tsx)
