# pipeDataStreamToResponse


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-ui/pipe-data-stream-to-response
description: Learn to use pipeDataStreamToResponse helper function to pipe streaming data to a ServerResponse object.
---


# [`pipeDataStreamToResponse`](#pipedatastreamtoresponse)


The `pipeDataStreamToResponse` function pipes streaming data to a Node.js ServerResponse object (see [Streaming Data](/docs/ai-sdk-ui/streaming-data)).


## [Import](#import)


import { pipeDataStreamToResponse } from "ai"


## [Example](#example)


```
pipeDataStreamToResponse(serverResponse,{  status:200,  statusText:'OK',  headers:{'Custom-Header':'value',},asyncexecute(dataStream){// Write data    dataStream.writeData({ value:'Hello'});// Write annotation    dataStream.writeMessageAnnotation({type:'status', value:'processing'});// Merge another streamconst otherStream =getAnotherStream();    dataStream.merge(otherStream);},onError:error=>`Custom error: ${error.message}`,});
```


## [API Signature](#api-signature)



### [Parameters](#parameters)



### response:


ServerResponse

The Node.js ServerResponse object to pipe the data to.


### status:


number

The status code for the response.


### statusText:


string

The status text for the response.


### headers:


Headers | Record<string, string>

Additional headers for the response.


### execute:


(dataStream: DataStreamWriter) => Promise<void> | void

A function that receives a DataStreamWriter instance and can use it to write data to the stream.

DataStreamWriter


### writeData:


(value: JSONValue) => void

Appends a data part to the stream.


### writeMessageAnnotation:


(value: JSONValue) => void

Appends a message annotation to the stream.


### merge:


(stream: ReadableStream<DataStreamString>) => void

Merges the contents of another stream to this stream.


### onError:


((error: unknown) => string) | undefined

Error handler that is used by the data stream writer. This is intended for forwarding when merging streams to prevent duplicated error masking.


### onError:


(error: unknown) => string

A function that handles errors and returns an error message string. By default, it returns "An error occurred."
