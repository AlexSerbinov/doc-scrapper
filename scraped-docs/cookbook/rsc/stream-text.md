# Stream Text


---
url: https://ai-sdk.dev/cookbook/rsc/stream-text
description: Learn how to stream text using the AI SDK and React Server Components.
---


# [Stream Text](#stream-text)


This example uses React Server Components (RSC). If you want to client side rendering and hooks instead, check out the ["stream text" example with useCompletion](/examples/next-pages/basics/streaming-text-generation).

Text generation can sometimes take a long time to complete, especially when you're generating a couple of paragraphs. In such cases, it is useful to stream the text generation process to the client in real-time. This allows the client to display the generated text as it is being generated, rather than have users wait for it to complete before displaying the result.

http://localhost:3000

Answer


## [Client](#client)


Let's create a simple React component that will call the `generate` function when a button is clicked. The `generate` function will call the `streamText` function, which will then generate text based on the input prompt. To consume the stream of text in the client, we will use the `readStreamableValue` function from the `ai/rsc` module.

app/page.tsx

```
'use client';import{ useState }from'react';import{ generate }from'./actions';import{ readStreamableValue }from'ai/rsc';// Allow streaming responses up to 30 secondsexportconst maxDuration =30;exportdefaultfunctionHome(){const[generation, setGeneration]=useState<string>('');return(<div><button        onClick={async()=>{const{ output }=awaitgenerate('Why is the sky blue?');forawait(const delta ofreadStreamableValue(output)){setGeneration(currentGeneration=>`${currentGeneration}${delta}`);}}}>Ask</button><div>{generation}</div></div>);}
```


## [Server](#server)


On the server side, we need to implement the `generate` function, which will call the `streamText` function. The `streamText` function will generate text based on the input prompt. In order to stream the text generation to the client, we will use `createStreamableValue` that can wrap any changeable value and stream it to the client.

Using DevTools, we can see the text generation being streamed to the client in real-time.

app/actions.ts

```
'use server';import{ streamText }from'ai';import{ openai }from'@ai-sdk/openai';import{ createStreamableValue }from'ai/rsc';exportasyncfunctiongenerate(input:string){const stream =createStreamableValue('');(async()=>{const{ textStream }=streamText({      model:openai('gpt-3.5-turbo'),      prompt: input,});forawait(const delta of textStream){      stream.update(delta);}    stream.done();})();return{ output: stream.value};}
```
