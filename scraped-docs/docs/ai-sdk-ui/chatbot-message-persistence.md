# Chatbot Message Persistence


---
url: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence
description: Learn how to store and load chat messages in a chatbot.
---


# [Chatbot Message Persistence](#chatbot-message-persistence)


Being able to store and load chat messages is crucial for most AI chatbots. In this guide, we'll show how to implement message persistence with `useChat` and `streamText`.

This guide does not cover authorization, error handling, or other real-world considerations. It is intended to be a simple example of how to implement message persistence.


## [Starting a new chat](#starting-a-new-chat)


When the user navigates to the chat page without providing a chat ID, we need to create a new chat and redirect to the chat page with the new chat ID.

app/chat/page.tsx

```
import{ redirect }from'next/navigation';import{ createChat }from'@tools/chat-store';exportdefaultasyncfunctionPage(){const id =awaitcreateChat();// create a new chatredirect(`/chat/${id}`);// redirect to chat page, see below}
```

Our example chat store implementation uses files to store the chat messages. In a real-world application, you would use a database or a cloud storage service, and get the chat ID from the database. That being said, the function interfaces are designed to be easily replaced with other implementations.

tools/chat-store.ts

```
import{ generateId }from'ai';import{ existsSync, mkdirSync }from'fs';import{ writeFile }from'fs/promises';import path from'path';exportasyncfunctioncreateChat():Promise<string>{const id =generateId();// generate a unique chat IDawaitwriteFile(getChatFile(id),'[]');// create an empty chat filereturn id;}functiongetChatFile(id: string):string{const chatDir = path.join(process.cwd(),'.chats');if(!existsSync(chatDir))mkdirSync(chatDir,{ recursive:true});return path.join(chatDir,`${id}.json`);}
```


## [Loading an existing chat](#loading-an-existing-chat)


When the user navigates to the chat page with a chat ID, we need to load the chat messages and display them.

app/chat/\[id\]/page.tsx

```
import{ loadChat }from'@tools/chat-store';importChatfrom'@ui/chat';exportdefaultasyncfunctionPage(props:{ params: Promise<{ id: string }>}){const{ id }=await props.params;// get the chat ID from the URLconst messages =awaitloadChat(id);// load the chat messagesreturn<Chatid={id}initialMessages={messages}/>;// display the chat}
```

The `loadChat` function in our file-based chat store is implemented as follows:

tools/chat-store.ts

```
import{Message}from'ai';import{ readFile }from'fs/promises';exportasyncfunctionloadChat(id: string):Promise<Message[]>{returnJSON.parse(awaitreadFile(getChatFile(id),'utf8'));}// ... rest of the file
```

The display component is a simple chat component that uses the `useChat` hook to send and receive messages:

ui/chat.tsx

```
'use client';import{Message, useChat }from'@ai-sdk/react';exportdefaultfunctionChat({  id,  initialMessages,}:{ id?: string |undefined; initialMessages?: Message[]}={}){const{ input, handleInputChange, handleSubmit, messages }=useChat({    id,// use the provided chat ID    initialMessages,// initial messages if provided    sendExtraMessageFields:true,// send id and createdAt for each message});// simplified rendering code, extend as needed:return(<div>{messages.map(m=>(<divkey={m.id}>{m.role ==='user'?'User: ':'AI: '}{m.content}</div>))}<formonSubmit={handleSubmit}><inputvalue={input}onChange={handleInputChange}/></form></div>);}
```


## [Storing messages](#storing-messages)


`useChat` sends the chat id and the messages to the backend. We have enabled the `sendExtraMessageFields` option to send the id and createdAt fields, meaning that we store messages in the `useChat` message format.

The `useChat` message format is different from the `CoreMessage` format. The `useChat` message format is designed for frontend display, and contains additional fields such as `id` and `createdAt`. We recommend storing the messages in the `useChat` message format.

Storing messages is done in the `onFinish` callback of the `streamText` function. `onFinish` receives the messages from the AI response as a `CoreMessage[]`, and we use the [`appendResponseMessages`](/docs/reference/ai-sdk-ui/append-response-messages) helper to append the AI response messages to the chat messages.

