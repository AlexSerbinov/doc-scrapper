# Call Tools in Parallel


---
url: https://ai-sdk.dev/cookbook/rsc/call-tools-in-parallel
description: Learn how to tools in parallel text using the AI SDK and React Server Components.
---


# [Call Tools in Parallel](#call-tools-in-parallel)


Some language models support calling tools in parallel. This is particularly useful when multiple tools are independent of each other and can be executed in parallel during the same generation step.

http://localhost:3000

User: How is it going?

Assistant: All good, how may I help you?

What is the weather in Paris and New York?

Send Message


## [Client](#client)


Let's modify our previous example to call `getWeather` tool for multiple cities in parallel.

app/page.tsx

```
'use client';import{ useState }from'react';import{Message, continueConversation }from'./actions';// Allow streaming responses up to 30 secondsexportconst maxDuration =30;exportdefaultfunctionHome(){const[conversation, setConversation]=useState<Message[]>([]);const[input, setInput]=useState<string>('');return(<div><div>{conversation.map((message, index)=>(<divkey={index}>{message.role}:{message.content}</div>))}</div><div><inputtype="text"value={input}onChange={event=>{setInput(event.target.value);}}/><buttononClick={async()=>{const{ messages }=awaitcontinueConversation([...conversation,{ role:'user', content: input },]);setConversation(messages);}}>SendMessage</button></div></div>);}
```


## [Server](#server)


Let's update the tools object to now use the `getWeather` function instead.

app/actions.ts

```
'use server';import{ generateText }from'ai';import{ openai }from'@ai-sdk/openai';import{ z }from'zod';exportinterfaceMessage{  role:'user'|'assistant';  content:string;}functiongetWeather({ city, unit }){// This function would normally make an// API request to get the weather.return{ value:25, description:'Sunny'};}exportasyncfunctioncontinueConversation(history:Message[]){'use server';const{ text, toolResults }=awaitgenerateText({    model:openai('gpt-3.5-turbo'),    system:'You are a friendly weather assistant!',    messages: history,    tools:{      getWeather:{        description:'Get the weather for a location',        parameters: z.object({          city: z.string().describe('The city to get the weather for'),          unit: z.enum(['C','F']).describe('The unit to display the temperature in'),}),execute:async({ city, unit })=>{const weather =getWeather({ city, unit });return`It is currently ${weather.value}°${unit} and ${weather.description} in ${city}!`;},},},});return{    messages:[...history,{        role:'assistant'asconst,        content:          text | toolResults.map(toolResult => toolResult.result).join('\n'),},],};}
```
