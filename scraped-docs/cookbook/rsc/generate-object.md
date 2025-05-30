# Generate Object


---
url: https://ai-sdk.dev/cookbook/rsc/generate-object
description: Learn how to generate object using the AI SDK and React Server Components.
---


# [Generate Object](#generate-object)


This example uses React Server Components (RSC). If you want to client side rendering and hooks instead, check out the ["generate object" example with useState](/examples/next-pages/basics/generating-object).

Earlier functions like `generateText` and `streamText` gave us the ability to generate unstructured text. However, if you want to generate structured data like JSON, you can provide a schema that describes the structure of your desired object to the `generateObject` function.

The function requires you to provide a schema using [zod](https://zod.dev), a library for defining schemas for JavaScript objects. By using zod, you can also use it to validate the generated object and ensure that it conforms to the specified structure.

http://localhost:3000

View Notifications


## [Client](#client)


Let's create a simple React component that will call the `getNotifications` function when a button is clicked. The function will generate a list of notifications as described in the schema.

app/page.tsx

```
'use client';import{ useState }from'react';import{ getNotifications }from'./actions';// Allow streaming responses up to 30 secondsexportconst maxDuration =30;exportdefaultfunctionHome(){const[generation, setGeneration]=useState<string>('');return(<div><buttononClick={async()=>{const{ notifications }=awaitgetNotifications('Messages during finals week.',);setGeneration(JSON.stringify(notifications,null,2));}}>ViewNotifications</button><pre>{generation}</pre></div>);}
```


## [Server](#server)


Now let's implement the `getNotifications` function. We'll use the `generateObject` function to generate the list of notifications based on the schema we defined earlier.

app/actions.ts

```
'use server';import{ generateObject }from'ai';import{ openai }from'@ai-sdk/openai';import{ z }from'zod';exportasyncfunctiongetNotifications(input:string){'use server';const{ object: notifications }=awaitgenerateObject({    model:openai('gpt-4-turbo'),    system:'You generate three notifications for a messages app.',    prompt: input,    schema: z.object({      notifications: z.array(        z.object({          name: z.string().describe('Name of a fictional person.'),          message: z.string().describe('Do not use emojis or links.'),          minutesAgo: z.number(),}),),}),});return{ notifications };}
```
