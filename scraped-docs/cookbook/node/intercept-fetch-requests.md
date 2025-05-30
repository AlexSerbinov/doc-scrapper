# Intercepting Fetch Requests


---
url: https://ai-sdk.dev/cookbook/node/intercept-fetch-requests
description: Learn how to intercept fetch requests using the AI SDK and Node
---


# [Intercepting Fetch Requests](#intercepting-fetch-requests)


Many providers support setting a custom `fetch` function using the `fetch` argument in their factory function.

A custom `fetch` function can be used to intercept and modify requests before they are sent to the provider's API, and to intercept and modify responses before they are returned to the caller.

Use cases for intercepting requests include:

-   Logging requests and responses
-   Adding authentication headers
-   Modifying request bodies
-   Caching responses
-   Using a custom HTTP client


## [Example](#example)


```
import{ generateText }from'ai';import{ createOpenAI }from'@ai-sdk/openai';const openai =createOpenAI({// example fetch wrapper that logs the input to the API call:fetch:async(url, options)=>{console.log('URL', url);console.log('Headers',JSON.stringify(options!.headers,null,2));console.log(`Body ${JSON.stringify(JSON.parse(options!.body!as string),null,2)}`,);returnawaitfetch(url, options);},});const{ text }=awaitgenerateText({  model:openai('gpt-3.5-turbo'),  prompt:'Why is the sky blue?',});
```
