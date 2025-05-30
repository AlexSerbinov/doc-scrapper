# generateImage()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-image
description: API Reference for generateImage.
---


# [`generateImage()`](#generateimage)


`generateImage` is an experimental feature.

Generates images based on a given prompt using an image model.

It is ideal for use cases where you need to generate images programmatically, such as creating visual content or generating images for data augmentation.

```
import{ experimental_generateImage as generateImage }from'ai';const{ images }=awaitgenerateImage({  model: openai.image('dall-e-3'),  prompt:'A futuristic cityscape at sunset',  n:3,  size:'1024x1024',});console.log(images);
```


## [Import](#import)


import { experimental\_generateImage as generateImage } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### model:


ImageModelV1

The image model to use.


### prompt:


string

The input prompt to generate the image from.


### n?:


number

Number of images to generate.


### size?:


string

Size of the images to generate. Format: \`{width}x{height}\`.


### aspectRatio?:


string

Aspect ratio of the images to generate. Format: \`{width}:{height}\`.


### seed?:


number

Seed for the image generation.


### providerOptions?:


Record<string, Record<string, JSONValue>>

Additional provider-specific options.


### maxRetries?:


number

Maximum number of retries. Default: 2.


### abortSignal?:


AbortSignal

An optional abort signal to cancel the call.


### headers?:


Record<string, string>

Additional HTTP headers for the request.


### [Returns](#returns)



### image:


GeneratedFile

The first image that was generated.

GeneratedFile


### base64:


string

Image as a base64 encoded string.


### uint8Array:


Uint8Array

Image as a Uint8Array.


### mimeType:


string

MIME type of the image.


### images:


Array<GeneratedFile>

All images that were generated.

GeneratedFile


### base64:


string

Image as a base64 encoded string.


### uint8Array:


Uint8Array

Image as a Uint8Array.


### mimeType:


string

MIME type of the image.


### warnings:


ImageGenerationWarning\[\]

Warnings from the model provider (e.g. unsupported settings).


### responses:


Array<ImageModelResponseMetadata>

Response metadata from the provider. There may be multiple responses if we made multiple calls to the model.

ImageModelResponseMetadata


### timestamp:


Date

Timestamp for the start of the generated response.


### modelId:


string

The ID of the response model that was used to generate the response.


### headers?:


Record<string, string>

Response headers.
