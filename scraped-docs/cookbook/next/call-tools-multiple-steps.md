# Call Tools in Multiple Steps


---
url: https://ai-sdk.dev/cookbook/next/call-tools-multiple-steps
description: Learn how to call tools in multiple steps using the AI SDK and Next.js
---


# [Call Tools in Multiple Steps](#call-tools-in-multiple-steps)


Some language models are great at calling tools in multiple steps to achieve a more complex task. This is particularly useful when the tools are dependent on each other and need to be executed in sequence during the same generation step.


## [Client](#client)


Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client. If the assistant responds with a tool call, the hook will automatically display them as well.

To call tools in multiple steps, you can use the `maxSteps` option to specify the maximum number of steps that can be made before the model or the user responds with a text message. In this example, you will set it to `5` to allow for multiple tool calls.

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionPage(){const{ messages, input, setInput, append }=useChat({    api:'/api/chat',    maxSteps:5,});return(<div><input        value={input}        onChange={event=>{setInput(event.target.value);}}        onKeyDown={asyncevent=>{if(event.key ==='Enter'){append({ content: input, role:'user'});}}}/>{messages.map((message, index)=>(<divkey={index}>{message.content}</div>))}</div>);}
```


## [Server](#server)


You will create a new route at `/api/chat` that will use the `streamText` function from the `ai` module to generate the assistant's response based on the conversation history.

You will use the [`tools`](/docs/reference/ai-sdk-core/generate-text#tools) parameter to specify two tools called `getLocation` and `getWeather` that will first get the user's location and then use it to get the weather.

You will add the two functions mentioned earlier and use zod to specify the schema for its parameters.

app/api/chat/route.ts

```
import{ToolInvocation, streamText }from'ai';import{ openai }from'@ai-sdk/openai';import{ z }from'zod';interfaceMessage{  role:'user'|'assistant';  content:string;  toolInvocations?:ToolInvocation[];}functiongetLocation({ lat, lon }){return{ lat:37.7749, lon:-122.4194};}functiongetWeather({ lat, lon, unit }){return{ value:25, description:'Sunny'};}exportasyncfunctionPOST(req:Request){const{ messages }:{ messages:Message[]}=await req.json();const result =streamText({    model:openai('gpt-4o'),    system:'You are a helpful assistant.',    messages,    tools:{      getLocation:{        description:'Get the location of the user',        parameters: z.object({}),execute:async()=>{const{ lat, lon }=getLocation();return`Your location is at latitude ${lat} and longitude ${lon}`;},},      getWeather:{        description:'Get the weather for a location',        parameters: z.object({          lat: z.number().describe('The latitude of the location'),          lon: z.number().describe('The longitude of the location'),          unit: z.enum(['C','F']).describe('The unit to display the temperature in'),}),execute:async({ lat, lon, unit })=>{const{ value, description }=getWeather({ lat, lon, unit });return`It is currently ${value}°${unit} and ${description}!`;},},},});return result.toDataStreamResponse();}
```
