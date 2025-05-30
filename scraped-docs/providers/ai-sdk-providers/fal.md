# Fal Provider


---
url: https://ai-sdk.dev/providers/ai-sdk-providers/fal
description: Learn how to use Fal AI models with the AI SDK.
---


# [Fal Provider](#fal-provider)


[Fal AI](https://fal.ai/) provides a generative media platform for developers with lightning-fast inference capabilities. Their platform offers optimized performance for running diffusion models, with speeds up to 4x faster than alternatives.


## [Setup](#setup)


The Fal provider is available via the `@ai-sdk/fal` module. You can install it with

pnpm

npm

yarn

pnpm add @ai-sdk/fal


## [Provider Instance](#provider-instance)


You can import the default provider instance `fal` from `@ai-sdk/fal`:

```
import{ fal }from'@ai-sdk/fal';
```

If you need a customized setup, you can import `createFal` and create a provider instance with your settings:

```
import{ createFal }from'@ai-sdk/fal';const fal =createFal({  apiKey:'your-api-key',// optional, defaults to FAL_API_KEY environment variable, falling back to FAL_KEY  baseURL:'custom-url',// optional  headers:{/* custom headers */},// optional});
```

You can use the following optional settings to customize the Fal provider instance:

-   **baseURL** *string*

    Use a different URL prefix for API calls, e.g. to use proxy servers. The default prefix is `https://fal.run`.

-   **apiKey** *string*

    API key that is being sent using the `Authorization` header. It defaults to the `FAL_API_KEY` environment variable, falling back to `FAL_KEY`.

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.

-   **fetch** *(input: RequestInfo, init?: RequestInit) => Promise<Response>*

    Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation. You can use it as a middleware to intercept requests, or to provide a custom fetch implementation for e.g. testing.



## [Image Models](#image-models)


You can create Fal image models using the `.image()` factory method. For more on image generation with the AI SDK see [generateImage()](/docs/reference/ai-sdk-core/generate-image).


### [Basic Usage](#basic-usage)


```
import{ fal }from'@ai-sdk/fal';import{ experimental_generateImage as generateImage }from'ai';importfsfrom'fs';const{ image }=awaitgenerateImage({  model: fal.image('fal-ai/fast-sdxl'),  prompt:'A serene mountain landscape at sunset',});const filename =`image-${Date.now()}.png`;fs.writeFileSync(filename, image.uint8Array);console.log(`Image saved to ${filename}`);
```


### [Model Capabilities](#model-capabilities)


Fal offers many models optimized for different use cases. Here are a few popular examples. For a full list of models, see the [Fal AI documentation](https://fal.ai/models).

Model

Description

`fal-ai/fast-sdxl`

High-speed SDXL model optimized for quick inference with up to 4x faster speeds

`fal-ai/flux-lora`

Super fast endpoint for the FLUX.1 \[dev\] model with LoRA support, enabling rapid and high-quality image generation using pre-trained LoRA adaptations.

`fal-ai/flux-pro/v1.1-ultra`

Professional-grade image generation with up to 2K resolution and enhanced photorealism

`fal-ai/ideogram/v2`

Specialized for high-quality posters and logos with exceptional typography handling

`fal-ai/recraft-v3`

SOTA in image generation with vector art and brand style capabilities

`fal-ai/stable-diffusion-3.5-large`

Advanced MMDiT model with improved typography and complex prompt understanding

`fal-ai/hyper-sdxl`

Performance-optimized SDXL variant with enhanced creative capabilities

Fal models support the following aspect ratios:

-   1:1 (square HD)
-   16:9 (landscape)
-   9:16 (portrait)
-   4:3 (landscape)
-   3:4 (portrait)
-   16:10 (1280x800)
-   10:16 (800x1280)
-   21:9 (2560x1080)
-   9:21 (1080x2560)

Key features of Fal models include:

-   Up to 4x faster inference speeds compared to alternatives
-   Optimized by the Fal Inference Engine™
-   Support for real-time infrastructure
-   Cost-effective scaling with pay-per-use pricing
-   LoRA training capabilities for model personalization


### [Advanced Features](#advanced-features)


Fal's platform offers several advanced capabilities:

-   **Private Model Inference**: Run your own diffusion transformer models with up to 50% faster inference
-   **LoRA Training**: Train and personalize models in under 5 minutes
-   **Real-time Infrastructure**: Enable new user experiences with fast inference times
-   **Scalable Architecture**: Scale to thousands of GPUs when needed

For more details about Fal's capabilities and features, visit the [Fal AI documentation](https://fal.ai/docs).


## [Transcription Models](#transcription-models)


You can create models that call the [Fal transcription API](https://docs.fal.ai/guides/convert-speech-to-text) using the `.transcription()` factory method.

The first argument is the model id without the `fal-ai/` prefix e.g. `wizper`.

```
const model = fal.transcription('wizper');
```

You can also pass additional provider-specific options using the `providerOptions` argument. For example, supplying the `batchSize` option will increase the number of audio chunks processed in parallel.

```
import{ experimental_transcribe as transcribe }from'ai';import{ fal }from'@ai-sdk/fal';import{ readFile }from'fs/promises';const result =awaittranscribe({  model: fal.transcription('wizper'),  audio:awaitreadFile('audio.mp3'),  providerOptions:{ fal:{ batchSize:10}},});
```

The following provider options are available:

-   **language** *string* Language of the audio file. If set to null, the language will be automatically detected. Accepts ISO language codes like 'en', 'fr', 'zh', etc. Optional.

-   **diarize** *boolean* Whether to diarize the audio file (identify different speakers). Defaults to true. Optional.

-   **chunkLevel** *string* Level of the chunks to return. Either 'segment' or 'word'. Default value: "word" Optional.

-   **version** *string* Version of the model to use. All models are Whisper large variants. Default value: "3" Optional.

-   **batchSize** *number* Batch size for processing. Default value: 64 Optional.

-   **numSpeakers** *number* Number of speakers in the audio file. If not provided, the number of speakers will be automatically detected. Optional.



### [Model Capabilities](#model-capabilities-1)


Model

Transcription

Duration

Segments

Language

`whisper`

`wizper`