app/api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{ appendResponseMessages, streamText }from'ai';import{ saveChat }from'@tools/chat-store';exportasyncfunctionPOST(req: Request){const{ messages, id }=await req.json();const result =streamText({    model:openai('gpt-4o-mini'),    messages,asynconFinish({ response }){awaitsaveChat({        id,        messages:appendResponseMessages({          messages,          responseMessages: response.messages,}),});},});return result.toDataStreamResponse();}
```

The actual storage of the messages is done in the `saveChat` function, which in our file-based chat store is implemented as follows:

tools/chat-store.ts

```
import{Message}from'ai';import{ writeFile }from'fs/promises';exportasyncfunctionsaveChat({  id,  messages,}:{  id: string;  messages: Message[];}):Promise<void>{const content =JSON.stringify(messages,null,2);awaitwriteFile(getChatFile(id), content);}// ... rest of the file
```


## [Message IDs](#message-ids)


In addition to a chat ID, each message has an ID. You can use this message ID to e.g. manipulate individual messages.

The IDs for user messages are generated by the `useChat` hook on the client, and the IDs for AI response messages are generated by `streamText`.

You can control the ID format by providing ID generators (see [`createIdGenerator()`](/docs/reference/ai-sdk-core/create-id-generator):

ui/chat.tsx

```
import{ createIdGenerator }from'ai';import{ useChat }from'@ai-sdk/react';const{// ...}=useChat({// ...// id format for client-side messages:  generateId:createIdGenerator({    prefix:'msgc',    size:16,}),});
```

app/api/chat/route.ts

```
import{ createIdGenerator, streamText }from'ai';exportasyncfunctionPOST(req: Request){// ...const result =streamText({// ...// id format for server-side messages:    experimental_generateMessageId:createIdGenerator({      prefix:'msgs',      size:16,}),});// ...}
```


## [Sending only the last message](#sending-only-the-last-message)


Once you have implemented message persistence, you might want to send only the last message to the server. This reduces the amount of data sent to the server on each request and can improve performance.

To achieve this, you can provide an `experimental_prepareRequestBody` function to the `useChat` hook (React only). This function receives the messages and the chat ID, and returns the request body to be sent to the server.

ui/chat.tsx

```
import{ useChat }from'@ai-sdk/react';const{// ...}=useChat({// ...// only send the last message to the server:experimental_prepareRequestBody({ messages, id }){return{ message: messages[messages.length -1], id };},});
```

On the server, you can then load the previous messages and append the new message to the previous messages:

app/api/chat/route.ts

```
import{ appendClientMessage }from'ai';exportasyncfunctionPOST(req: Request){// get the last message from the client:const{ message, id }=await req.json();// load the previous messages from the server:const previousMessages =awaitloadChat(id);// append the new message to the previous messages:const messages =appendClientMessage({    messages: previousMessages,    message,});const result =streamText({// ...    messages,});// ...}
```


## [Handling client disconnects](#handling-client-disconnects)


By default, the AI SDK `streamText` function uses backpressure to the language model provider to prevent the consumption of tokens that are not yet requested.

However, this means that when the client disconnects, e.g. by closing the browser tab or because of a network issue, the stream from the LLM will be aborted and the conversation may end up in a broken state.

Assuming that you have a [storage solution](#storing-messages) in place, you can use the `consumeStream` method to consume the stream on the backend, and then save the result as usual. `consumeStream` effectively removes the backpressure, meaning that the result is stored even when the client has already disconnected.

app/api/chat/route.ts

```
import{ appendResponseMessages, streamText }from'ai';import{ saveChat }from'@tools/chat-store';exportasyncfunctionPOST(req: Request){const{ messages, id }=await req.json();const result =streamText({    model,    messages,asynconFinish({ response }){awaitsaveChat({        id,        messages:appendResponseMessages({          messages,          responseMessages: response.messages,}),});},});// consume the stream to ensure it runs to completion & triggers onFinish// even when the client response is aborted:  result.consumeStream();// no awaitreturn result.toDataStreamResponse();}
```

When the client reloads the page after a disconnect, the chat will be restored from the storage solution.

In production applications, you would also track the state of the request (in progress, complete) in your stored messages and use it on the client to cover the case where the client reloads the page after a disconnection, but the streaming is not yet complete.


## [Resuming ongoing streams](#resuming-ongoing-streams)


This feature is experimental and may change in future versions.

The `useChat` hook has experimental support for resuming an ongoing chat generation stream by any client, either after a network disconnect or by reloading the chat page. This can be useful for building applications that involve long-running conversations or for ensuring that messages are not lost in case of network failures.

The following are the pre-requisities for your chat application to support resumable streams:

-   Installing the [`resumable-stream`](https://www.npmjs.com/package/resumable-stream) package that helps create and manage the publisher/subscriber mechanism of the streams.
-   Creating a [Redis](https://vercel.com/marketplace/redis) instance to store the stream state.
-   Creating a table that tracks the stream IDs associated with a chat.

To resume a chat stream, you will use the `experimental_resume` function returned by the `useChat` hook. You will call this function during the initial mount of the hook inside the main chat component.

app/components/chat.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';import{Input}from'@/components/input';import{Messages}from'@/components/messages';exportfunctionChat(){const{ experimental_resume }=useChat({ id });useEffect(()=>{experimental_resume();// we use an empty dependency array to// ensure this effect runs only once},[]);return(<div><Messages/><Input/></div>);}
```

For a more resilient implementation that handles race conditions that can occur in-flight during a resume request, you can use the following `useAutoResume` hook. This will automatically process the `append-message` SSE data part streamed by the server.

app/hooks/use-auto-resume.ts

```
'use client';import{ useEffect }from'react';importtype{UIMessage}from'ai';importtype{UseChatHelpers}from'@ai-sdk/react';exporttypeDataPart={type:'append-message'; message:string};exportinterfaceProps{  autoResume:boolean;  initialMessages:UIMessage[];  experimental_resume:UseChatHelpers['experimental_resume'];  data:UseChatHelpers['data'];  setMessages:UseChatHelpers['setMessages'];}exportfunctionuseAutoResume({  autoResume,  initialMessages,  experimental_resume,  data,  setMessages,}: Props){useEffect(()=>{if(!autoResume)return;const mostRecentMessage = initialMessages.at(-1);if(mostRecentMessage?.role ==='user'){experimental_resume();}// we intentionally run this once// eslint-disable-next-line react-hooks/exhaustive-deps},[]);useEffect(()=>{if(!data | data.length ===0)return;const dataPart = data[0]asDataPart;if(dataPart.type==='append-message'){const message =JSON.parse(dataPart.message)asUIMessage;setMessages([...initialMessages, message]);}},[data, initialMessages, setMessages]);}
```

You can then use this hook in your chat component as follows.

app/components/chat.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';import{Input}from'@/components/input';import{Messages}from'@/components/messages';import{ useAutoResume }from'@/hooks/use-auto-resume';exportfunctionChat(){const{ experimental_resume, data, setMessages }=useChat({ id });useAutoResume({    autoResume:true,    initialMessages:[],    experimental_resume,    data,    setMessages,});return(<div><Messages/><Input/></div>);}
```

The `experimental_resume` function makes a `GET` request to your configured chat endpoint (or `/api/chat` by default) whenever your client calls it. If there’s an active stream, it will pick up where it left off, otherwise it simply finishes without error.

The `GET` request automatically appends the `chatId` query parameter to the URL to help identify the chat the request belongs to. Using the `chatId`, you can look up the most recent stream ID from the database and resume the stream.

```
GET /api/chat?chatId=<your-chat-id>
```

Earlier, you must've implemented the `POST` handler for the `/api/chat` route to create new chat generations. When using `experimental_resume`, you must also implement the `GET` handler for `/api/chat` route to resume streams.


### [1\. Implement the GET handler](#1-implement-the-get-handler)


Add a `GET` method to `/api/chat` that:

1.  Reads `chatId` from the query string
2.  Validates it’s present
3.  Loads any stored stream IDs for that chat
4.  Returns the latest one to `streamContext.resumableStream()`
5.  Falls back to an empty stream if it’s already closed

app/api/chat/route.ts

```
import{ loadStreams }from'@/util/chat-store';import{ createDataStream, getMessagesByChatId }from'ai';import{ after }from'next/server';import{ createResumableStreamContext }from'resumable-stream';const streamContext =createResumableStreamContext({  waitUntil: after,});exportasyncfunctionGET(request:Request){const{ searchParams }=newURL(request.url);const chatId = searchParams.get('chatId');if(!chatId){returnnewResponse('id is required',{ status:400});}const streamIds =awaitloadStreams(chatId);if(!streamIds.length){returnnewResponse('No streams found',{ status:404});}const recentStreamId = streamIds.at(-1);if(!recentStreamId){returnnewResponse('No recent stream found',{ status:404});}const emptyDataStream =createDataStream({execute:()=>{},});const stream =await streamContext.resumableStream(    recentStreamId,()=> emptyDataStream,);if(stream){returnnewResponse(stream,{ status:200});}/*   * For when the generation is "active" during SSR but the   * resumable stream has concluded after reaching this point.   */const messages =awaitgetMessagesByChatId({ id: chatId });const mostRecentMessage = messages.at(-1);if(!mostRecentMessage | mostRecentMessage.role!=='assistant'){returnnewResponse(emptyDataStream,{ status:200});}const messageCreatedAt =newDate(mostRecentMessage.createdAt);const streamWithMessage =createDataStream({execute: buffer =>{      buffer.writeData({type:'append-message',        message:JSON.stringify(mostRecentMessage),});},});returnnewResponse(streamWithMessage,{ status:200});}
```

After you've implemented the `GET` handler, you can update the `POST` handler to handle the creation of resumable streams.


### [2\. Update the POST handler](#2-update-the-post-handler)


When you create a brand-new chat completion, you must:

1.  Generate a fresh `streamId`
2.  Persist it alongside your `chatId`
3.  Kick off a `createDataStream` that pipes tokens as they arrive
4.  Hand that new stream to `streamContext.resumableStream()`

app/api/chat/route.ts

```
import{  appendResponseMessages,  createDataStream,  generateId,  streamText,}from'ai';import{ appendStreamId, saveChat }from'@/util/chat-store';import{ createResumableStreamContext }from'resumable-stream';const streamContext =createResumableStreamContext({  waitUntil: after,});asyncfunctionPOST(request:Request){const{ id, messages }=await req.json();const streamId =generateId();// Record this new stream so we can resume laterawaitappendStreamId({ chatId: id, streamId });// Build the data stream that will emit tokensconst stream =createDataStream({execute: dataStream =>{const result =streamText({        model:openai('gpt-4o'),        messages,onFinish:async({ response })=>{awaitsaveChat({            id,            messages:appendResponseMessages({              messages,              responseMessages: response.messages,}),});},});// Return a resumable stream to the client      result.mergeIntoDataStream(dataStream);},});returnnewResponse(await streamContext.resumableStream(streamId,()=> stream),);}
```

With both handlers, your clients can now gracefully resume ongoing streams.
