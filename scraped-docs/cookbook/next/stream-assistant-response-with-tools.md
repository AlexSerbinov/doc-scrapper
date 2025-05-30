# Stream Assistant Response with Tools


---
url: https://ai-sdk.dev/cookbook/next/stream-assistant-response-with-tools
description: Learn how to stream OpenAI Assistant's response using the AI SDK and Next.js
---


# [Stream Assistant Response with Tools](#stream-assistant-response-with-tools)


Let's create a simple chat interface that allows users to send messages to the assistant and receive responses and give it the ability to use tools. You will integrate the `useAssistant` hook from `@ai-sdk/react` to stream the messages and status.

You will need to provide the list of tools on the OpenAI [Assistant Dashboard](https://platform.openai.com/assistants). You can use the following schema to create a tool to convert celsius to fahrenheit.

```
{"name":"celsiusToFahrenheit","description":"convert celsius to fahrenheit.","parameters":{"type":"object","properties":{"value":{"type":"number","description":"the value in celsius."}},"required":["value"]}}
```


## [Client](#client)


Let's create a simple chat interface that allows users to send messages to the assistant and receive responses. You will integrate the `useAssistant` hook from `@ai-sdk/react` to stream the messages and status.

app/page.tsx

```
'use client';import{Message, useAssistant }from'@ai-sdk/react';exportdefaultfunctionPage(){const{ status, messages, input, submitMessage, handleInputChange }=useAssistant({ api:'/api/assistant'});return(<divclassName="flex flex-col gap-2"><divclassName="p-2">status:{status}</div><divclassName="flex flex-col p-2 gap-2">{messages.map((message: Message)=>(<divkey={message.id}className="flex flex-row gap-2"><divclassName="w-24 text-zinc-500">{`${message.role}: `}</div><divclassName="w-full">{message.content}</div></div>))}</div><formonSubmit={submitMessage}className="fixed bottom-0 p-2 w-full"><inputdisabled={status !=='awaiting_message'}value={input}onChange={handleInputChange}className="bg-zinc-100 w-full p-2"/></form></div>);}
```


## [Server](#server)


Next, you will create an API route for `api/assistant` to handle the assistant's messages and responses. You will use the `AssistantResponse` function from `ai` to stream the assistant's responses back to the `useAssistant` hook on the client.

app/api/assistant/route.ts

```
import{AssistantResponse}from'ai';importOpenAIfrom'openai';const openai =newOpenAI({  apiKey: process.env.OPENAI_API_KEY|'',});exportasyncfunctionPOST(req: Request){const input:{    threadId:string|null;    message:string;}=await req.json();const threadId = input.threadId ??(await openai.beta.threads.create({})).id;const createdMessage =await openai.beta.threads.messages.create(threadId,{    role:'user',    content: input.message,});returnAssistantResponse({ threadId, messageId: createdMessage.id },async({ forwardStream })=>{const runStream = openai.beta.threads.runs.stream(threadId,{        assistant_id:          process.env.ASSISTANT_ID??(()=>{thrownewError('ASSISTANT_ID is not set');})(),});let runResult =awaitforwardStream(runStream);while(        runResult?.status ==='requires_action'&&        runResult.required_action?.type==='submit_tool_outputs'){const tool_outputs =          runResult.required_action.submit_tool_outputs.tool_calls.map((toolCall: any)=>{const parameters =JSON.parse(toolCall.function.arguments);switch(toolCall.function.name){case'celsiusToFahrenheit':const celsius =parseFloat(parameters.value);const fahrenheit = celsius *(9/5)+32;return{                    tool_call_id: toolCall.id,                    output:`${celsius}°C is ${fahrenheit.toFixed(2)}°F`,};default:thrownewError(`Unknown tool call function: ${toolCall.function.name}`,);}},);        runResult =awaitforwardStream(          openai.beta.threads.runs.submitToolOutputsStream(            threadId,            runResult.id,{ tool_outputs },),);}},);}
```

[

View Example on GitHub

](https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/assistants/stream-assistant-response-with-tools/index.tsx)
