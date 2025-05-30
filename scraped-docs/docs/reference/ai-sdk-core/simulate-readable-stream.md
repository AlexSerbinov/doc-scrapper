# simulateReadableStream()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/simulate-readable-stream
description: Create a ReadableStream that emits values with configurable delays
---


# [`simulateReadableStream()`](#simulatereadablestream)


`simulateReadableStream` is a utility function that creates a ReadableStream which emits provided values sequentially with configurable delays. This is particularly useful for testing streaming functionality or simulating time-delayed data streams.

```
import{ simulateReadableStream }from'ai';const stream =simulateReadableStream({  chunks:['Hello',' ','World'],  initialDelayInMs:100,  chunkDelayInMs:50,});
```


## [Import](#import)


import { simulateReadableStream } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### chunks:


T\[\]

Array of values to be emitted by the stream


### initialDelayInMs?:


number | null

Initial delay in milliseconds before emitting the first value. Defaults to 0. Set to null to skip the initial delay entirely.


### chunkDelayInMs?:


number | null

Delay in milliseconds between emitting each value. Defaults to 0. Set to null to skip delays between chunks.


### [Returns](#returns)


Returns a `ReadableStream<T>` that:

-   Emits each value from the provided `chunks` array sequentially
-   Waits for `initialDelayInMs` before emitting the first value (if not `null`)
-   Waits for `chunkDelayInMs` between emitting subsequent values (if not `null`)
-   Closes automatically after all chunks have been emitted


### [Type Parameters](#type-parameters)


-   `T`: The type of values contained in the chunks array and emitted by the stream


## [Examples](#examples)



### [Basic Usage](#basic-usage)


```
const stream =simulateReadableStream({  chunks:['Hello',' ','World'],});
```


### [With Delays](#with-delays)


```
const stream =simulateReadableStream({  chunks:['Hello',' ','World'],  initialDelayInMs:1000,// Wait 1 second before first chunk  chunkDelayInMs:500,// Wait 0.5 seconds between chunks});
```


### [Without Delays](#without-delays)


```
const stream =simulateReadableStream({  chunks:['Hello',' ','World'],  initialDelayInMs:null,// No initial delay  chunkDelayInMs:null,// No delay between chunks});
```
