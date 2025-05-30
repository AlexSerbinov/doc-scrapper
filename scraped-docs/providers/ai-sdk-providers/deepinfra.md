# DeepInfra Provider


---
url: https://ai-sdk.dev/providers/ai-sdk-providers/deepinfra
description: Learn how to use DeepInfra's models with the AI SDK.
---


# [DeepInfra Provider](#deepinfra-provider)


The [DeepInfra](https://deepinfra.com) provider contains support for state-of-the-art models through the DeepInfra API, including Llama 3, Mixtral, Qwen, and many other popular open-source models.


## [Setup](#setup)


The DeepInfra provider is available via the `@ai-sdk/deepinfra` module. You can install it with:

pnpm

npm

yarn

pnpm add @ai-sdk/deepinfra


## [Provider Instance](#provider-instance)


You can import the default provider instance `deepinfra` from `@ai-sdk/deepinfra`:

```
import{ deepinfra }from'@ai-sdk/deepinfra';
```

If you need a customized setup, you can import `createDeepInfra` from `@ai-sdk/deepinfra` and create a provider instance with your settings:

```
import{ createDeepInfra }from'@ai-sdk/deepinfra';const deepinfra =createDeepInfra({  apiKey: process.env.DEEPINFRA_API_KEY??'',});
```

You can use the following optional settings to customize the DeepInfra provider instance:

-   **baseURL** *string*

    Use a different URL prefix for API calls, e.g. to use proxy servers. The default prefix is `https://api.deepinfra.com/v1/openai`.

-   **apiKey** *string*

    API key that is being sent using the `Authorization` header. It defaults to the `DEEPINFRA_API_KEY` environment variable.

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.

-   **fetch** *(input: RequestInfo, init?: RequestInit) => Promise<Response>*

    Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation. Defaults to the global `fetch` function. You can use it as a middleware to intercept requests, or to provide a custom fetch implementation for e.g. testing.



## [Language Models](#language-models)


You can create language models using a provider instance. The first argument is the model ID, for example:

```
import{ deepinfra }from'@ai-sdk/deepinfra';import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:deepinfra('meta-llama/Meta-Llama-3.1-70B-Instruct'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',});
```

DeepInfra language models can also be used in the `streamText` function (see [AI SDK Core](/docs/ai-sdk-core)).


## [Model Capabilities](#model-capabilities)


Model

Image Input

Object Generation

Tool Usage

Tool Streaming

`meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8`

`meta-llama/Llama-4-Scout-17B-16E-Instruct`

`meta-llama/Llama-3.3-70B-Instruct-Turbo`

`meta-llama/Llama-3.3-70B-Instruct`

`meta-llama/Meta-Llama-3.1-405B-Instruct`

`meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo`

`meta-llama/Meta-Llama-3.1-70B-Instruct`

`meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo`

`meta-llama/Meta-Llama-3.1-8B-Instruct`

`meta-llama/Llama-3.2-11B-Vision-Instruct`

`meta-llama/Llama-3.2-90B-Vision-Instruct`

`mistralai/Mixtral-8x7B-Instruct-v0.1`

`deepseek-ai/DeepSeek-V3`

`deepseek-ai/DeepSeek-R1`

`deepseek-ai/DeepSeek-R1-Distill-Llama-70B`

`deepseek-ai/DeepSeek-R1-Turbo`

`nvidia/Llama-3.1-Nemotron-70B-Instruct`

`Qwen/Qwen2-7B-Instruct`

`Qwen/Qwen2.5-72B-Instruct`

`Qwen/Qwen2.5-Coder-32B-Instruct`

`Qwen/QwQ-32B-Preview`

`google/codegemma-7b-it`

`google/gemma-2-9b-it`

`microsoft/WizardLM-2-8x22B`

The table above lists popular models. Please see the [DeepInfra docs](https://deepinfra.com) for a full list of available models. You can also pass any available provider model ID as a string if needed.


## [Image Models](#image-models)


You can create DeepInfra image models using the `.image()` factory method. For more on image generation with the AI SDK see [generateImage()](/docs/reference/ai-sdk-core/generate-image).

```
import{ deepinfra }from'@ai-sdk/deepinfra';import{ experimental_generateImage as generateImage }from'ai';const{ image }=awaitgenerateImage({  model: deepinfra.image('stabilityai/sd3.5'),  prompt:'A futuristic cityscape at sunset',  aspectRatio:'16:9',});
```

Model support for `size` and `aspectRatio` parameters varies by model. Please check the individual model documentation on [DeepInfra's models page](https://deepinfra.com/models/text-to-image) for supported options and additional parameters.


### [Model-specific options](#model-specific-options)


You can pass model-specific parameters using the `providerOptions.deepinfra` field:

```
import{ deepinfra }from'@ai-sdk/deepinfra';import{ experimental_generateImage as generateImage }from'ai';const{ image }=awaitgenerateImage({  model: deepinfra.image('stabilityai/sd3.5'),  prompt:'A futuristic cityscape at sunset',  aspectRatio:'16:9',  providerOptions:{    deepinfra:{      num_inference_steps:30,// Control the number of denoising steps (1-50)},},});
```


### [Model Capabilities](#model-capabilities-1)


For models supporting aspect ratios, the following ratios are typically supported: `1:1 (default), 16:9, 1:9, 3:2, 2:3, 4:5, 5:4, 9:16, 9:21`

For models supporting size parameters, dimensions must typically be:

-   Multiples of 32
-   Width and height between 256 and 1440 pixels
-   Default size is 1024x1024

Model

Dimensions Specification

Notes

`stabilityai/sd3.5`

Aspect Ratio

Premium quality base model, 8B parameters

`black-forest-labs/FLUX-1.1-pro`

Size

Latest state-of-art model with superior prompt following

`black-forest-labs/FLUX-1-schnell`

Size

Fast generation in 1-4 steps

`black-forest-labs/FLUX-1-dev`

Size

Optimized for anatomical accuracy

`black-forest-labs/FLUX-pro`

Size

Flagship Flux model

`stabilityai/sd3.5-medium`

Aspect Ratio

Balanced 2.5B parameter model

`stabilityai/sdxl-turbo`

Aspect Ratio

Optimized for fast generation

For more details and pricing information, see the [DeepInfra text-to-image models page](https://deepinfra.com/models/text-to-image).
