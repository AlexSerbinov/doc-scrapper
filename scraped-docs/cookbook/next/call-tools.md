# Call Tools


---
url: https://ai-sdk.dev/cookbook/next/call-tools
description: Learn how to call tools using the AI SDK and Next.js
---


# [Call Tools](#call-tools)


Some models allow developers to provide a list of tools that can be called at any time during a generation. This is useful for extending the capabilites of a language model to either use logic or data to interact with systems external to the model.

http://localhost:3000

User: How is it going?

Assistant: All good, how may I help you?

What is the weather in Paris and New York?

Send Message


## [Client](#client)


Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client. If the assistant responds with a tool call, the hook will automatically display them as well.

We will use the `maxSteps` to specify the maximum number of steps (i.e., LLM calls) that can be made to prevent infinite loops. In this example, you will set it to `2` to allow for two backend calls to happen.

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionPage(){const{ messages, input, setInput, append }=useChat({    api:'/api/chat',    maxSteps:2,});return(<div><input        value={input}        onChange={event=>{setInput(event.target.value);}}        onKeyDown={asyncevent=>{if(event.key ==='Enter'){append({ content: input, role:'user'});}}}/>{messages.map((message, index)=>(<divkey={index}>{message.content}</div>))}</div>);}
```


## [Server](#server)


You will create a new route at `/api/chat` that will use the `streamText` function from the `ai` module to generate the assistant's response based on the conversation history.

You will use the [`tools`](/docs/reference/ai-sdk-core/generate-text#tools) parameter to specify a tool called `celsiusToFahrenheit` that will convert a user given value in celsius to fahrenheit.

You will also use zod to specify the schema for the `celsiusToFahrenheit` function's parameters.

app/api/chat/route.ts

```
import{ToolInvocation, streamText }from'ai';import{ openai }from'@ai-sdk/openai';import{ z }from'zod';interfaceMessage{  role:'user'|'assistant';  content:string;  toolInvocations?:ToolInvocation[];}exportasyncfunctionPOST(req: Request){const{ messages }:{ messages:Message[]}=await req.json();const result =streamText({    model:openai('gpt-4o'),    system:'You are a helpful assistant.',    messages,    tools:{      getWeather:{        description:'Get the weather for a location',        parameters: z.object({          city: z.string().describe('The city to get the weather for'),          unit: z.enum(['C','F']).describe('The unit to display the temperature in'),}),execute:async({ city, unit })=>{const weather ={            value:24,            description:'Sunny',};return`It is currently ${weather.value}°${unit} and ${weather.description} in ${city}!`;},},},});return result.toDataStreamResponse();}
```

[

View Example on GitHub

](https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/tools/call-tool/index.tsx)
