# Call Tools in Parallel


---
url: https://ai-sdk.dev/cookbook/next/call-tools-in-parallel
description: Learn how to call tools in parallel using the AI SDK and Next.js
---


# [Call Tools in Parallel](#call-tools-in-parallel)


Some language models support calling tools in parallel. This is particularly useful when multiple tools are independent of each other and can be executed in parallel during the same generation step.

http://localhost:3000

User: How is it going?

Assistant: All good, how may I help you?

What is the weather in Paris and New York?

Send Message


## [Client](#client)


Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client. If the assistant responds with a tool call, the hook will automatically display them as well.

You will use the `maxSteps` to specify the maximum number of steps that can made before the model or the user responds with a text message. In this example, you will set it to `2` to allow for another call with the tool result to happen.

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionPage(){const{ messages, input, setInput, append }=useChat({    api:'/api/chat',    maxSteps:2,});return(<div><input        value={input}        onChange={event=>{setInput(event.target.value);}}        onKeyDown={asyncevent=>{if(event.key ==='Enter'){append({ content: input, role:'user'});}}}/>{messages.map((message, index)=>(<divkey={index}>{message.content}</div>))}</div>);}
```


## [Server](#server)


You will create a new route at `/api/chat` that will use the `streamText` function from the `ai` module to generate the assistant's response based on the conversation history.

You will use the [`tools`](/docs/reference/ai-sdk-core/generate-text#tools) parameter to specify a tool called `getWeather` that will get the weather for a location.

You will add the `getWeather` function and use zod to specify the schema for its parameters.

app/api/chat/route.ts

```
import{ToolInvocation, streamText }from'ai';import{ openai }from'@ai-sdk/openai';import{ z }from'zod';interfaceMessage{  role:'user'|'assistant';  content:string;  toolInvocations?:ToolInvocation[];}functiongetWeather({ city, unit }){return{ value:25, description:'Sunny'};}exportasyncfunctionPOST(req:Request){const{ messages }:{ messages:Message[]}=await req.json();const result =streamText({    model:openai('gpt-4o'),    system:'You are a helpful assistant.',    messages,    tools:{      getWeather:{        description:'Get the weather for a location',        parameters: z.object({          city: z.string().describe('The city to get the weather for'),          unit: z.enum(['C','F']).describe('The unit to display the temperature in'),}),execute:async({ city, unit })=>{const{ value, description }=getWeather({ city, unit });return`It is currently ${value}°${unit} and ${description} in ${city}!`;},},},});return result.toDataStreamResponse();}
```

[

View Example on GitHub

](https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/tools/call-tools-in-parallel/index.tsx)
