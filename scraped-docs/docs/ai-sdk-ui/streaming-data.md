# Streaming Custom Data


---
url: https://ai-sdk.dev/docs/ai-sdk-ui/streaming-data
description: Learn how to stream custom data to the client.
---


# [Streaming Custom Data](#streaming-custom-data)


It is often useful to send additional data alongside the model's response. For example, you may want to send status information, the message ids after storing them, or references to content that the language model is referring to.

The AI SDK provides several helpers that allows you to stream additional data to the client and attach it either to the `Message` or to the `data` object of the `useChat` hook:

-   `createDataStream`: creates a data stream
-   `createDataStreamResponse`: creates a response object that streams data
-   `pipeDataStreamToResponse`: pipes a data stream to a server response object

The data is streamed as part of the response stream.


## [Sending Custom Data from the Server](#sending-custom-data-from-the-server)


In your server-side route handler, you can use `createDataStreamResponse` and `pipeDataStreamToResponse` in combination with `streamText`. You need to:

1.  Call `createDataStreamResponse` or `pipeDataStreamToResponse` to get a callback function with a `DataStreamWriter`.
2.  Write to the `DataStreamWriter` to stream additional data.
3.  Merge the `streamText` result into the `DataStreamWriter`.
4.  Return the response from `createDataStreamResponse` (if that method is used)

Here is an example:

route.ts

```
import{ openai }from'@ai-sdk/openai';import{ generateId, createDataStreamResponse, streamText }from'ai';exportasyncfunctionPOST(req: Request){const{ messages }=await req.json();// immediately start streaming (solves RAG issues with status, etc.)returncreateDataStreamResponse({execute:dataStream=>{      dataStream.writeData('initialized call');const result =streamText({        model:openai('gpt-4o'),        messages,onChunk(){          dataStream.writeMessageAnnotation({ chunk:'123'});},onFinish(){// message annotation:          dataStream.writeMessageAnnotation({            id:generateId(),// e.g. id from saved DB record            other:'information',});// call annotation:          dataStream.writeData('call completed');},});      result.mergeIntoDataStream(dataStream);},onError:error=>{// Error messages are masked by default for security reasons.// If you want to expose the error message to the client, you can do so here:return error instanceofError? error.message :String(error);},});}
```

You can also send stream data from custom backends, e.g. Python / FastAPI, using the [Data Stream Protocol](/docs/ai-sdk-ui/stream-protocol#data-stream-protocol).


## [Sending Custom Sources](#sending-custom-sources)


You can send custom sources to the client using the `writeSource` method on the `DataStreamWriter`:

route.ts

```
import{ openai }from'@ai-sdk/openai';import{ createDataStreamResponse, streamText }from'ai';exportasyncfunctionPOST(req: Request){const{ messages }=await req.json();returncreateDataStreamResponse({execute:dataStream=>{// write a custom url source to the stream:      dataStream.writeSource({        sourceType:'url',        id:'source-1',        url:'https://example.com',        title:'Example Source',});const result =streamText({        model:openai('gpt-4o'),        messages,});      result.mergeIntoDataStream(dataStream);},});}
```


## [Processing Custom Data in `useChat`](#processing-custom-data-in-usechat)


The `useChat` hook automatically processes the streamed data and makes it available to you.


### [Accessing Data](#accessing-data)


On the client, you can destructure `data` from the `useChat` hook which stores all `StreamData` as a `JSONValue[]`.

page.tsx

```
import{ useChat }from'@ai-sdk/react';const{ data }=useChat();
```


### [Accessing Message Annotations](#accessing-message-annotations)


Each message from the `useChat` hook has an optional `annotations` property that contains the message annotations sent from the server.

Since the shape of the annotations depends on what you send from the server, you have to destructure them in a type-safe way on the client side.

Here we just show the annotations as a JSON string:

page.tsx

```
import{Message, useChat }from'@ai-sdk/react';const{ messages }=useChat();const result =(<>{messages?.map((m: Message)=>(<divkey={m.id}>{m.annotations &&<>{JSON.stringify(m.annotations)}</>}</div>))}</>);
```


### [Updating and Clearing Data](#updating-and-clearing-data)


You can update and clear the `data` object of the `useChat` hook using the `setData` function.

page.tsx

```
const{ setData }=useChat();// clear existing datasetData(undefined);// set new datasetData([{ test:'value'}]);// transform existing data, e.g. adding additional values:setData(currentData=>[...currentData,{ test:'value'}]);
```


#### [Example: Clear on Submit](#example-clear-on-submit)


page.tsx

```
'use client';import{Message, useChat }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit, data, setData }=useChat();return(<>{data &&<pre>{JSON.stringify(data,null,2)}</pre>}{messages?.map((m: Message)=>(<divkey={m.id}>{`${m.role}: ${m.content}`}</div>))}<formonSubmit={e=>{setData(undefined);// clear stream datahandleSubmit(e);}}><inputvalue={input}onChange={handleInputChange}/></form></>);}
```
