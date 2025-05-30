# Stream Text with Image Prompt


---
url: https://ai-sdk.dev/cookbook/next/stream-text-with-image-prompt
description: Learn how to stream text with an image prompt using the AI SDK and Next.js
---


# [Stream Text with Image Prompt](#stream-text-with-image-prompt)


Vision models such as GPT-4 can process both text and images. In this example, we will show you how to send an image URL along with the user's message to the model.


## [Using Image URLs](#using-image-urls)



### [Server](#server)


We split the user's message into two parts: the text and the image URL. We then send both parts to the model. The last message is the user's message, and we add the image URL to it.

app/api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{ streamText }from'ai';exportconst maxDuration =60;exportasyncfunctionPOST(req: Request){// 'data' contains the additional data that you have sent:const{ messages, data }=await req.json();const initialMessages = messages.slice(0,-1);const currentMessage = messages[messages.length -1];// Call the language modelconst result =streamText({    model:openai('gpt-4-turbo'),    messages:[...initialMessages,{        role:'user',        content:[{type:'text', text: currentMessage.content },{type:'image', image:newURL(data.imageUrl)},],},],});// Respond with the streamreturn result.toDataStreamResponse();}
```


### [Client](#client)


On the client we can send the image URL along with the user's message by adding the `data` object to the `handleSubmit` function. You can replace the `imageUrl` with the actual URL of the image you want to send.

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';// Allow streaming responses up to 30 secondsexportconst maxDuration =30;exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit }=useChat();return(<div>{messages.map(m =>(<div key={m.id}>{m.role==='user'?'User: ':'AI: '}{m.content}</div>))}<form        onSubmit={e =>{handleSubmit(e,{            data:{ imageUrl:'https://somewhere.com/image.png'},});}}><input          value={input}          placeholder="What does the image show..."          onChange={handleInputChange}/></form></div>);}
```
