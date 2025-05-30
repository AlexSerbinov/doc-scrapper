# createDataStream


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-ui/create-data-stream
description: Learn to use createDataStream helper function to stream additional data in your application.
---


# [`createDataStream`](#createdatastream)


The `createDataStream` function allows you to stream additional data to the client (see [Streaming Data](/docs/ai-sdk-ui/streaming-data)).


## [Import](#import)


import { createDataStream } from "ai"


## [Example](#example)


```
const stream =createDataStream({asyncexecute(dataStream){// Write data    dataStream.writeData({ value:'Hello'});// Write annotation    dataStream.writeMessageAnnotation({type:'status', value:'processing'});// Merge another streamconst otherStream =getAnotherStream();    dataStream.merge(otherStream);},onError:error=>`Custom error: ${error.message}`,});
```


## [API Signature](#api-signature)



### [Parameters](#parameters)



### execute:


(dataStream: DataStreamWriter) => Promise<void> | void

A function that receives a DataStreamWriter instance and can use it to write data to the stream.

DataStreamWriter


### write:


(data: DataStreamString) => void

Appends a data part to the stream.


### writeData:


(value: JSONValue) => void

Appends a data part to the stream.


### writeMessageAnnotation:


(value: JSONValue) => void

Appends a message annotation to the stream.


### writeSource:


(source: Source) => void

Appends a source part to the stream.


### merge:


(stream: ReadableStream<DataStreamString>) => void

Merges the contents of another stream to this stream.


### onError:


((error: unknown) => string) | undefined

Error handler that is used by the data stream writer. This is intended for forwarding when merging streams to prevent duplicated error masking.


### onError:


(error: unknown) => string

A function that handles errors and returns an error message string. By default, it returns "An error occurred."


### [Returns](#returns)


`ReadableStream<DataStreamString>`

A readable stream that emits formatted data stream parts.
