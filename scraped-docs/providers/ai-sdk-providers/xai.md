# xAI Grok Provider


---
url: https://ai-sdk.dev/providers/ai-sdk-providers/xai
description: Learn how to use xAI Grok.
---


# [xAI Grok Provider](#xai-grok-provider)


The [xAI Grok](https://x.ai) provider contains language model support for the [xAI API](https://x.ai/api).


## [Setup](#setup)


The xAI Grok provider is available via the `@ai-sdk/xai` module. You can install it with

pnpm

npm

yarn

pnpm add @ai-sdk/xai


## [Provider Instance](#provider-instance)


You can import the default provider instance `xai` from `@ai-sdk/xai`:

```
import{ xai }from'@ai-sdk/xai';
```

If you need a customized setup, you can import `createXai` from `@ai-sdk/xai` and create a provider instance with your settings:

```
import{ createXai }from'@ai-sdk/xai';const xai =createXai({  apiKey:'your-api-key',});
```

You can use the following optional settings to customize the xAI provider instance:

-   **baseURL** *string*

    Use a different URL prefix for API calls, e.g. to use proxy servers. The default prefix is `https://api.x.ai/v1`.

-   **apiKey** *string*

    API key that is being sent using the `Authorization` header. It defaults to the `XAI_API_KEY` environment variable.

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.

-   **fetch** *(input: RequestInfo, init?: RequestInit) => Promise<Response>*

    Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation. Defaults to the global `fetch` function. You can use it as a middleware to intercept requests, or to provide a custom fetch implementation for e.g. testing.



## [Language Models](#language-models)


You can create [xAI models](https://console.x.ai) using a provider instance. The first argument is the model id, e.g. `grok-beta`.

```
const model =xai('grok-3');
```


### [Example](#example)


You can use xAI language models to generate text with the `generateText` function:

```
import{ xai }from'@ai-sdk/xai';import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:xai('grok-3'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',});
```

xAI language models can also be used in the `streamText`, `generateObject`, and `streamObject` functions (see [AI SDK Core](/docs/ai-sdk-core)).


### [Chat Models](#chat-models)


xAI chat models also support some model specific settings that are not part of the [standard call settings](/docs/ai-sdk-core/settings). You can pass them as an options argument:

```
const model =xai('grok-3',{  user:'test-user',// optional unique user identifier});
```

The following optional settings are available for xAI chat models:

-   **user** *string*

    A unique identifier representing your end-user, which can help xAI to monitor and detect abuse.


xAI chat models also support some model specific provider options. You can pass them in `providerOptions` argument:

```
const model =xai('grok-3');awaitgenerateText({  model,  providerOptions:{    xai:{      reasoningEffort:'high',},},});
```

The following optional provider options are available for xAI chat models:

-   **reasoningEffort** *'low' | 'medium' | 'high'*

    Reasoning effort for reasoning models. Defaults to `medium`. If you use `providerOptions` to set the `reasoningEffort` option, this model setting will be ignored.



## [Model Capabilities](#model-capabilities)


Model

Image Input

Object Generation

Tool Usage

Tool Streaming

`grok-3`

`grok-3-fast`

`grok-3-mini`

`grok-3-mini-fast`

`grok-2-1212`

`grok-2-vision-1212`

`grok-beta`

`grok-vision-beta`

The table above lists popular models. Please see the [xAI docs](https://docs.x.ai/docs#models) for a full list of available models. The table above lists popular models. You can also pass any available provider model ID as a string if needed.


## [Image Models](#image-models)


You can create xAI image models using the `.imageModel()` factory method. For more on image generation with the AI SDK see [generateImage()](/docs/reference/ai-sdk-core/generate-image).

```
import{ xai }from'@ai-sdk/xai';import{ experimental_generateImage as generateImage }from'ai';const{ image }=awaitgenerateImage({  model: xai.image('grok-2-image'),  prompt:'A futuristic cityscape at sunset',});
```

The xAI image model does not currently support the `aspectRatio` or `size` parameters. Image size defaults to 1024x768.


### [Model-specific options](#model-specific-options)


You can customize the image generation behavior with model-specific settings:

```
import{ xai }from'@ai-sdk/xai';import{ experimental_generateImage as generateImage }from'ai';const{ images }=awaitgenerateImage({  model: xai.image('grok-2-image',{    maxImagesPerCall:5,// Default is 10}),  prompt:'A futuristic cityscape at sunset',  n:2,// Generate 2 images});
```


### [Model Capabilities](#model-capabilities-1)


Model

Sizes

Notes

`grok-2-image`

1024x768 (default)

xAI's text-to-image generation model, designed to create high-quality images from text prompts. It's trained on a diverse dataset and can generate images across various styles, subjects, and settings.
