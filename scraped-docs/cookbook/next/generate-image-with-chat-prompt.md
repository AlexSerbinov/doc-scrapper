# Generate Image with Chat Prompt


---
url: https://ai-sdk.dev/cookbook/next/generate-image-with-chat-prompt
description: Learn how to generate an image with a chat prompt using the AI SDK and Next.js
---


# [Generate Image with Chat Prompt](#generate-image-with-chat-prompt)


When building a chatbot, you may want to allow the user to generate an image. This can be done by creating a tool that generates an image using the [`experimental_generateImage`](/docs/reference/ai-sdk-core/generate-image#generateimage) function from the AI SDK.


## [Server](#server)


Let's create an endpoint at `/api/chat` that generates the assistant's response based on the conversation history. You will also define a tool called `generateImage` that will generate an image based on the assistant's response.

app/api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{ experimental_generateImage,Message, streamText, tool }from'ai';import{ z }from'zod';exportasyncfunctionPOST(request:Request){const{ messages }:{ messages:Message[]}=await request.json();// filter through messages and remove base64 image data to avoid sending to the modelconst formattedMessages = messages.map(m =>{if(m.role==='assistant'&& m.toolInvocations){      m.toolInvocations.forEach(ti =>{if(ti.toolName==='generateImage'&& ti.state==='result'){          ti.result.image=`redacted-for-length`;}});}return m;});const result =streamText({    model:openai('gpt-4o'),    messages: formattedMessages,    tools:{      generateImage:tool({        description:'Generate an image',        parameters: z.object({          prompt: z.string().describe('The prompt to generate the image from'),}),execute:async({ prompt })=>{const{ image }=awaitexperimental_generateImage({            model: openai.image('dall-e-3'),            prompt,});// in production, save this image to blob storage and return a URLreturn{ image: image.base64, prompt };},}),},});return result.toDataStreamResponse();}
```

In production, you should save the generated image to a blob storage and return a URL instead of the base64 image data. If you don't, the base64 image data will be sent to the model which may cause the generation to fail.


## [Client](#client)


Let's create a simple chat interface with `useChat`. You will call the `/api/chat` endpoint to generate the assistant's response. If the assistant's response contains a `generateImage` tool invocation, you will display the tool result (the image in base64 format and the prompt) using the Next `Image` component.

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';importImagefrom'next/image';exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit }=useChat();return(<divclassName="flex flex-col w-full max-w-md py-24 mx-auto stretch"><divclassName="space-y-4">{messages.map(m=>(<divkey={m.id}className="whitespace-pre-wrap"><divkey={m.id}><divclassName="font-bold">{m.role}</div>{m.toolInvocations ?(                m.toolInvocations.map(ti=>                  ti.toolName ==='generateImage'?(                    ti.state ==='result'?(<Imagekey={ti.toolCallId}src={`data:image/png;base64,${ti.result.image}`}alt={ti.result.prompt}height={400}width={400}/>):(<divkey={ti.toolCallId}className="animate-pulse">Generating image...</div>)):null,)):(<p>{m.content}</p>)}</div></div>))}</div><formonSubmit={handleSubmit}><inputclassName="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"value={input}placeholder="Say something..."onChange={handleInputChange}/></form></div>);}
```
