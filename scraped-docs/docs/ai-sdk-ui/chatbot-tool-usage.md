# Chatbot Tool Usage


---
url: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage
description: Learn how to use tools with the useChat hook.
---


# [Chatbot Tool Usage](#chatbot-tool-usage)


With [`useChat`](/docs/reference/ai-sdk-ui/use-chat) and [`streamText`](/docs/reference/ai-sdk-core/stream-text), you can use tools in your chatbot application. The AI SDK supports three types of tools in this context:

1.  Automatically executed server-side tools
2.  Automatically executed client-side tools
3.  Tools that require user interaction, such as confirmation dialogs

The flow is as follows:

1.  The user enters a message in the chat UI.
2.  The message is sent to the API route.
3.  In your server side route, the language model generates tool calls during the `streamText` call.
4.  All tool calls are forwarded to the client.
5.  Server-side tools are executed using their `execute` method and their results are forwarded to the client.
6.  Client-side tools that should be automatically executed are handled with the `onToolCall` callback. You can return the tool result from the callback.
7.  Client-side tool that require user interactions can be displayed in the UI. The tool calls and results are available as tool invocation parts in the `parts` property of the last assistant message.
8.  When the user interaction is done, `addToolResult` can be used to add the tool result to the chat.
9.  When there are tool calls in the last assistant message and all tool results are available, the client sends the updated messages back to the server. This triggers another iteration of this flow.

The tool call and tool executions are integrated into the assistant message as tool invocation parts. A tool invocation is at first a tool call, and then it becomes a tool result when the tool is executed. The tool result contains all information about the tool call as well as the result of the tool execution.

