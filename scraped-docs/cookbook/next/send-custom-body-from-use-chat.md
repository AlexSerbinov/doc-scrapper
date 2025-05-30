# Send Custom Body from useChat


---
url: https://ai-sdk.dev/cookbook/next/send-custom-body-from-use-chat
description: Learn how to send a custom body from the useChat hook using the AI SDK and Next.js
---


# [Send Custom Body from useChat](#send-custom-body-from-usechat)


`experimental_prepareRequestBody` is an experimental feature and only available in React, Solid and Vue.

By default, `useChat` sends all messages as well as information from the request to the server. However, it is often desirable to control the body content that is sent to the server, e.g. to:

-   only send the last message
-   send additional data along with the message
-   change the structure of the request body

The `experimental_prepareRequestBody` option allows you to customize the body content that is sent to the server. The function receives the message list, the request data, and the request body from the append call. It should return the body content that will be sent to the server.


## [Example](#example)


This example shows how to only send the text of the last message to the server. This can be useful if you want to reduce the amount of data sent to the server.


### [Client](#client)


app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit }=useChat({experimental_prepareRequestBody:({ messages })=>{// e.g. only the text of the last message:return messages[messages.length-1].content;},});return(<div>{messages.map(m =>(<div key={m.id}>{m.role==='user'?'User: ':'AI: '}{m.content}</div>))}<form onSubmit={handleSubmit}><input value={input} onChange={handleInputChange}/></form></div>);}
```


### [Server](#server)


We need to adjust the server to only receive the text of the last message. The rest of the message history can be loaded from storage.

app/api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai'import{ streamText }from'ai'// Allow streaming responses up to 30 secondsexportconst maxDuration =30exportasyncfunctionPOST(req: Request){// we receive only the text from the last messageconst text =await req.json()// e.g. load message history from storageconst history =awaitloadHistory()// Call the language modelconst result =streamText({    model:openai('gpt-4-turbo'),    messages:[...history,{ role:'user', content: text }]onFinish({ text }){// e.g. save the message and the response to storage}})// Respond with the streamreturn result.toDataStreamResponse()}
```
