# Chat with PDFs


---
url: https://ai-sdk.dev/cookbook/next/chat-with-pdf
description: Learn how to build a chatbot that can understand PDFs using the AI SDK and Next.js
---


# [Chat with PDFs](#chat-with-pdfs)


Some language models like Anthropic's Claude Sonnet 3.5 and Google's Gemini 2.0 can understand PDFs and respond to questions about their contents. In this example, we'll show you how to build a chat interface that accepts PDF uploads.

This example requires a provider that supports PDFs, such as Anthropic's Claude 3.7, Google's Gemini 2.5, or OpenAI's GPT-4.1. Check the [provider documentation](/providers/ai-sdk-providers) for up-to-date support information.


## [Implementation](#implementation)



### [Server](#server)


Create a route handler that will use Anthropic's Claude model to process messages and PDFs:

app/api/chat/route.ts

```
import{ anthropic }from'@ai-sdk/anthropic';import{ streamText }from'ai';exportconst maxDuration =30;exportasyncfunctionPOST(req: Request){const{ messages }=await req.json();const result =streamText({    model:anthropic('claude-3-5-sonnet-latest'),    messages,});return result.toDataStreamResponse();}
```


### [Client](#client)


Create a chat interface that allows uploading PDFs alongside messages:

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';import{ useRef, useState }from'react';importImagefrom'next/image';exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit }=useChat();const[files, setFiles]=useState<FileList|undefined>(undefined);const fileInputRef =useRef<HTMLInputElement>(null);return(<divclassName="flex flex-col w-full max-w-md py-24 mx-auto stretch">{messages.map(m=>(<divkey={m.id}className="whitespace-pre-wrap">{m.role ==='user'?'User: ':'AI: '}{m.content}<div>{m?.experimental_attachments?.filter(attachment=>                  attachment?.contentType?.startsWith('image/')|                  attachment?.contentType?.startsWith('application/pdf'),).map((attachment, index)=>                attachment.contentType?.startsWith('image/')?(<Imagekey={`${m.id}-${index}`}src={attachment.url}width={500}height={500}alt={attachment.name ??`attachment-${index}`}/>): attachment.contentType?.startsWith('application/pdf')?(<iframekey={`${m.id}-${index}`}src={attachment.url}width="500"height="600"title={attachment.name ??`attachment-${index}`}/>):null,)}</div></div>))}<formclassName="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl space-y-2"onSubmit={event=>{handleSubmit(event,{            experimental_attachments: files,});setFiles(undefined);if(fileInputRef.current){            fileInputRef.current.value ='';}}}><inputtype="file"className=""onChange={event=>{if(event.target.files){setFiles(event.target.files);}}}multipleref={fileInputRef}/><inputclassName="w-full p-2"value={input}placeholder="Say something..."onChange={handleInputChange}/></form></div>);}
```

The code uses the `useChat` hook which handles the file upload and message streaming. The `experimental_attachments` option allows you to send files alongside messages.

Make sure to set up your environment variables with your Anthropic API key:

.env.local

```
ANTHROPIC_API_KEY=xxxxxxxxx
```

Now you can upload PDFs and ask questions about their contents. The LLM will analyze the PDF and provide relevant responses based on the document's content.
