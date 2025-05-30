# extractReasoningMiddleware()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/extract-reasoning-middleware
description: Middleware that extracts XML-tagged reasoning sections from generated text
---


# [`extractReasoningMiddleware()`](#extractreasoningmiddleware)


`extractReasoningMiddleware` is a middleware function that extracts XML-tagged reasoning sections from generated text and exposes them separately from the main text content. This is particularly useful when you want to separate an AI model's reasoning process from its final output.

```
import{ extractReasoningMiddleware }from'ai';const middleware =extractReasoningMiddleware({  tagName:'reasoning',  separator:'\n',});
```


## [Import](#import)


import { extractReasoningMiddleware } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### tagName:


string

The name of the XML tag to extract reasoning from (without angle brackets)


### separator?:


string

The separator to use between reasoning and text sections. Defaults to "\\n"


### startWithReasoning?:


boolean

Starts with reasoning tokens. Set to true when the response always starts with reasoning and the initial tag is omitted. Defaults to false.


### [Returns](#returns)


Returns a middleware object that:

-   Processes both streaming and non-streaming responses
-   Extracts content between specified XML tags as reasoning
-   Removes the XML tags and reasoning from the main text
-   Adds a `reasoning` property to the result containing the extracted content
-   Maintains proper separation between text sections using the specified separator


### [Type Parameters](#type-parameters)


The middleware works with the `LanguageModelV1StreamPart` type for streaming responses.
