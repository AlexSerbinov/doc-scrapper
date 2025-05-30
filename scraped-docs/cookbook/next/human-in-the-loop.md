# Human-in-the-Loop with Next.js


---
url: https://ai-sdk.dev/cookbook/next/human-in-the-loop
description: Add a human approval step to your agentic system with Next.js and the AI SDK
---


# [Human-in-the-Loop with Next.js](#human-in-the-loop-with-nextjs)


When building agentic systems, it's important to add human-in-the-loop (HITL) functionality to ensure that users can approve actions before the system executes them. This recipe will describe how to [build a low-level solution](#adding-a-confirmation-step) and then provide an [example abstraction](#building-your-own-abstraction) you could implement and customise based on your needs.


## [Background](#background)


To understand how to implement this functionality, let's look at how tool calling works in a simple Next.js chatbot application with the AI SDK.

On the frontend, use the `useChat` hook to manage the message state and user interaction (including input and form submission handlers).

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit }=useChat();return(<div><div>{messages?.map(m=>(<divkey={m.id}><strong>{`${m.role}: `}</strong>{m.parts?.map((part, i)=>{switch(part.type){case'text':return<divkey={i}>{part.text}</div>;}})}<br/></div>))}</div><formonSubmit={handleSubmit}><inputvalue={input}placeholder="Say something..."onChange={handleInputChange}/></form></div>);}
```

On the backend, create a route handler (API Route) that returns a `DataStreamResponse`. Within the execute function, call `streamText` and pass in the `messages` (sent from the client). Finally, merge the resulting generation into the data stream.

api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{ createDataStreamResponse, streamText, tool }from'ai';import{ z }from'zod';exportasyncfunctionPOST(req:Request){const{ messages }=await req.json();returncreateDataStreamResponse({execute:async dataStream =>{const result =streamText({        model:openai('gpt-4o'),        messages,        tools:{          getWeatherInformation:tool({            description:'show the weather in a given city to the user',            parameters: z.object({ city: z.string()}),execute:async({}:{ city:string})=>{const weatherOptions =['sunny','cloudy','rainy','snowy'];return weatherOptions[Math.floor(Math.random()* weatherOptions.length)];},}),},});      result.mergeIntoDataStream(dataStream);},});}
```

What happens if you ask the LLM for the weather in New York?

The LLM has one tool available, `weather`, which requires a `location` to run. This tool will, as stated in the tool's `description`, "show the weather in a given city to the user". If the LLM decides that the `weather` tool could answer the user's query, it would generate a `ToolCall`, extracting the `location` from the context. The AI SDK would then run the associated `execute` function, passing in the `location` parameter, and finally returning a `ToolResult`.

To introduce a HITL step you will add a confirmation step to this process in between the `ToolCall` and the `ToolResult`.


## [Adding a Confirmation Step](#adding-a-confirmation-step)


At a high level, you will:

1.  Intercept tool calls before they are executed
2.  Render a confirmation UI with Yes/No buttons
3.  Send a temporary tool result indicating whether the user confirmed or declined
4.  On the server, check for the confirmation state in the tool result:
    -   If confirmed, execute the tool and update the result
    -   If declined, update the result with an error message
5.  Send the updated tool result back to the client to maintain state consistency


### [Forward Tool Call To The Client](#forward-tool-call-to-the-client)


To implement HITL functionality, you start by omitting the `execute` function from the tool definition. This allows the frontend to intercept the tool call and handle the responsibility of adding the final tool result to the tool call.

