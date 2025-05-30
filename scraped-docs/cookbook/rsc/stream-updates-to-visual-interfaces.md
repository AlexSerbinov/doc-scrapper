# Stream Updates to Visual Interfaces


---
url: https://ai-sdk.dev/cookbook/rsc/stream-updates-to-visual-interfaces
description: Learn how to generate text using the AI SDK and React Server Components.
---


# [Stream Updates to Visual Interfaces](#stream-updates-to-visual-interfaces)


In our previous example we've been streaming react components from the server to the client. By streaming the components, we open up the possibility to update these components based on state changes that occur in the server.


## [Client](#client)


app/page.tsx

```
'use client';import{ useState }from'react';import{ClientMessage}from'./actions';import{ useActions, useUIState }from'ai/rsc';import{ generateId }from'ai';// Allow streaming responses up to 30 secondsexportconst maxDuration =30;exportdefaultfunctionHome(){const[input, setInput]=useState<string>('');const[conversation, setConversation]=useUIState();const{ continueConversation }=useActions();return(<div><div>{conversation.map((message: ClientMessage)=>(<divkey={message.id}>{message.role}:{message.display}</div>))}</div><div><inputtype="text"value={input}onChange={event=>{setInput(event.target.value);}}/><buttononClick={async()=>{setConversation((currentConversation: ClientMessage[])=>[...currentConversation,{ id:generateId(), role:'user', display: input },]);const message =awaitcontinueConversation(input);setConversation((currentConversation: ClientMessage[])=>[...currentConversation,              message,]);}}>SendMessage</button></div></div>);}
```


## [Server](#server)


app/actions.tsx

```
'use server';import{ getMutableAIState, streamUI }from'ai/rsc';import{ openai }from'@ai-sdk/openai';import{ReactNode}from'react';import{ z }from'zod';import{ generateId }from'ai';exportinterfaceServerMessage{  role:'user'|'assistant';  content:string;}exportinterfaceClientMessage{  id:string;  role:'user'|'assistant';  display:ReactNode;}exportasyncfunctioncontinueConversation(input: string,):Promise<ClientMessage>{'use server';const history =getMutableAIState();const result =awaitstreamUI({    model:openai('gpt-3.5-turbo'),    messages:[...history.get(),{ role:'user', content: input }],text:({ content, done })=>{if(done){        history.done((messages: ServerMessage[])=>[...messages,{ role:'assistant', content },]);}return<div>{content}</div>;},    tools:{      deploy:{        description:'Deploy repository to vercel',        parameters: z.object({          repositoryName: z.string().describe('The name of the repository, example: vercel/ai-chatbot'),}),generate:asyncfunction*({ repositoryName }){yield<div>Cloning repository {repositoryName}...</div>;// [!code highlight:5]awaitnewPromise(resolve=>setTimeout(resolve,3000));yield<div>Building repository {repositoryName}...</div>;awaitnewPromise(resolve=>setTimeout(resolve,2000));return<div>{repositoryName} deployed!</div>;},},},});return{    id:generateId(),    role:'assistant',    display: result.value,};}
```

app/ai.ts

```
import{ createAI }from'ai/rsc';import{ServerMessage,ClientMessage, continueConversation }from'./actions';exportconstAI=createAI<ServerMessage[],ClientMessage[]>({  actions:{    continueConversation,},  initialAIState:[],  initialUIState:[],});
```
