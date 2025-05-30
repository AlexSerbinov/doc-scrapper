# Restore Messages from Database


---
url: https://ai-sdk.dev/cookbook/rsc/restore-messages-from-database
description: Learn how to restore messages from an external database using the AI SDK and React Server Components
---


# [Restore Messages from Database](#restore-messages-from-database)


When building AI applications, you might want to restore previous conversations from a database to allow users to continue their conversations or review past interactions. The AI SDK provides mechanisms to restore conversation state through `initialAIState` and `onGetUIState`.


## [Client](#client)


app/layout.tsx

```
import{ServerMessage}from'./actions';import{AI}from'./ai';exportdefaultfunctionRootLayout({  children,}: Readonly<{  children: React.ReactNode;}>){// Fetch stored messages from your databaseconst savedMessages:ServerMessage[]=getSavedMessages();return(<htmllang="en"><body><AIinitialAIState={savedMessages}initialUIState={[]}>{children}</AI></body></html>);}
```

app/page.tsx

```
'use client';import{ useState, useEffect }from'react';import{ClientMessage}from'./actions';import{ useActions, useUIState }from'ai/rsc';import{ generateId }from'ai';exportdefaultfunctionHome(){const[conversation, setConversation]=useUIState();const[input, setInput]=useState<string>('');const{ continueConversation }=useActions();return(<div><divclassName="conversation-history">{conversation.map((message: ClientMessage)=>(<divkey={message.id}className={`message ${message.role}`}>{message.role}:{message.display}</div>))}</div><divclassName="input-area"><inputtype="text"value={input}onChange={e=>setInput(e.target.value)}placeholder="Type your message..."/><buttononClick={async()=>{// Add user message to UIsetConversation((currentConversation: ClientMessage[])=>[...currentConversation,{ id:generateId(), role:'user', display: input },]);// Get AI responseconst message =awaitcontinueConversation(input);// Add AI response to UIsetConversation((currentConversation: ClientMessage[])=>[...currentConversation,              message,]);setInput('');}}>Send</button></div></div>);}
```


## [Server](#server)


The server-side implementation handles the restoration of messages and their transformation into the appropriate format for display.

app/ai.ts

```
import{ createAI }from'ai/rsc';import{ServerMessage,ClientMessage, continueConversation }from'./actions';import{Stock}from'@ai-studio/components/stock';import{ generateId }from'ai';exportconstAI=createAI<ServerMessage[],ClientMessage[]>({  actions:{    continueConversation,},onGetUIState:async()=>{'use server';// Get the current AI state (stored messages)const history:ServerMessage[]=getAIState();// Transform server messages into client messagesreturn history.map(({ role, content })=>({      id:generateId(),      role,      display:        role ==='function'?<Stock{...JSON.parse(content)}/>: content,}));},});
```

app/actions.tsx

```
'use server';import{ getAIState }from'ai/rsc';exportinterfaceServerMessage{  role:'user'|'assistant'|'function';  content:string;}exportinterfaceClientMessage{  id:string;  role:'user'|'assistant'|'function';  display:ReactNode;}// Function to get saved messages from databaseexportasyncfunctiongetSavedMessages():Promise<ServerMessage[]>{'use server';// Implement your database fetching logic herereturnawaitfetchMessagesFromDatabase();}
```
