# Stream Object


---
url: https://ai-sdk.dev/cookbook/rsc/stream-object
description: Learn how to stream object using the AI SDK and React Server Components.
---


# [Stream Object](#stream-object)


This example uses React Server Components (RSC). If you want to client side rendering and hooks instead, check out the ["streaming object generation" example with useObject](/examples/next-pages/basics/streaming-object-generation).

Object generation can sometimes take a long time to complete, especially when you're generating a large schema. In such cases, it is useful to stream the object generation process to the client in real-time. This allows the client to display the generated object as it is being generated, rather than have users wait for it to complete before displaying the result.

http://localhost:3000

View Notifications


## [Client](#client)


Let's create a simple React component that will call the `getNotifications` function when a button is clicked. The function will generate a list of notifications as described in the schema.

app/page.tsx

```
'use client';import{ useState }from'react';import{ generate }from'./actions';import{ readStreamableValue }from'ai/rsc';// Allow streaming responses up to 30 secondsexportconst maxDuration =30;exportdefaultfunctionHome(){const[generation, setGeneration]=useState<string>('');return(<div><button        onClick={async()=>{const{ object }=awaitgenerate('Messages during finals week.');forawait(const partialObject ofreadStreamableValue(object)){if(partialObject){setGeneration(JSON.stringify(partialObject.notifications,null,2),);}}}}>Ask</button><pre>{generation}</pre></div>);}
```


## [Server](#server)


Now let's implement the `getNotifications` function. We'll use the `generateObject` function to generate the list of fictional notifications based on the schema we defined earlier.

app/actions.ts

```
'use server';import{ streamObject }from'ai';import{ openai }from'@ai-sdk/openai';import{ createStreamableValue }from'ai/rsc';import{ z }from'zod';exportasyncfunctiongenerate(input:string){'use server';const stream =createStreamableValue();(async()=>{const{ partialObjectStream }=streamObject({      model:openai('gpt-4-turbo'),      system:'You generate three notifications for a messages app.',      prompt: input,      schema: z.object({        notifications: z.array(          z.object({            name: z.string().describe('Name of a fictional person.'),            message: z.string().describe('Do not use emojis or links.'),            minutesAgo: z.number(),}),),}),});forawait(const partialObject of partialObjectStream){      stream.update(partialObject);}    stream.done();})();return{ object: stream.value};}
```