In order to automatically send another request to the server when all tool calls are server-side, you need to set [`maxSteps`](/docs/reference/ai-sdk-ui/use-chat#max-steps) to a value greater than 1 in the `useChat` options. It is disabled by default for backward compatibility.


## [Example](#example)


In this example, we'll use three tools:

-   `getWeatherInformation`: An automatically executed server-side tool that returns the weather in a given city.
-   `askForConfirmation`: A user-interaction client-side tool that asks the user for confirmation.
-   `getLocation`: An automatically executed client-side tool that returns a random city.


### [API route](#api-route)


app/api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{ streamText }from'ai';import{ z }from'zod';// Allow streaming responses up to 30 secondsexportconst maxDuration =30;exportasyncfunctionPOST(req: Request){const{ messages }=await req.json();const result =streamText({    model:openai('gpt-4o'),    messages,    tools:{// server-side tool with execute function:      getWeatherInformation:{        description:'show the weather in a given city to the user',        parameters: z.object({ city: z.string()}),execute:async({}:{ city: string })=>{const weatherOptions =['sunny','cloudy','rainy','snowy','windy'];return weatherOptions[Math.floor(Math.random()* weatherOptions.length)];},},// client-side tool that starts user interaction:      askForConfirmation:{        description:'Ask the user for confirmation.',        parameters: z.object({          message: z.string().describe('The message to ask for confirmation.'),}),},// client-side tool that is automatically executed on the client:      getLocation:{        description:'Get the user location. Always ask for confirmation before using this tool.',        parameters: z.object({}),},},});return result.toDataStreamResponse();}
```


### [Client-side page](#client-side-page)


The client-side page uses the `useChat` hook to create a chatbot application with real-time message streaming. Tool invocations are displayed in the chat UI as tool invocation parts. Please make sure to render the messages using the `parts` property of the message.

There are three things worth mentioning:

1.  The [`onToolCall`](/docs/reference/ai-sdk-ui/use-chat#on-tool-call) callback is used to handle client-side tools that should be automatically executed. In this example, the `getLocation` tool is a client-side tool that returns a random city.

2.  The `toolInvocations` property of the last assistant message contains all tool calls and results. The client-side tool `askForConfirmation` is displayed in the UI. It asks the user for confirmation and displays the result once the user confirms or denies the execution. The result is added to the chat using `addToolResult`.

3.  The [`maxSteps`](/docs/reference/ai-sdk-ui/use-chat#max-steps) option is set to 5. This enables several tool use iterations between the client and the server.


app/page.tsx

```
'use client';import{ToolInvocation}from'ai';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit, addToolResult }=useChat({      maxSteps:5,// run client-side tools that are automatically executed:asynconToolCall({ toolCall }){if(toolCall.toolName ==='getLocation'){const cities =['New York','Los Angeles','Chicago','San Francisco',];return cities[Math.floor(Math.random()* cities.length)];}},});return(<>{messages?.map(message=>(<divkey={message.id}><strong>{`${message.role}: `}</strong>{message.parts.map(part=>{switch(part.type){// render text parts as simple text:case'text':return part.text;// for tool invocations, distinguish between the tools and the state:case'tool-invocation':{const callId = part.toolInvocation.toolCallId;switch(part.toolInvocation.toolName){case'askForConfirmation':{switch(part.toolInvocation.state){case'call':return(<divkey={callId}>{part.toolInvocation.args.message}<div><buttononClick={()=>addToolResult({                                    toolCallId: callId,                                    result:'Yes, confirmed.',})}>Yes</button><buttononClick={()=>addToolResult({                                    toolCallId: callId,                                    result:'No, denied',})}>No</button></div></div>);case'result':return(<divkey={callId}>Location access allowed:{' '}{part.toolInvocation.result}</div>);}break;}case'getLocation':{switch(part.toolInvocation.state){case'call':return<divkey={callId}>Gettinglocation...</div>;case'result':return(<divkey={callId}>Location:{part.toolInvocation.result}</div>);}break;}case'getWeatherInformation':{switch(part.toolInvocation.state){// example of pre-rendering streaming tool calls:case'partial-call':return(<prekey={callId}>{JSON.stringify(part.toolInvocation,null,2)}</pre>);case'call':return(<divkey={callId}>Getting weather information for{' '}{part.toolInvocation.args.city}...</div>);case'result':return(<divkey={callId}>Weatherin{part.toolInvocation.args.city}:{' '}{part.toolInvocation.result}</div>);}break;}}}}})}<br/></div>))}<formonSubmit={handleSubmit}><inputvalue={input}onChange={handleInputChange}/></form></>);}
```


## [Tool call streaming](#tool-call-streaming)


You can stream tool calls while they are being generated by enabling the `toolCallStreaming` option in `streamText`.

app/api/chat/route.ts

```
exportasyncfunctionPOST(req: Request){// ...const result =streamText({    toolCallStreaming:true,// ...});return result.toDataStreamResponse();}
```

When the flag is enabled, partial tool calls will be streamed as part of the data stream. They are available through the `useChat` hook. The tool invocation parts of assistant messages will also contain partial tool calls. You can use the `state` property of the tool invocation to render the correct UI.

app/page.tsx

```
exportdefaultfunctionChat(){// ...return(<>{messages?.map(message=>(<divkey={message.id}>{message.parts.map(part=>{if(part.type==='tool-invocation'){switch(part.toolInvocation.state){case'partial-call':return<>render partial tool call</>;case'call':return<>render full tool call</>;case'result':return<>render tool result</>;}}})}</div>))}</>);}
```


## [Step start parts](#step-start-parts)


When you are using multi-step tool calls, the AI SDK will add step start parts to the assistant messages. If you want to display boundaries between tool invocations, you can use the `step-start` parts as follows:

app/page.tsx

```
// ...// where you render the message parts:message.parts.map((part, index)=>{switch(part.type){case'step-start':// show step boundaries as horizontal lines:return index >0?(<divkey={index}className="text-gray-500"><hrclassName="my-2 border-gray-300"/></div>):null;case'text':// ...case'tool-invocation':// ...}});// ...
```


## [Server-side Multi-Step Calls](#server-side-multi-step-calls)


You can also use multi-step calls on the server-side with `streamText`. This works when all invoked tools have an `execute` function on the server side.

app/api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{ streamText }from'ai';import{ z }from'zod';exportasyncfunctionPOST(req: Request){const{ messages }=await req.json();const result =streamText({    model:openai('gpt-4o'),    messages,    tools:{      getWeatherInformation:{        description:'show the weather in a given city to the user',        parameters: z.object({ city: z.string()}),// tool has execute function:execute:async({}:{ city: string })=>{const weatherOptions =['sunny','cloudy','rainy','snowy','windy'];return weatherOptions[Math.floor(Math.random()* weatherOptions.length)];},},},    maxSteps:5,});return result.toDataStreamResponse();}
```


## [Errors](#errors)


Language models can make errors when calling tools. By default, these errors are masked for security reasons, and show up as "An error occurred" in the UI.

To surface the errors, you can use the `getErrorMessage` function when calling `toDataStreamResponse`.

```
exportfunctionerrorHandler(error: unknown){if(error ==null){return'unknown error';}if(typeof error ==='string'){return error;}if(error instanceofError){return error.message;}returnJSON.stringify(error);}
```

```
const result =streamText({// ...});return result.toDataStreamResponse({  getErrorMessage: errorHandler,});
```

In case you are using `createDataStreamResponse`, you can use the `onError` function when calling `toDataStreamResponse`:

```
const response =createDataStreamResponse({// ...asyncexecute(dataStream){// ...},onError:error=>`Custom error: ${error.message}`,});
```