api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{ createDataStreamResponse, streamText, tool }from'ai';import{ z }from'zod';exportasyncfunctionPOST(req:Request){const{ messages }=await req.json();returncreateDataStreamResponse({execute:async dataStream =>{const result =streamText({        model:openai('gpt-4o'),        messages,        tools:{          getWeatherInformation:tool({            description:'show the weather in a given city to the user',            parameters: z.object({ city: z.string()}),// execute function removed to stop automatic execution}),},});      result.mergeIntoDataStream(dataStream);},});}
```

Each tool call must have a corresponding tool result. If you do not add a tool result, all subsequent generations will fail.


### [Intercept Tool Call](#intercept-tool-call)


On the frontend, you map through the messages, either rendering the message content or checking for tool invocations and rendering custom UI.

You can check if the tool requiring confirmation has been called and, if so, present options to either confirm or deny the proposed tool call. This confirmation is done using the `addToolResult` function to create a tool result and append it to the associated tool call.

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit, addToolResult }=useChat();return(<div><div>{messages?.map(m=>(<divkey={m.id}><strong>{`${m.role}: `}</strong>{m.parts?.map((part, i)=>{switch(part.type){case'text':return<divkey={i}>{part.text}</div>;case'tool-invocation':const toolInvocation = part.toolInvocation;const toolCallId = toolInvocation.toolCallId;// render confirmation tool (client-side tool with user interaction)if(                    toolInvocation.toolName ==='getWeatherInformation'&&                    toolInvocation.state ==='call'){return(<divkey={toolCallId}>Get weather information for{toolInvocation.args.city}?<div><buttononClick={()=>addToolResult({                                toolCallId,                                result:'Yes, confirmed.',})}>Yes</button><buttononClick={()=>addToolResult({                                toolCallId,                                result:'No, denied.',})}>No</button></div></div>);}}})}<br/></div>))}</div><formonSubmit={handleSubmit}><inputvalue={input}placeholder="Say something..."onChange={handleInputChange}/></form></div>);}
```

The `addToolResult` function will trigger a call to your route handler.


### [Handle Confirmation Response](#handle-confirmation-response)


Adding a tool result will trigger another call to your route handler. Before sending the new messages to the language model, you pull out the last message and map through the message parts to see if the tool requiring confirmation was called and whether it's in a "result" state. If those conditions are met, you check the confirmation state (the tool result state that you set on the frontend with the `addToolResult` function).

api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{  createDataStreamResponse,  formatDataStreamPart,Message,  streamText,  tool,}from'ai';import{ z }from'zod';exportasyncfunctionPOST(req:Request){const{ messages }:{ messages:Message[]}=await req.json();returncreateDataStreamResponse({execute:async dataStream =>{// pull out last messageconst lastMessage = messages[messages.length-1];      lastMessage.parts=awaitPromise.all(// map through all message parts        lastMessage.parts?.map(async part =>{if(part.type!=='tool-invocation'){return part;}const toolInvocation = part.toolInvocation;// return if tool isn't weather tool or in a result stateif(            toolInvocation.toolName!=='getWeatherInformation'|            toolInvocation.state!=='result'){return part;}// switch through tool result states (set on the frontend)switch(toolInvocation.result){case'Yes, confirmed.':{const result =awaitexecuteWeatherTool(toolInvocation.args);// forward updated tool result to the client:              dataStream.write(formatDataStreamPart('tool_result',{                  toolCallId: toolInvocation.toolCallId,                  result,}),);// update the message part:return{...part, toolInvocation:{...toolInvocation, result }};}case'No, denied.':{const result ='Error: User denied access to weather information';// forward updated tool result to the client:              dataStream.write(formatDataStreamPart('tool_result',{                  toolCallId: toolInvocation.toolCallId,                  result,}),);// update the message part:return{...part, toolInvocation:{...toolInvocation, result }};}default:return part;}})??[],);const result =streamText({        model:openai('gpt-4o'),        messages,        tools:{          getWeatherInformation:tool({            description:'show the weather in a given city to the user',            parameters: z.object({ city: z.string()}),}),},});      result.mergeIntoDataStream(dataStream);},});}asyncfunctionexecuteWeatherTool({}:{ city:string}){const weatherOptions =['sunny','cloudy','rainy','snowy'];return weatherOptions[Math.floor(Math.random()* weatherOptions.length)];}
```

In this implementation, you use simple strings like "Yes, the user confirmed" or "No, the user declined" as states. If confirmed, you execute the tool. If declined, you do not execute the tool. In both cases, you update the tool result from the arbitrary data you sent with the `addToolResult` function to either the result of the execute function or an "Execution declined" statement. You send the updated tool result back to the frontend to maintain state synchronization.

After handling the tool result, your API route continues. This triggers another generation with the updated tool result, allowing the LLM to continue attempting to solve the query.


## [Building your own abstraction](#building-your-own-abstraction)


The solution above is low-level and not very friendly to use in a production environment. You can build your own abstraction using these concepts


### [Create Utility Functions](#create-utility-functions)


utils.ts

```
import{ formatDataStreamPart,Message}from'@ai-sdk/ui-utils';import{  convertToCoreMessages,DataStreamWriter,ToolExecutionOptions,ToolSet,}from'ai';import{ z }from'zod';// Approval string to be shared across frontend and backendexportconstAPPROVAL={YES:'Yes, confirmed.',NO:'No, denied.',}asconst;functionisValidToolName<KextendsPropertyKey,Textends object>(  key:K,  obj:T,): key isK&keyofT{return key in obj;}/** * Processes tool invocations where human input is required, executing tools when authorized. * * @param options - The function options * @param options.tools - Map of tool names to Tool instances that may expose execute functions * @param options.dataStream - Data stream for sending results back to the client * @param options.messages - Array of messages to process * @param executionFunctions - Map of tool names to execute functions * @returns Promise resolving to the processed messages */exportasyncfunctionprocessToolCalls<ToolsextendsToolSet,ExecutableToolsextends{[ToolinkeyofToolsasTools[Tool]extends{ execute:Function}?never:Tool]:Tools[Tool];},>({    dataStream,    messages,}:{    tools:Tools;// used for type inference    dataStream:DataStreamWriter;    messages:Message[];},  executeFunctions:{[KinkeyofTools&keyofExecutableTools]?:(      args: z.infer<ExecutableTools[K]['parameters']>,      context:ToolExecutionOptions,)=>Promise<any>;},):Promise<Message[]>{const lastMessage = messages[messages.length-1];const parts = lastMessage.parts;if(!parts)return messages;const processedParts =awaitPromise.all(    parts.map(async part =>{// Only process tool invocations partsif(part.type!=='tool-invocation')return part;const{ toolInvocation }= part;const toolName = toolInvocation.toolName;// Only continue if we have an execute function for the tool (meaning it requires confirmation) and it's in a 'result' stateif(!(toolName in executeFunctions)| toolInvocation.state!=='result')return part;let result;if(toolInvocation.result===APPROVAL.YES){// Get the tool and check if the tool has an execute function.if(!isValidToolName(toolName, executeFunctions)|          toolInvocation.state!=='result'){return part;}const toolInstance = executeFunctions[toolName];if(toolInstance){          result =awaittoolInstance(toolInvocation.args,{            messages:convertToCoreMessages(messages),            toolCallId: toolInvocation.toolCallId,});}else{          result ='Error: No execute function found on tool';}}elseif(toolInvocation.result===APPROVAL.NO){        result ='Error: User denied access to tool execution';}else{// For any unhandled responses, return the original part.return part;}// Forward updated tool result to the client.      dataStream.write(formatDataStreamPart('tool_result',{          toolCallId: toolInvocation.toolCallId,          result,}),);// Return updated toolInvocation with the actual result.return{...part,        toolInvocation:{...toolInvocation,          result,},};}),);// Finally return the processed messagesreturn[...messages.slice(0,-1),{...lastMessage, parts: processedParts }];}exportfunctiongetToolsRequiringConfirmation<TextendsToolSet>(  tools:T,):string[]{return(Object.keys(tools)as(keyofT)[]).filter(key =>{const maybeTool = tools[key];returntypeof maybeTool.execute!=='function';})asstring[];}
```

In this file, you first declare the confirmation strings as constants so we can share them across the frontend and backend (reducing possible errors). Next, we create function called `processToolCalls` which takes in the `messages`, `tools`, and the `datastream`. It also takes in a second parameter, `executeFunction`, which is an object that maps `toolName` to the functions that will be run upon human confirmation. This function is strongly typed so:

-   it autocompletes `executableTools` - these are tools without an execute function
-   provides full type-safety for arguments and options available within the `execute` function

Unlike the low-level example, this will return a modified array of `messages` that can be passed directly to the LLM.

Finally, you declare a function called `getToolsRequiringConfirmation` that takes your tools as an argument and then will return the names of your tools without execute functions (in an array of strings). This avoids the need to manually write out and check for `toolName`'s on the frontend.

In order to use these utility functions, you will need to move tool declarations to their own file:

tools.ts

```
import{ tool }from'ai';import{ z }from'zod';const getWeatherInformation =tool({  description:'show the weather in a given city to the user',  parameters: z.object({ city: z.string()}),// no execute function, we want human in the loop});const getLocalTime =tool({  description:'get the local time for a specified location',  parameters: z.object({location: z.string()}),// including execute function -> no confirmation requiredexecute:async({location})=>{console.log(`Getting local time for ${location}`);return'10am';},});exportconst tools ={  getWeatherInformation,  getLocalTime,};
```

In this file, you have two tools, `getWeatherInformation` (requires confirmation to run) and `getLocalTime`.


### [Update Route Handler](#update-route-handler)


Update your route handler to use the `processToolCalls` utility function.

app/api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{ createDataStreamResponse,Message, streamText }from'ai';import{ processToolCalls }from'./utils';import{ tools }from'./tools';// Allow streaming responses up to 30 secondsexportconst maxDuration =30;exportasyncfunctionPOST(req:Request){const{ messages }:{ messages:Message[]}=await req.json();returncreateDataStreamResponse({execute:async dataStream =>{// Utility function to handle tools that require human confirmation// Checks for confirmation in last message and then runs associated toolconst processedMessages =awaitprocessToolCalls({          messages,          dataStream,          tools,},{// type-safe object for tools without an execute functiongetWeatherInformation:async({ city })=>{const conditions =['sunny','cloudy','rainy','snowy'];return`The weather in ${city} is ${              conditions[Math.floor(Math.random()* conditions.length)]}.`;},},);const result =streamText({        model:openai('gpt-4o'),        messages: processedMessages,        tools,});      result.mergeIntoDataStream(dataStream);},});}
```


### [Update Frontend](#update-frontend)


Finally, update the frontend to use the new `getToolsRequiringConfirmation` function and the `APPROVAL` values:

app/page.tsx

```
'use client';import{Message, useChat }from'@ai-sdk/react';import{APPROVAL,  getToolsRequiringConfirmation,}from'../api/use-chat-human-in-the-loop/utils';import{ tools }from'../api/use-chat-human-in-the-loop/tools';exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit, addToolResult }=useChat({      maxSteps:5,});const toolsRequiringConfirmation =getToolsRequiringConfirmation(tools);// used to disable input while confirmation is pendingconst pendingToolCallConfirmation = messages.some((m: Message)=>    m.parts?.some(part=>        part.type==='tool-invocation'&&        part.toolInvocation.state ==='call'&&        toolsRequiringConfirmation.includes(part.toolInvocation.toolName),),);return(<divclassName="flex flex-col w-full max-w-md py-24 mx-auto stretch">{messages?.map((m: Message)=>(<divkey={m.id}className="whitespace-pre-wrap"><strong>{`${m.role}: `}</strong>{m.parts?.map((part, i)=>{switch(part.type){case'text':return<divkey={i}>{part.text}</div>;case'tool-invocation':const toolInvocation = part.toolInvocation;const toolCallId = toolInvocation.toolCallId;const dynamicInfoStyles ='font-mono bg-gray-100 p-1 text-sm';// render confirmation tool (client-side tool with user interaction)if(                  toolsRequiringConfirmation.includes(                    toolInvocation.toolName,)&&                  toolInvocation.state ==='call'){return(<divkey={toolCallId}className="text-gray-500">Run{' '}<spanclassName={dynamicInfoStyles}>{toolInvocation.toolName}</span>{' '}with args:{' '}<spanclassName={dynamicInfoStyles}>{JSON.stringify(toolInvocation.args)}</span><divclassName="flex gap-2 pt-2"><buttonclassName="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"onClick={()=>addToolResult({                              toolCallId,                              result:APPROVAL.YES,})}>Yes</button><buttonclassName="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"onClick={()=>addToolResult({                              toolCallId,                              result:APPROVAL.NO,})}>No</button></div></div>);}}})}<br/></div>))}<formonSubmit={handleSubmit}><inputdisabled={pendingToolCallConfirmation}className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"value={input}placeholder="Say something..."onChange={handleInputChange}/></form></div>);}
```


## [Full Example](#full-example)


To see this code in action, check out the [`next-openai` example](https://github.com/vercel/ai/tree/main/examples/next-openai) in the AI SDK repository. Navigate to the `/use-chat-human-in-the-loop` page and associated route handler.
