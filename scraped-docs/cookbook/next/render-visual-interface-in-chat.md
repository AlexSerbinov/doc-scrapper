# Render Visual Interface in Chat


---
url: https://ai-sdk.dev/cookbook/next/render-visual-interface-in-chat
description: Learn how to render visual interfaces in chat using the AI SDK and Next.js
---


# [Render Visual Interface in Chat](#render-visual-interface-in-chat)


An interesting consequence of language models that can call [tools](/docs/ai-sdk-core/tools-and-tool-calling) is that this ability can be used to render visual interfaces by streaming React components to the client.

http://localhost:3000

User: How is it going?

Assistant: All good, how may I help you?

What is the weather in San Francisco?

Send Message


## [Client](#client)


Let's build an assistant that gets the weather for any city by calling the `getWeatherInformation` tool. Instead of returning text during the tool call, you will render a React component that displays the weather information on the client.

app/page.tsx

```
'use client';import{ToolInvocation}from'ai';import{Message, useChat }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit, addToolResult }=useChat({      api:'/api/use-chat',      maxSteps:5,// run client-side tools that are automatically executed:asynconToolCall({ toolCall }){if(toolCall.toolName ==='getLocation'){const cities =['New York','Los Angeles','Chicago','San Francisco',];return cities[Math.floor(Math.random()* cities.length)];}},});return(<divclassName="flex flex-col w-full max-w-md py-24 mx-auto stretch gap-4">{messages?.map((m: Message)=>(<divkey={m.id}className="whitespace-pre-wrap flex flex-col gap-1"><strong>{`${m.role}: `}</strong>{m.content}{m.toolInvocations?.map((toolInvocation: ToolInvocation)=>{const toolCallId = toolInvocation.toolCallId;// render confirmation tool (client-side tool with user interaction)if(toolInvocation.toolName ==='askForConfirmation'){return(<divkey={toolCallId}className="text-gray-500 flex flex-col gap-2">{toolInvocation.args.message}<divclassName="flex gap-2">{'result'in toolInvocation ?(<b>{toolInvocation.result}</b>):(<><buttonclassName="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"onClick={()=>addToolResult({                              toolCallId,                              result:'Yes, confirmed.',})}>Yes</button><buttonclassName="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"onClick={()=>addToolResult({                              toolCallId,                              result:'No, denied',})}>No</button></>)}</div></div>);}// other tools:return'result'in toolInvocation ?(              toolInvocation.toolName ==='getWeatherInformation'?(<divkey={toolCallId}className="flex flex-col gap-2 p-4 bg-blue-400 rounded-lg"><divclassName="flex flex-row justify-between items-center"><divclassName="text-4xl text-blue-50 font-medium">{toolInvocation.result.value}°{toolInvocation.result.unit ==='celsius'?'C':'F'}</div><divclassName="h-9 w-9 bg-amber-400 rounded-full flex-shrink-0"/></div><divclassName="flex flex-row gap-2 text-blue-50 justify-between">{toolInvocation.result.weeklyForecast.map((forecast: any)=>(<divkey={forecast.day}className="flex flex-col items-center"><divclassName="text-xs">{forecast.day}</div><div>{forecast.value}°</div></div>),)}</div></div>): toolInvocation.toolName ==='getLocation'?(<divkey={toolCallId}className="text-gray-500 bg-gray-100 rounded-lg p-4">Userisin{toolInvocation.result}.</div>):(<divkey={toolCallId}className="text-gray-500">Tool call {`${toolInvocation.toolName}: `}{toolInvocation.result}</div>)):(<divkey={toolCallId}className="text-gray-500">Calling{toolInvocation.toolName}...</div>);})}</div>))}<formonSubmit={handleSubmit}><inputclassName="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"value={input}placeholder="Say something..."onChange={handleInputChange}/></form></div>);}
```


## [Server](#server)


api/chat.ts

```
import{ openai }from'@ai-sdk/openai';import{ streamText }from'ai';import{ z }from'zod';exportdefaultasyncfunctionPOST(request: Request){const{ messages }=await request.json();const result =streamText({    model:openai('gpt-4-turbo'),    messages,    tools:{// server-side tool with execute function:      getWeatherInformation:{        description:'show the weather in a given city to the user',        parameters: z.object({ city: z.string()}),execute:async({}:{ city: string })=>{return{            value:24,            unit:'celsius',            weeklyForecast:[{ day:'Monday', value:24},{ day:'Tuesday', value:25},{ day:'Wednesday', value:26},{ day:'Thursday', value:27},{ day:'Friday', value:28},{ day:'Saturday', value:29},{ day:'Sunday', value:30},],};},},// client-side tool that starts user interaction:      askForConfirmation:{        description:'Ask the user for confirmation.',        parameters: z.object({          message: z.string().describe('The message to ask for confirmation.'),}),},// client-side tool that is automatically executed on the client:      getLocation:{        description:'Get the user location. Always ask for confirmation before using this tool.',        parameters: z.object({}),},},});return result.toDataStreamResponse();}
```
