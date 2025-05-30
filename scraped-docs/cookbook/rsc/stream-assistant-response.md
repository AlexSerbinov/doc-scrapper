# Stream Assistant Responses


---
url: https://ai-sdk.dev/cookbook/rsc/stream-assistant-response
description: Learn how to generate text using the AI SDK and React Server Components.
---


# [Stream Assistant Responses](#stream-assistant-responses)


In this example, you'll learn how to stream responses from OpenAI's [Assistant API](https://platform.openai.com/docs/assistants/overview) using `ai/rsc`.


## [Client](#client)


In your client component, you will create a simple chat interface that allows users to send messages to the assistant and receive responses. The assistant's responses will be streamed in two parts: the status of the current run and the text content of the messages.

app/page.tsx

```
'use client';import{ useState }from'react';import{ClientMessage}from'./actions';import{ useActions }from'ai/rsc';exportdefaultfunctionHome(){const[input, setInput]=useState('');const[messages, setMessages]=useState<ClientMessage[]>([]);const{ submitMessage }=useActions();consthandleSubmission=async()=>{setMessages(currentMessages=>[...currentMessages,{        id:'123',        status:'user.message.created',        text: input,        gui:null,},]);const response =awaitsubmitMessage(input);setMessages(currentMessages=>[...currentMessages, response]);setInput('');};return(<divclassName="flex flex-col-reverse"><divclassName="flex flex-row gap-2 p-2 bg-zinc-100 w-full"><inputclassName="bg-zinc-100 w-full p-2 outline-none"value={input}onChange={event=>setInput(event.target.value)}placeholder="Ask a question"onKeyDown={event=>{if(event.key ==='Enter'){handleSubmission();}}}/><buttonclassName="p-2 bg-zinc-900 text-zinc-100 rounded-md"onClick={handleSubmission}>Send</button></div><divclassName="flex flex-col h-[calc(100dvh-56px)] overflow-y-scroll"><div>{messages.map(message=>(<divkey={message.id}className="flex flex-col gap-1 border-b p-2"><divclassName="flex flex-row justify-between"><divclassName="text-sm text-zinc-500">{message.status}</div></div><div>{message.text}</div></div>))}</div></div></div>);}
```

app/message.tsx

```
'use client';import{StreamableValue, useStreamableValue }from'ai/rsc';exportfunctionMessage({ textStream }:{ textStream: StreamableValue }){const[text]=useStreamableValue(textStream);return<div>{text}</div>;}
```


## [Server](#server)


In your server action, you will create a function called `submitMessage` that adds the user's message to the thread. The function will create a new thread if one does not exist and add the user's message to the thread. If a thread already exists, the function will add the user's message to the existing thread. The function will then create a run and stream the assistant's response to the client. Furthermore, the run queue is used to manage multiple runs in the same thread during the lifetime of the server action.

app/actions.tsx

```
'use server';import{ generateId }from'ai';import{ createStreamableUI, createStreamableValue }from'ai/rsc';import{OpenAI}from'openai';import{ReactNode}from'react';import{Message}from'./message';const openai =newOpenAI({  apiKey: process.env.OPENAI_API_KEY,});exportinterfaceClientMessage{  id:string;  status:ReactNode;  text:ReactNode;}constASSISTANT_ID='asst_xxxx';letTHREAD_ID='';letRUN_ID='';exportasyncfunctionsubmitMessage(question: string):Promise<ClientMessage>{const statusUIStream =createStreamableUI('thread.init');const textStream =createStreamableValue('');const textUIStream =createStreamableUI(<MessagetextStream={textStream.value}/>,);const runQueue =[];(async()=>{if(THREAD_ID){await openai.beta.threads.messages.create(THREAD_ID,{        role:'user',        content: question,});const run =await openai.beta.threads.runs.create(THREAD_ID,{        assistant_id:ASSISTANT_ID,        stream:true,});      runQueue.push({ id:generateId(), run });}else{const run =await openai.beta.threads.createAndRun({        assistant_id:ASSISTANT_ID,        stream:true,        thread:{          messages:[{ role:'user', content: question }],},});      runQueue.push({ id:generateId(), run });}while(runQueue.length >0){const latestRun = runQueue.shift();if(latestRun){forawait(const delta of latestRun.run){const{ data, event }= delta;          statusUIStream.update(event);if(event ==='thread.created'){THREAD_ID= data.id;}elseif(event ==='thread.run.created'){RUN_ID= data.id;}elseif(event ==='thread.message.delta'){            data.delta.content?.map(part=>{if(part.type==='text'){if(part.text){                  textStream.append(part.text.value asstring);}}});}elseif(event ==='thread.run.failed'){console.error(data);}}}}    statusUIStream.done();    textStream.done();})();return{    id:generateId(),    status: statusUIStream.value,    text: textUIStream.value,};}
```

app/ai.ts

```
import{ createAI }from'ai/rsc';import{ submitMessage }from'./actions';exportconstAI=createAI({  actions:{    submitMessage,},  initialAIState:[],  initialUIState:[],});
```

And finally, make sure to update your layout component to wrap the children with the `AI` component.

app/layout.tsx

```
import{ReactNode}from'react';import{AI}from'./ai';exportdefaultfunctionLayout({ children }:{ children: ReactNode }){return<AI>{children}</AI>;}
```
