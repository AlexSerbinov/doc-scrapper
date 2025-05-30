# generateSpeech()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-speech
description: API Reference for generateSpeech.
---


# [`generateSpeech()`](#generatespeech)


`generateSpeech` is an experimental feature.

Generates speech audio from text.

```
import{ experimental_generateSpeech as generateSpeech }from'ai';import{ openai }from'@ai-sdk/openai';import{ readFile }from'fs/promises';const{ audio }=awaitgenerateSpeech({  model: openai.speech('tts-1'),  text:'Hello from the AI SDK!',});console.log(audio);
```


## [Import](#import)


import { experimental\_generateSpeech as generateSpeech } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### model:


SpeechModelV1

The speech model to use.


### text:


string

The text to generate the speech from.


### voice?:


string

The voice to use for the speech.


### outputFormat?:


string

The output format to use for the speech e.g. "mp3", "wav", etc.


### instructions?:


string

Instructions for the speech generation.


### speed?:


number

The speed of the speech generation.


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



### audio:


GeneratedAudioFile

The generated audio.

GeneratedAudioFile


### base64:


string

Audio as a base64 encoded string.


### uint8Array:


Uint8Array

Audio as a Uint8Array.


### mimeType:


string

MIME type of the audio (e.g. "audio/mpeg").


### format:


string

Format of the audio (e.g. "mp3").


### warnings:


SpeechWarning\[\]

Warnings from the model provider (e.g. unsupported settings).


### responses:


Array<SpeechModelResponseMetadata>

Response metadata from the provider. There may be multiple responses if we made multiple calls to the model.

SpeechModelResponseMetadata


### timestamp:


Date

Timestamp for the start of the generated response.


### modelId:


string

The ID of the response model that was used to generate the response.


### headers?:


Record<string, string>

Response headers.
