# Generate Text with Chat Prompt


---
url: https://ai-sdk.dev/cookbook/next/generate-text-with-chat-prompt
description: Learn how to generate text with chat prompt using the AI SDK and Next.js
---


# [Generate Text with Chat Prompt](#generate-text-with-chat-prompt)


Previously, you were able to generate text and objects using either a single message prompt, a system prompt, or a combination of both of them. However, there may be times when you want to generate text based on a series of messages.

A chat completion allows you to generate text based on a series of messages. This series of messages can be any series of interactions between any number of systems, but the most popular and relatable use case has been a series of messages that represent a conversation between a user and a model.

http://localhost:3000

User: How is it going?

Assistant: All good, how may I help you?

Why is the sky blue?

Send Message


## [Client](#client)


Let's start by creating a simple chat interface with an input field that sends the user's message and displays the conversation history. You will call the `/api/chat` endpoint to generate the assistant's response.

app/page.tsx

```
'use client';import{CoreMessage}from'ai';import{ useState }from'react';exportdefaultfunctionPage(){const[input, setInput]=useState('');const[messages, setMessages]=useState<CoreMessage[]>([]);return(<div><input        value={input}        onChange={event=>{setInput(event.target.value);}}        onKeyDown={asyncevent=>{if(event.key ==='Enter'){setMessages(currentMessages=>[...currentMessages,{ role:'user', content: input },]);const response =awaitfetch('/api/chat',{              method:'POST',              body:JSON.stringify({                messages:[...messages,{ role:'user', content: input }],}),});const{ messages: newMessages }=await response.json();setMessages(currentMessages=>[...currentMessages,...newMessages,]);}}}/>{messages.map((message, index)=>(<divkey={`${message.role}-${index}`}>{typeof message.content ==='string'? message.content: message.content.filter(part=> part.type==='text').map((part, partIndex)=>(<divkey={partIndex}>{part.text}</div>))}</div>))}</div>);}
```


## [Server](#server)


Next, let's create the `/api/chat` endpoint that generates the assistant's response based on the conversation history.

app/api/chat/route.ts

```
import{CoreMessage, generateText }from'ai';import{ openai }from'@ai-sdk/openai';exportasyncfunctionPOST(req:Request){const{ messages }:{ messages:CoreMessage[]}=await req.json();const{ response }=awaitgenerateText({    model:openai('gpt-4'),    system:'You are a helpful assistant.',    messages,});returnResponse.json({ messages: response.messages});}
```

[

View Example on GitHub

](https://github.com/vercel/ai/blob/main/examples/next-openai-pages/pages/chat/generate-chat/index.tsx)
