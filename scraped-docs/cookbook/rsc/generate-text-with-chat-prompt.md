# Generate Text with Chat Prompt


---
url: https://ai-sdk.dev/cookbook/rsc/generate-text-with-chat-prompt
description: Learn how to generate text with chat prompt using the AI SDK and React Server Components.
---


# [Generate Text with Chat Prompt](#generate-text-with-chat-prompt)


Previously, we were able to generate text and objects using either a single message prompt, a system prompt, or a combination of both of them. However, there may be times when you want to generate text based on a series of messages.

A chat completion allows you to generate text based on a series of messages. This series of messages can be any series of interactions between any number of systems, but the most popular and relatable use case has been a series of messages that represent a conversation between a user and a model.

http://localhost:3000

User: How is it going?

Assistant: All good, how may I help you?

Why is the sky blue?

Send Message


## [Client](#client)


Let's create a simple conversation between a user and a model, and place a button that will call `continueConversation`.

app/page.tsx

```
'use client';import{ useState }from'react';import{Message, continueConversation }from'./actions';// Allow streaming responses up to 30 secondsexportconst maxDuration =30;exportdefaultfunctionHome(){const[conversation, setConversation]=useState<Message[]>([]);const[input, setInput]=useState<string>('');return(<div><div>{conversation.map((message, index)=>(<divkey={index}>{message.role}:{message.content}</div>))}</div><div><inputtype="text"value={input}onChange={event=>{setInput(event.target.value);}}/><buttononClick={async()=>{const{ messages }=awaitcontinueConversation([...conversation,{ role:'user', content: input },]);setConversation(messages);}}>SendMessage</button></div></div>);}
```


## [Server](#server)


Now, let's implement the `continueConversation` function that will insert the user's message into the conversation and generate a response.

app/actions.ts

```
'use server';import{ generateText }from'ai';import{ openai }from'@ai-sdk/openai';exportinterfaceMessage{  role:'user'|'assistant';  content:string;}exportasyncfunctioncontinueConversation(history:Message[]){'use server';const{ text }=awaitgenerateText({    model:openai('gpt-3.5-turbo'),    system:'You are a friendly assistant!',    messages: history,});return{    messages:[...history,{        role:'assistant'asconst,        content: text,},],};}
```
