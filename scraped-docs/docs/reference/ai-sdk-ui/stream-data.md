# StreamData


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-ui/stream-data
description: Learn to use streamData helper function in your application.
---


# [`StreamData`](#streamdata)


The `StreamData` class is deprecated and will be removed in a future version of AI SDK. Please use `createDataStream`, `createDataStreamResponse`, and `pipeDataStreamToResponse` instead.

The `StreamData` class allows you to stream additional data to the client (see [Streaming Data](/docs/ai-sdk-ui/streaming-data)).


## [Import](#import)



### [React](#react)


import { StreamData } from "ai"


## [API Signature](#api-signature)



### [Constructor](#constructor)


```
const data =newStreamData();
```


### [Methods](#methods)



#### [`append`](#append)


Appends a value to the stream data.

```
data.append(value:JSONValue)
```


#### [`appendMessageAnnotation`](#appendmessageannotation)


Appends a message annotation to the stream data.

```
data.appendMessageAnnotation(annotation:JSONValue)
```


#### [`close`](#close)


Closes the stream data.

```
data.close();
```
