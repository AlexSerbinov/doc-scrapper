# Mistral AI Provider


---
url: https://ai-sdk.dev/providers/ai-sdk-providers/mistral
description: Learn how to use Mistral.
---


# [Mistral AI Provider](#mistral-ai-provider)


The [Mistral AI](https://mistral.ai/) provider contains language model support for the Mistral chat API.


## [Setup](#setup)


The Mistral provider is available in the `@ai-sdk/mistral` module. You can install it with

pnpm

npm

yarn

pnpm add @ai-sdk/mistral


## [Provider Instance](#provider-instance)


You can import the default provider instance `mistral` from `@ai-sdk/mistral`:

```
import{ mistral }from'@ai-sdk/mistral';
```

If you need a customized setup, you can import `createMistral` from `@ai-sdk/mistral` and create a provider instance with your settings:

```
import{ createMistral }from'@ai-sdk/mistral';const mistral =createMistral({// custom settings});
```

You can use the following optional settings to customize the Mistral provider instance:

-   **baseURL** *string*

    Use a different URL prefix for API calls, e.g. to use proxy servers. The default prefix is `https://api.mistral.ai/v1`.

-   **apiKey** *string*

    API key that is being sent using the `Authorization` header. It defaults to the `MISTRAL_API_KEY` environment variable.

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.

-   **fetch** *(input: RequestInfo, init?: RequestInit) => Promise<Response>*

    Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation. Defaults to the global `fetch` function. You can use it as a middleware to intercept requests, or to provide a custom fetch implementation for e.g. testing.



## [Language Models](#language-models)


You can create models that call the [Mistral chat API](https://docs.mistral.ai/api/#operation/createChatCompletion) using a provider instance. The first argument is the model id, e.g. `mistral-large-latest`. Some Mistral chat models support tool calls.

```
const model =mistral('mistral-large-latest');
```

Mistral chat models also support additional model settings that are not part of the [standard call settings](/docs/ai-sdk-core/settings). You can pass them as an options argument:

```
const model =mistral('mistral-large-latest',{  safePrompt:true,// optional safety prompt injection});
```

The following optional settings are available for Mistral models:

-   **safePrompt** *boolean*

    Whether to inject a safety prompt before all conversations.

    Defaults to `false`.



### [Document OCR](#document-ocr)


Mistral chat models support document OCR for PDF files. You can optionally set image and page limits using the provider options.

```
const result =awaitgenerateText({  model:mistral('mistral-small-latest'),  messages:[{      role:'user',      content:[{type:'text',          text:'What is an embedding model according to this document?',},{type:'file',          data:newURL('https://github.com/vercel/ai/blob/main/examples/ai-core/data/ai.pdf?raw=true',),          mimeType:'application/pdf',},],},],// optional settings:  providerOptions:{    mistral:{      documentImageLimit:8,      documentPageLimit:64,},},});
```


### [Example](#example)


You can use Mistral language models to generate text with the `generateText` function:

```
import{ mistral }from'@ai-sdk/mistral';import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:mistral('mistral-large-latest'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',});
```

Mistral language models can also be used in the `streamText`, `generateObject`, and `streamObject` functions (see [AI SDK Core](/docs/ai-sdk-core)).


### [Model Capabilities](#model-capabilities)


Model

Image Input

Object Generation

Tool Usage

Tool Streaming

`pixtral-large-latest`

`mistral-large-latest`

`mistral-small-latest`

`ministral-3b-latest`

`ministral-8b-latest`

`pixtral-12b-2409`

The table above lists popular models. Please see the [Mistral docs](https://docs.mistral.ai/getting-started/models/models_overview/) for a full list of available models. The table above lists popular models. You can also pass any available provider model ID as a string if needed.


## [Embedding Models](#embedding-models)


You can create models that call the [Mistral embeddings API](https://docs.mistral.ai/api/#operation/createEmbedding) using the `.embedding()` factory method.

```
const model = mistral.embedding('mistral-embed');
```


### [Model Capabilities](#model-capabilities-1)


Model

Default Dimensions

`mistral-embed`

1024
