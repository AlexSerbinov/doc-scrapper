# Replicate Provider


---
url: https://ai-sdk.dev/providers/ai-sdk-providers/replicate
description: Learn how to use Replicate models with the AI SDK.
---


# [Replicate Provider](#replicate-provider)


[Replicate](https://replicate.com/) is a platform for running open-source AI models. It is a popular choice for running image generation models.


## [Setup](#setup)


The Replicate provider is available via the `@ai-sdk/replicate` module. You can install it with

pnpm

npm

yarn

pnpm add ai @ai-sdk/replicate


## [Provider Instance](#provider-instance)


You can import the default provider instance `replicate` from `@ai-sdk/replicate`:

```
import{ replicate }from'@ai-sdk/replicate';
```

If you need a customized setup, you can import `createReplicate` from `@ai-sdk/replicate` and create a provider instance with your settings:

```
import{ createReplicate }from'@ai-sdk/replicate';const replicate =createReplicate({  apiToken: process.env.REPLICATE_API_TOKEN??'',});
```

You can use the following optional settings to customize the Replicate provider instance:

-   **baseURL** *string*

    Use a different URL prefix for API calls, e.g. to use proxy servers. The default prefix is `https://api.replicate.com/v1`.

-   **apiToken** *string*

    API token that is being sent using the `Authorization` header. It defaults to the `REPLICATE_API_TOKEN` environment variable.

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.

-   **fetch** *(input: RequestInfo, init?: RequestInit) => Promise<Response>*

    Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation.



## [Image Models](#image-models)


You can create Replicate image models using the `.image()` factory method. For more on image generation with the AI SDK see [generateImage()](/docs/reference/ai-sdk-core/generate-image).

Model support for `size` and other parameters varies by model. Check the model's documentation on [Replicate](https://replicate.com/explore) for supported options and additional parameters that can be passed via `providerOptions.replicate`.


### [Supported Image Models](#supported-image-models)


The following image models are currently supported by the Replicate provider:

-   [black-forest-labs/flux-1.1-pro-ultra](https://replicate.com/black-forest-labs/flux-1.1-pro-ultra)
-   [black-forest-labs/flux-1.1-pro](https://replicate.com/black-forest-labs/flux-1.1-pro)
-   [black-forest-labs/flux-dev](https://replicate.com/black-forest-labs/flux-dev)
-   [black-forest-labs/flux-pro](https://replicate.com/black-forest-labs/flux-pro)
-   [black-forest-labs/flux-schnell](https://replicate.com/black-forest-labs/flux-schnell)
-   [ideogram-ai/ideogram-v2-turbo](https://replicate.com/ideogram-ai/ideogram-v2-turbo)
-   [ideogram-ai/ideogram-v2](https://replicate.com/ideogram-ai/ideogram-v2)
-   [luma/photon-flash](https://replicate.com/luma/photon-flash)
-   [luma/photon](https://replicate.com/luma/photon)
-   [recraft-ai/recraft-v3-svg](https://replicate.com/recraft-ai/recraft-v3-svg)
-   [recraft-ai/recraft-v3](https://replicate.com/recraft-ai/recraft-v3)
-   [stability-ai/stable-diffusion-3.5-large-turbo](https://replicate.com/stability-ai/stable-diffusion-3.5-large-turbo)
-   [stability-ai/stable-diffusion-3.5-large](https://replicate.com/stability-ai/stable-diffusion-3.5-large)
-   [stability-ai/stable-diffusion-3.5-medium](https://replicate.com/stability-ai/stable-diffusion-3.5-medium)

You can also use [versioned models](https://replicate.com/docs/topics/models/versions). The id for versioned models is the Replicate model id followed by a colon and the version ID (`$modelId:$versionId`), e.g. `bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637`.


### [Basic Usage](#basic-usage)


```
import{ replicate }from'@ai-sdk/replicate';import{ experimental_generateImage as generateImage }from'ai';import{ writeFile }from'node:fs/promises';const{ image }=awaitgenerateImage({  model: replicate.image('black-forest-labs/flux-schnell'),  prompt:'The Loch Ness Monster getting a manicure',  aspectRatio:'16:9',});awaitwriteFile('image.webp', image.uint8Array);console.log('Image saved as image.webp');
```


### [Model-specific options](#model-specific-options)


```
import{ replicate }from'@ai-sdk/replicate';import{ experimental_generateImage as generateImage }from'ai';const{ image }=awaitgenerateImage({  model: replicate.image('recraft-ai/recraft-v3'),  prompt:'The Loch Ness Monster getting a manicure',  size:'1365x1024',  providerOptions:{    replicate:{      style:'realistic_image',},},});
```


### [Versioned Models](#versioned-models)


```
import{ replicate }from'@ai-sdk/replicate';import{ experimental_generateImage as generateImage }from'ai';const{ image }=awaitgenerateImage({  model: replicate.image('bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637',),  prompt:'The Loch Ness Monster getting a manicure',});
```

For more details, see the [Replicate models page](https://replicate.com/explore).
