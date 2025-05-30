# Together.ai Provider


---
url: https://ai-sdk.dev/providers/ai-sdk-providers/togetherai
description: Learn how to use Together.ai's models with the AI SDK.
---


# [Together.ai Provider](#togetherai-provider)


The [Together.ai](https://together.ai) provider contains support for 200+ open-source models through the [Together.ai API](https://docs.together.ai/reference).


## [Setup](#setup)


The Together.ai provider is available via the `@ai-sdk/togetherai` module. You can install it with

pnpm

npm

yarn

pnpm add @ai-sdk/togetherai


## [Provider Instance](#provider-instance)


You can import the default provider instance `togetherai` from `@ai-sdk/togetherai`:

```
import{ togetherai }from'@ai-sdk/togetherai';
```

If you need a customized setup, you can import `createTogetherAI` from `@ai-sdk/togetherai` and create a provider instance with your settings:

```
import{ createTogetherAI }from'@ai-sdk/togetherai';const togetherai =createTogetherAI({  apiKey: process.env.TOGETHER_AI_API_KEY??'',});
```

You can use the following optional settings to customize the Together.ai provider instance:

-   **baseURL** *string*

    Use a different URL prefix for API calls, e.g. to use proxy servers. The default prefix is `https://api.together.xyz/v1`.

-   **apiKey** *string*

    API key that is being sent using the `Authorization` header. It defaults to the `TOGETHER_AI_API_KEY` environment variable.

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.

-   **fetch** *(input: RequestInfo, init?: RequestInit) => Promise<Response>*

    Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation. Defaults to the global `fetch` function. You can use it as a middleware to intercept requests, or to provide a custom fetch implementation for e.g. testing.



## [Language Models](#language-models)


You can create [Together.ai models](https://docs.together.ai/docs/serverless-models) using a provider instance. The first argument is the model id, e.g. `google/gemma-2-9b-it`.

```
const model =togetherai('google/gemma-2-9b-it');
```


### [Reasoning Models](#reasoning-models)


Together.ai exposes the thinking of `deepseek-ai/DeepSeek-R1` in the generated text using the `<think>` tag. You can use the `extractReasoningMiddleware` to extract this reasoning and expose it as a `reasoning` property on the result:

```
import{ togetherai }from'@ai-sdk/togetherai';import{ wrapLanguageModel, extractReasoningMiddleware }from'ai';const enhancedModel =wrapLanguageModel({  model:togetherai('deepseek-ai/DeepSeek-R1'),  middleware:extractReasoningMiddleware({ tagName:'think'}),});
```

You can then use that enhanced model in functions like `generateText` and `streamText`.


### [Example](#example)


You can use Together.ai language models to generate text with the `generateText` function:

```
import{ togetherai }from'@ai-sdk/togetherai';import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:togetherai('meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',});
```

Together.ai language models can also be used in the `streamText` function (see [AI SDK Core](/docs/ai-sdk-core)).

The Together.ai provider also supports [completion models](https://docs.together.ai/docs/serverless-models#language-models) via (following the above example code) `togetherai.completionModel()` and [embedding models](https://docs.together.ai/docs/serverless-models#embedding-models) via `togetherai.textEmbeddingModel()`.


## [Model Capabilities](#model-capabilities)


Model

Image Input

Object Generation

Tool Usage

Tool Streaming

`meta-llama/Meta-Llama-3.3-70B-Instruct-Turbo`

`meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo`

`mistralai/Mixtral-8x22B-Instruct-v0.1`

`mistralai/Mistral-7B-Instruct-v0.3`

`deepseek-ai/DeepSeek-V3`

`google/gemma-2b-it`

`Qwen/Qwen2.5-72B-Instruct-Turbo`

`databricks/dbrx-instruct`

The table above lists popular models. Please see the [Together.ai docs](https://docs.together.ai/docs/serverless-models) for a full list of available models. You can also pass any available provider model ID as a string if needed.


## [Image Models](#image-models)


You can create Together.ai image models using the `.image()` factory method. For more on image generation with the AI SDK see [generateImage()](/docs/reference/ai-sdk-core/generate-image).

```
import{ togetherai }from'@ai-sdk/togetherai';import{ experimental_generateImage as generateImage }from'ai';const{ images }=awaitgenerateImage({  model: togetherai.image('black-forest-labs/FLUX.1-dev'),  prompt:'A delighted resplendent quetzal mid flight amidst raindrops',});
```

You can pass optional provider-specific request parameters using the `providerOptions` argument.

```
import{ togetherai }from'@ai-sdk/togetherai';import{ experimental_generateImage as generateImage }from'ai';const{ images }=awaitgenerateImage({  model: togetherai.image('black-forest-labs/FLUX.1-dev'),  prompt:'A delighted resplendent quetzal mid flight amidst raindrops',  size:'512x512',// Optional additional provider-specific request parameters  providerOptions:{    togetherai:{      steps:40,},},});
```

For a complete list of available provider-specific options, see the [Together.ai Image Generation API Reference](https://docs.together.ai/reference/post_images-generations).


### [Model Capabilities](#model-capabilities-1)


Together.ai image models support various image dimensions that vary by model. Common sizes include 512x512, 768x768, and 1024x1024, with some models supporting up to 1792x1792. The default size is 1024x1024.

Available Models

`stabilityai/stable-diffusion-xl-base-1.0`

`black-forest-labs/FLUX.1-dev`

`black-forest-labs/FLUX.1-dev-lora`

`black-forest-labs/FLUX.1-schnell`

`black-forest-labs/FLUX.1-canny`

`black-forest-labs/FLUX.1-depth`

`black-forest-labs/FLUX.1-redux`

`black-forest-labs/FLUX.1.1-pro`

`black-forest-labs/FLUX.1-pro`

`black-forest-labs/FLUX.1-schnell-Free`

Please see the [Together.ai models page](https://docs.together.ai/docs/serverless-models#image-models) for a full list of available image models and their capabilities.
