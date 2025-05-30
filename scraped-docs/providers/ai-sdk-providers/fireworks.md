# Fireworks Provider


---
url: https://ai-sdk.dev/providers/ai-sdk-providers/fireworks
description: Learn how to use Fireworks models with the AI SDK.
---


# [Fireworks Provider](#fireworks-provider)


[Fireworks](https://fireworks.ai/) is a platform for running and testing LLMs through their [API](https://readme.fireworks.ai/).


## [Setup](#setup)


The Fireworks provider is available via the `@ai-sdk/fireworks` module. You can install it with

pnpm

npm

yarn

pnpm add @ai-sdk/fireworks


## [Provider Instance](#provider-instance)


You can import the default provider instance `fireworks` from `@ai-sdk/fireworks`:

```
import{ fireworks }from'@ai-sdk/fireworks';
```

If you need a customized setup, you can import `createFireworks` from `@ai-sdk/fireworks` and create a provider instance with your settings:

```
import{ createFireworks }from'@ai-sdk/fireworks';const fireworks =createFireworks({  apiKey: process.env.FIREWORKS_API_KEY??'',});
```

You can use the following optional settings to customize the Fireworks provider instance:

-   **baseURL** *string*

    Use a different URL prefix for API calls, e.g. to use proxy servers. The default prefix is `https://api.fireworks.ai/inference/v1`.

-   **apiKey** *string*

    API key that is being sent using the `Authorization` header. It defaults to the `FIREWORKS_API_KEY` environment variable.

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.

-   **fetch** *(input: RequestInfo, init?: RequestInit) => Promise<Response>*

    Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation.



## [Language Models](#language-models)


You can create [Fireworks models](https://fireworks.ai/models) using a provider instance. The first argument is the model id, e.g. `accounts/fireworks/models/firefunction-v1`:

```
const model =fireworks('accounts/fireworks/models/firefunction-v1');
```


### [Reasoning Models](#reasoning-models)


Fireworks exposes the thinking of `deepseek-r1` in the generated text using the `<think>` tag. You can use the `extractReasoningMiddleware` to extract this reasoning and expose it as a `reasoning` property on the result:

```
import{ fireworks }from'@ai-sdk/fireworks';import{ wrapLanguageModel, extractReasoningMiddleware }from'ai';const enhancedModel =wrapLanguageModel({  model:fireworks('accounts/fireworks/models/deepseek-r1'),  middleware:extractReasoningMiddleware({ tagName:'think'}),});
```

You can then use that enhanced model in functions like `generateText` and `streamText`.


### [Example](#example)


You can use Fireworks language models to generate text with the `generateText` function:

```
import{ fireworks }from'@ai-sdk/fireworks';import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:fireworks('accounts/fireworks/models/firefunction-v1'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',});
```

Fireworks language models can also be used in the `streamText` function (see [AI SDK Core](/docs/ai-sdk-core)).


### [Completion Models](#completion-models)


You can create models that call the Fireworks completions API using the `.completion()` factory method:

```
const model = fireworks.completion('accounts/fireworks/models/firefunction-v1');
```


### [Model Capabilities](#model-capabilities)


Model

Image Input

Object Generation

Tool Usage

Tool Streaming

`accounts/fireworks/models/deepseek-r1`

`accounts/fireworks/models/deepseek-v3`

`accounts/fireworks/models/llama-v3p1-405b-instruct`

`accounts/fireworks/models/llama-v3p1-8b-instruct`

`accounts/fireworks/models/llama-v3p2-3b-instruct`

`accounts/fireworks/models/llama-v3p3-70b-instruct`

`accounts/fireworks/models/mixtral-8x7b-instruct-hf`

`accounts/fireworks/models/mixtral-8x22b-instruct`

`accounts/fireworks/models/qwen2p5-coder-32b-instruct`

`accounts/fireworks/models/llama-v3p2-11b-vision-instruct`

`accounts/fireworks/models/yi-large`

The table above lists popular models. Please see the [Fireworks models page](https://fireworks.ai/models) for a full list of available models.


## [Embedding Models](#embedding-models)


You can create models that call the Fireworks embeddings API using the `.textEmbeddingModel()` factory method:

```
const model = fireworks.textEmbeddingModel('accounts/fireworks/models/nomic-embed-text-v1',);
```


## [Image Models](#image-models)


You can create Fireworks image models using the `.image()` factory method. For more on image generation with the AI SDK see [generateImage()](/docs/reference/ai-sdk-core/generate-image).

```
import{ fireworks }from'@ai-sdk/fireworks';import{ experimental_generateImage as generateImage }from'ai';const{ image }=awaitgenerateImage({  model: fireworks.image('accounts/fireworks/models/flux-1-dev-fp8'),  prompt:'A futuristic cityscape at sunset',  aspectRatio:'16:9',});
```

Model support for `size` and `aspectRatio` parameters varies. See the [Model Capabilities](#model-capabilities-1) section below for supported dimensions, or check the model's documentation on [Fireworks models page](https://fireworks.ai/models) for more details.


### [Model Capabilities](#model-capabilities-1)


For all models supporting aspect ratios, the following aspect ratios are supported:

`1:1 (default), 2:3, 3:2, 4:5, 5:4, 16:9, 9:16, 9:21, 21:9`

For all models supporting size, the following sizes are supported:

`640 x 1536, 768 x 1344, 832 x 1216, 896 x 1152, 1024x1024 (default), 1152 x 896, 1216 x 832, 1344 x 768, 1536 x 640`

Model

Dimensions Specification

`accounts/fireworks/models/flux-1-dev-fp8`

Aspect Ratio

`accounts/fireworks/models/flux-1-schnell-fp8`

Aspect Ratio

`accounts/fireworks/models/playground-v2-5-1024px-aesthetic`

Size

`accounts/fireworks/models/japanese-stable-diffusion-xl`

Size

`accounts/fireworks/models/playground-v2-1024px-aesthetic`

Size

`accounts/fireworks/models/SSD-1B`

Size

`accounts/fireworks/models/stable-diffusion-xl-1024-v1-0`

Size

For more details, see the [Fireworks models page](https://fireworks.ai/models).


#### [Stability AI Models](#stability-ai-models)


Fireworks also presents several Stability AI models backed by Stability AI API keys and endpoint. The AI SDK Fireworks provider does not currently include support for these models:

Model ID

`accounts/stability/models/sd3-turbo`

`accounts/stability/models/sd3-medium`

`accounts/stability/models/sd3`
