# OpenAI Assistants


---
url: https://ai-sdk.dev/docs/ai-sdk-ui/openai-assistants
description: Learn how to use the useAssistant hook.
---


# [OpenAI Assistants](#openai-assistants)


The `useAssistant` hook allows you to handle the client state when interacting with an OpenAI compatible assistant API. This hook is useful when you want to integrate assistant capabilities into your application, with the UI updated automatically as the assistant is streaming its execution.

The `useAssistant` hook is supported in `@ai-sdk/react`, `ai/svelte`, and `ai/vue`.


## [Example](#example)


app/page.tsx

```
'use client';import{Message, useAssistant }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ status, messages, input, submitMessage, handleInputChange }=useAssistant({ api:'/api/assistant'});return(<div>{messages.map((m: Message)=>(<divkey={m.id}><strong>{`${m.role}: `}</strong>{m.role !=='data'&& m.content}{m.role ==='data'&&(<>{(m.data asany).description}<br/><preclassName={'bg-gray-200'}>{JSON.stringify(m.data,null,2)}</pre></>)}</div>))}{status ==='in_progress'&&<div/>}<formonSubmit={submitMessage}><inputdisabled={status !=='awaiting_message'}value={input}placeholder="What is the temperature in the living room?"onChange={handleInputChange}/></form></div>);}
```

app/api/assistant/route.ts

```
import{AssistantResponse}from'ai';importOpenAIfrom'openai';const openai =newOpenAI({  apiKey: process.env.OPENAI_API_KEY|'',});// Allow streaming responses up to 30 secondsexportconst maxDuration =30;exportasyncfunctionPOST(req: Request){// Parse the request bodyconst input:{    threadId:string|null;    message:string;}=await req.json();// Create a thread if neededconst threadId = input.threadId ??(await openai.beta.threads.create({})).id;// Add a message to the threadconst createdMessage =await openai.beta.threads.messages.create(threadId,{    role:'user',    content: input.message,});returnAssistantResponse({ threadId, messageId: createdMessage.id },async({ forwardStream, sendDataMessage })=>{// Run the assistant on the threadconst runStream = openai.beta.threads.runs.stream(threadId,{        assistant_id:          process.env.ASSISTANT_ID??(()=>{thrownewError('ASSISTANT_ID is not set');})(),});// forward run status would stream message deltaslet runResult =awaitforwardStream(runStream);// status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expiredwhile(        runResult?.status ==='requires_action'&&        runResult.required_action?.type==='submit_tool_outputs'){const tool_outputs =          runResult.required_action.submit_tool_outputs.tool_calls.map((toolCall: any)=>{const parameters =JSON.parse(toolCall.function.arguments);switch(toolCall.function.name){// configure your tool calls heredefault:thrownewError(`Unknown tool call function: ${toolCall.function.name}`,);}},);        runResult =awaitforwardStream(          openai.beta.threads.runs.submitToolOutputsStream(            threadId,            runResult.id,{ tool_outputs },),);}},);}
```


## [Customized UI](#customized-ui)


`useAssistant` also provides ways to manage the chat message and input states via code and show loading and error states.


### [Loading and error states](#loading-and-error-states)


To show a loading spinner while the assistant is running the thread, you can use the `status` state returned by the `useAssistant` hook:

```
const{ status,...}=useAssistant()return(<>{status ==="in_progress"?<Spinner/>:null}</>)
```

Similarly, the `error` state reflects the error object thrown during the fetch request. It can be used to display an error message, or show a toast notification:

```
const{ error,...}=useAssistant()useEffect(()=>{if(error){    toast.error(error.message)}},[error])// Or display the error message in the UI:return(<>{error ?<div>{error.message}</div>:null}</>)
```


### [Controlled input](#controlled-input)


In the initial example, we have `handleSubmit` and `handleInputChange` callbacks that manage the input changes and form submissions. These are handy for common use cases, but you can also use uncontrolled APIs for more advanced scenarios such as form validation or customized components.

The following example demonstrates how to use more granular APIs like `append` with your custom input and submit button components:

```
const{ append }=useAssistant();return(<><MySubmitButtononClick={()=>{// Send a new message to the AI providerappend({          role:'user',          content: input,});}}/></>);
```


## [Configure Request Options](#configure-request-options)


By default, the `useAssistant` hook sends a HTTP POST request to the `/api/assistant` endpoint with the prompt as part of the request body. You can customize the request by passing additional options to the `useAssistant` hook:

```
const{ messages, input, handleInputChange, handleSubmit }=useAssistant({  api:'/api/custom-completion',  headers:{Authorization:'your_token',},  body:{    user_id:'123',},  credentials:'same-origin',});
```

In this example, the `useAssistant` hook sends a POST request to the `/api/custom-completion` endpoint with the specified headers, additional body fields, and credentials for that fetch request. On your server side, you can handle the request with these additional information.
