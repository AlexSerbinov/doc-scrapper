# AI Gateway Provider


---
url: https://ai-sdk.dev/providers/community-providers/cloudflare-ai-gateway
description: Learn how to use the Cloudflare AI Gateway provider for the AI SDK.
---


# [AI Gateway Provider](#ai-gateway-provider)


The AI Gateway Provider is a library that integrates Cloudflare's AI Gateway with the Vercel AI SDK. It enables seamless access to multiple AI models from various providers through a unified interface, with automatic fallback for high availability.


## [Features](#features)


-   **Runtime Agnostic**: Compatible with Node.js, Edge Runtime, and other JavaScript runtimes supported by the Vercel AI SDK.
-   **Automatic Fallback**: Automatically switches to the next available model if one fails, ensuring resilience.
-   **Multi-Provider Support**: Supports models from OpenAI, Anthropic, DeepSeek, Google AI Studio, Grok, Mistral, Perplexity AI, Replicate, and Groq.
-   **AI Gateway Integration**: Leverages Cloudflare's AI Gateway for request management, caching, and rate limiting.
-   **Simplified Configuration**: Easy setup with support for API key authentication or Cloudflare AI bindings.


## [Setup](#setup)


The AI Gateway Provider is available in the `ai-gateway-provider` module. Install it with:

pnpm

npm

yarn

pnpm add ai-gateway-provider


## [Provider Instance](#provider-instance)


Create an `aigateway` provider instance using the `createAiGateway` function. You can authenticate using an API key or a Cloudflare AI binding.


### [API Key Authentication](#api-key-authentication)


```
import{ createAiGateway }from'ai-gateway-provider';const aigateway =createAiGateway({  accountId:'your-cloudflare-account-id',  gateway:'your-gateway-name',  apiKey:'your-cloudflare-api-key',// Only required if your gateway has authentication enabled  options:{    skipCache:true,// Optional request-level settings},});
```


### [Cloudflare AI Binding](#cloudflare-ai-binding)


This method is only available inside Cloudflare Workers.

Configure an AI binding in your `wrangler.toml`:

```
[AI]binding ="AI"
```

In your worker, create a new instance using the binding:

```
import{ createAiGateway }from'ai-gateway-provider';const aigateway =createAiGateway({  binding: env.AI.gateway('my-gateway'),  options:{    skipCache:true,// Optional request-level settings},});
```


## [Language Models](#language-models)


Create a model instance by passing an array of models to the `aigateway` provider. The provider will attempt to use the models in order, falling back to the next if one fails.

```
import{ createAiGateway }from'ai-gateway-provider';import{ createOpenAI }from'@ai-sdk/openai';import{ createAnthropic }from'@ai-sdk/anthropic';const aigateway =createAiGateway({  accountId:'your-cloudflare-account-id',  gateway:'your-gateway-name',  apiKey:'your-cloudflare-api-key',});const openai =createOpenAI({ apiKey:'openai-api-key'});const anthropic =createAnthropic({ apiKey:'anthropic-api-key'});const model =aigateway([anthropic('claude-3-5-haiku-20241022'),// Primary modelopenai('gpt-4o-mini'),// Fallback model]);
```


### [Request Options](#request-options)


Customize AI Gateway settings per request:

-   `cacheKey`: Custom cache key for the request.
-   `cacheTtl`: Cache time-to-live in seconds.
-   `skipCache`: Bypass caching.
-   `metadata`: Custom metadata for the request.
-   `collectLog`: Enable/disable log collection.
-   `eventId`: Custom event identifier.
-   `requestTimeoutMs`: Request timeout in milliseconds.
-   `retries`:
    -   `maxAttempts`: Number of retry attempts (1-5).
    -   `retryDelayMs`: Delay between retries.
    -   `backoff`: Retry strategy (`constant`, `linear`, `exponential`).

Example:

```
const aigateway =createAiGateway({  accountId:'your-cloudflare-account-id',  gateway:'your-gateway-name',  apiKey:'your-cloudflare-api-key',  options:{    cacheTtl:3600,// Cache for 1 hour    metadata:{ userId:'user123'},    retries:{      maxAttempts:3,      retryDelayMs:1000,      backoff:'exponential',},},});
```


## [Examples](#examples)



### [`generateText`](#generatetext)


Generate non-streaming text using the AI Gateway Provider:

```
import{ createAiGateway }from'ai-gateway-provider';import{ createOpenAI }from'@ai-sdk/openai';import{ generateText }from'ai';const aigateway =createAiGateway({  accountId:'your-cloudflare-account-id',  gateway:'your-gateway-name',  apiKey:'your-cloudflare-api-key',});const openai =createOpenAI({ apiKey:'openai-api-key'});const{ text }=awaitgenerateText({  model:aigateway([openai('gpt-4o-mini')]),  prompt:'Write a greeting.',});console.log(text);// Output: "Hello"
```


### [`streamText`](#streamtext)


Stream text responses using the AI Gateway Provider:

```
import{ createAiGateway }from'ai-gateway-provider';import{ createOpenAI }from'@ai-sdk/openai';import{ streamText }from'ai';const aigateway =createAiGateway({  accountId:'your-cloudflare-account-id',  gateway:'your-gateway-name',  apiKey:'your-cloudflare-api-key',});const openai =createOpenAI({ apiKey:'openai-api-key'});const result =awaitstreamText({  model:aigateway([openai('gpt-4o-mini')]),  prompt:'Write a multi-part greeting.',});let accumulatedText ='';forawait(const chunk of result.textStream){  accumulatedText += chunk;}console.log(accumulatedText);// Output: "Hello world!"
```


## [Supported Providers](#supported-providers)


-   OpenAI
-   Anthropic
-   DeepSeek
-   Google AI Studio
-   Grok
-   Mistral
-   Perplexity AI
-   Replicate
-   Groq


## [Error Handling](#error-handling)


The provider throws the following custom errors:

-   `AiGatewayUnauthorizedError`: Invalid or missing API key when authentication is enabled.
-   `AiGatewayDoesNotExist`: Specified AI Gateway does not exist.
