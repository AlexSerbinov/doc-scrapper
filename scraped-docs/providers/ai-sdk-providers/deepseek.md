# DeepSeek Provider


---
url: https://ai-sdk.dev/providers/ai-sdk-providers/deepseek
description: Learn how to use DeepSeek's models with the AI SDK.
---


# [DeepSeek Provider](#deepseek-provider)


The [DeepSeek](https://www.deepseek.com) provider offers access to powerful language models through the DeepSeek API, including their [DeepSeek-V3 model](https://github.com/deepseek-ai/DeepSeek-V3).

API keys can be obtained from the [DeepSeek Platform](https://platform.deepseek.com/api_keys).


## [Setup](#setup)


The DeepSeek provider is available via the `@ai-sdk/deepseek` module. You can install it with:

pnpm

npm

yarn

pnpm add @ai-sdk/deepseek


## [Provider Instance](#provider-instance)


You can import the default provider instance `deepseek` from `@ai-sdk/deepseek`:

```
import{ deepseek }from'@ai-sdk/deepseek';
```

For custom configuration, you can import `createDeepSeek` and create a provider instance with your settings:

```
import{ createDeepSeek }from'@ai-sdk/deepseek';const deepseek =createDeepSeek({  apiKey: process.env.DEEPSEEK_API_KEY??'',});
```

You can use the following optional settings to customize the DeepSeek provider instance:

-   **baseURL** *string*

    Use a different URL prefix for API calls. The default prefix is `https://api.deepseek.com/v1`.

-   **apiKey** *string*

    API key that is being sent using the `Authorization` header. It defaults to the `DEEPSEEK_API_KEY` environment variable.

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.

-   **fetch** *(input: RequestInfo, init?: RequestInit) => Promise<Response>*

    Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation.



## [Language Models](#language-models)


You can create language models using a provider instance:

```
import{ deepseek }from'@ai-sdk/deepseek';import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:deepseek('deepseek-chat'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',});
```

DeepSeek language models can be used in the `streamText` function (see [AI SDK Core](/docs/ai-sdk-core)).


### [Reasoning](#reasoning)


DeepSeek has reasoning support for the `deepseek-reasoner` model:

```
import{ deepseek }from'@ai-sdk/deepseek';import{ generateText }from'ai';const{ text, reasoning }=awaitgenerateText({  model:deepseek('deepseek-reasoner'),  prompt:'How many people will live in the world in 2040?',});console.log(reasoning);console.log(text);
```

See [AI SDK UI: Chatbot](/docs/ai-sdk-ui/chatbot#reasoning) for more details on how to integrate reasoning into your chatbot.


### [Cache Token Usage](#cache-token-usage)


DeepSeek provides context caching on disk technology that can significantly reduce token costs for repeated content. You can access the cache hit/miss metrics through the `providerMetadata` property in the response:

```
import{ deepseek }from'@ai-sdk/deepseek';import{ generateText }from'ai';const result =awaitgenerateText({  model:deepseek('deepseek-chat'),  prompt:'Your prompt here',});console.log(result.providerMetadata);// Example output: { deepseek: { promptCacheHitTokens: 1856, promptCacheMissTokens: 5 } }
```

The metrics include:

-   `promptCacheHitTokens`: Number of input tokens that were cached
-   `promptCacheMissTokens`: Number of input tokens that were not cached

For more details about DeepSeek's caching system, see the [DeepSeek caching documentation](https://api-docs.deepseek.com/guides/kv_cache#checking-cache-hit-status).


## [Model Capabilities](#model-capabilities)


Model

Text Generation

Object Generation

Image Input

Tool Usage

Tool Streaming

`deepseek-chat`

`deepseek-reasoner`

Please see the [DeepSeek docs](https://api-docs.deepseek.com) for a full list of available models. You can also pass any available provider model ID as a string if needed.
