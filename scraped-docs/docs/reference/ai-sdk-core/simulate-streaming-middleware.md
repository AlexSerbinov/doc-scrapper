# simulateStreamingMiddleware()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/simulate-streaming-middleware
description: Middleware that simulates streaming for non-streaming language models
---


# [`simulateStreamingMiddleware()`](#simulatestreamingmiddleware)


`simulateStreamingMiddleware` is a middleware function that simulates streaming behavior with responses from non-streaming language models. This is useful when you want to maintain a consistent streaming interface even when using models that only provide complete responses.

```
import{ simulateStreamingMiddleware }from'ai';const middleware =simulateStreamingMiddleware();
```


## [Import](#import)


import { simulateStreamingMiddleware } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)


This middleware doesn't accept any parameters.


### [Returns](#returns)


Returns a middleware object that:

-   Takes a complete response from a language model
-   Converts it into a simulated stream of chunks
-   Properly handles various response components including:
    -   Text content
    -   Reasoning (as string or array of objects)
    -   Tool calls
    -   Metadata and usage information
    -   Warnings


### [Usage Example](#usage-example)


```
import{ streamText }from'ai';import{ wrapLanguageModel }from'ai';import{ simulateStreamingMiddleware }from'ai';// Example with a non-streaming modelconst result =streamText({  model:wrapLanguageModel({    model: nonStreamingModel,    middleware:simulateStreamingMiddleware(),}),  prompt:'Your prompt here',});// Now you can use the streaming interfaceforawait(const chunk of result.fullStream){// Process streaming chunks}
```


## [How It Works](#how-it-works)


The middleware:

1.  Awaits the complete response from the language model
2.  Creates a `ReadableStream` that emits chunks in the correct sequence
3.  Simulates streaming by breaking down the response into appropriate chunk types
4.  Preserves all metadata, reasoning, tool calls, and other response properties
