# Generate Text


---
url: https://ai-sdk.dev/cookbook/rsc/generate-text
description: Learn how to generate text using the AI SDK and React Server Components.
---


# [Generate Text](#generate-text)


This example uses React Server Components (RSC). If you want to client side rendering and hooks instead, check out the ["generate text" example with useState](/examples/next-pages/basics/generating-text).

A situation may arise when you need to generate text based on a prompt. For example, you may want to generate a response to a question or summarize a body of text. The `generateText` function can be used to generate text based on the input prompt.

http://localhost:3000

Answer


## [Client](#client)


Let's create a simple React component that will call the `getAnswer` function when a button is clicked. The `getAnswer` function will call the `generateText` function from the `ai` module, which will then generate text based on the input prompt.

app/page.tsx

```
'use client';import{ useState }from'react';import{ getAnswer }from'./actions';// Allow streaming responses up to 30 secondsexportconst maxDuration =30;exportdefaultfunctionHome(){const[generation, setGeneration]=useState<string>('');return(<div><buttononClick={async()=>{const{ text }=awaitgetAnswer('Why is the sky blue?');setGeneration(text);}}>Answer</button><div>{generation}</div></div>);}
```


## [Server](#server)


On the server side, we need to implement the `getAnswer` function, which will call the `generateText` function from the `ai` module. The `generateText` function will generate text based on the input prompt.

app/actions.ts

```
'use server';import{ generateText }from'ai';import{ openai }from'@ai-sdk/openai';exportasyncfunctiongetAnswer(question:string){const{ text, finishReason, usage }=awaitgenerateText({    model:openai('gpt-3.5-turbo'),    prompt: question,});return{ text, finishReason, usage };}
```
