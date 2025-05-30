# transcribe()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/transcribe
description: API Reference for transcribe.
---


# [`transcribe()`](#transcribe)


`transcribe` is an experimental feature.

Generates a transcript from an audio file.

```
import{ experimental_transcribe as transcribe }from'ai';import{ openai }from'@ai-sdk/openai';import{ readFile }from'fs/promises';const{ transcript }=awaittranscribe({  model: openai.transcription('whisper-1'),  audio:awaitreadFile('audio.mp3'),});console.log(transcript);
```


## [Import](#import)


import { experimental\_transcribe as transcribe } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### model:


TranscriptionModelV1

The transcription model to use.


### audio:


DataContent (string | Uint8Array | ArrayBuffer | Buffer) | URL

The audio file to generate the transcript from.


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



### text:


string

The complete transcribed text from the audio input.


### segments:


Array<{ text: string; startSecond: number; endSecond: number }>

An array of transcript segments, each containing a portion of the transcribed text along with its start and end times in seconds.


### language:


string | undefined

The language of the transcript in ISO-639-1 format e.g. "en" for English.


### durationInSeconds:


number | undefined

The duration of the transcript in seconds.


### warnings:


TranscriptionWarning\[\]

Warnings from the model provider (e.g. unsupported settings).


### responses:


Array<TranscriptionModelResponseMetadata>

Response metadata from the provider. There may be multiple responses if we made multiple calls to the model.

TranscriptionModelResponseMetadata


### timestamp:


Date

Timestamp for the start of the generated response.


### modelId:


string

The ID of the response model that was used to generate the response.


### headers?:


Record<string, string>

Response headers.
