# Transcription


---
url: https://ai-sdk.dev/docs/ai-sdk-core/transcription
description: Learn how to transcribe audio with the AI SDK.
---


# [Transcription](#transcription)


Transcription is an experimental feature.

The AI SDK provides the [`transcribe`](/docs/reference/ai-sdk-core/transcribe) function to transcribe audio using a transcription model.

```
import{ experimental_transcribe as transcribe }from'ai';import{ openai }from'@ai-sdk/openai';import{ readFile }from'fs/promises';const transcript =awaittranscribe({  model: openai.transcription('whisper-1'),  audio:awaitreadFile('audio.mp3'),});
```

The `audio` property can be a `Uint8Array`, `ArrayBuffer`, `Buffer`, `string` (base64 encoded audio data), or a `URL`.

To access the generated transcript:

```
const text = transcript.text;// transcript text e.g. "Hello, world!"const segments = transcript.segments;// array of segments with start and end times, if availableconst language = transcript.language;// language of the transcript e.g. "en", if availableconst durationInSeconds = transcript.durationInSeconds;// duration of the transcript in seconds, if available
```


## [Settings](#settings)



### [Provider-Specific settings](#provider-specific-settings)


Transcription models often have provider or model-specific settings which you can set using the `providerOptions` parameter.

```
import{ experimental_transcribe as transcribe }from'ai';import{ openai }from'@ai-sdk/openai';import{ readFile }from'fs/promises';const transcript =awaittranscribe({  model: openai.transcription('whisper-1'),  audio:awaitreadFile('audio.mp3'),  providerOptions:{    openai:{      timestampGranularities:['word'],},},});
```


### [Abort Signals and Timeouts](#abort-signals-and-timeouts)


`transcribe` accepts an optional `abortSignal` parameter of type [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that you can use to abort the transcription process or set a timeout.

```
import{ openai }from'@ai-sdk/openai';import{ experimental_transcribe as transcribe }from'ai';import{ readFile }from'fs/promises';const transcript =awaittranscribe({  model: openai.transcription('whisper-1'),  audio:awaitreadFile('audio.mp3'),  abortSignal:AbortSignal.timeout(1000),// Abort after 1 second});
```


### [Custom Headers](#custom-headers)


`transcribe` accepts an optional `headers` parameter of type `Record<string, string>` that you can use to add custom headers to the transcription request.

```
import{ openai }from'@ai-sdk/openai';import{ experimental_transcribe as transcribe }from'ai';import{ readFile }from'fs/promises';const transcript =awaittranscribe({  model: openai.transcription('whisper-1'),  audio:awaitreadFile('audio.mp3'),  headers:{'X-Custom-Header':'custom-value'},});
```


### [Warnings](#warnings)


Warnings (e.g. unsupported parameters) are available on the `warnings` property.

```
import{ openai }from'@ai-sdk/openai';import{ experimental_transcribe as transcribe }from'ai';import{ readFile }from'fs/promises';const transcript =awaittranscribe({  model: openai.transcription('whisper-1'),  audio:awaitreadFile('audio.mp3'),});const warnings = transcript.warnings;
```


### [Error Handling](#error-handling)


When `transcribe` cannot generate a valid transcript, it throws a [`AI_NoTranscriptGeneratedError`](/docs/reference/ai-sdk-errors/ai-no-transcript-generated-error).

This error can arise for any the following reasons:

-   The model failed to generate a response
-   The model generated a response that could not be parsed

The error preserves the following information to help you log the issue:

-   `responses`: Metadata about the transcription model responses, including timestamp, model, and headers.
-   `cause`: The cause of the error. You can use this for more detailed error handling.

```
import{  experimental_transcribe as transcribe,NoTranscriptGeneratedError,}from'ai';import{ openai }from'@ai-sdk/openai';import{ readFile }from'fs/promises';try{awaittranscribe({    model: openai.transcription('whisper-1'),    audio:awaitreadFile('audio.mp3'),});}catch(error){if(NoTranscriptGeneratedError.isInstance(error)){console.log('NoTranscriptGeneratedError');console.log('Cause:', error.cause);console.log('Responses:', error.responses);}}
```


## [Transcription Models](#transcription-models)


Provider

Model

[OpenAI](/providers/ai-sdk-providers/openai#transcription-models)

`whisper-1`

[OpenAI](/providers/ai-sdk-providers/openai#transcription-models)

`gpt-4o-transcribe`

[OpenAI](/providers/ai-sdk-providers/openai#transcription-models)

`gpt-4o-mini-transcribe`

[ElevenLabs](/providers/ai-sdk-providers/elevenlabs#transcription-models)

`scribe_v1`

[ElevenLabs](/providers/ai-sdk-providers/elevenlabs#transcription-models)

`scribe_v1_experimental`

[Groq](/providers/ai-sdk-providers/groq#transcription-models)

`whisper-large-v3-turbo`

[Groq](/providers/ai-sdk-providers/groq#transcription-models)

`distil-whisper-large-v3-en`

[Groq](/providers/ai-sdk-providers/groq#transcription-models)

`whisper-large-v3`

[Azure OpenAI](/providers/ai-sdk-providers/azure#transcription-models)

`whisper-1`

[Azure OpenAI](/providers/ai-sdk-providers/azure#transcription-models)

`gpt-4o-transcribe`

[Azure OpenAI](/providers/ai-sdk-providers/azure#transcription-models)

`gpt-4o-mini-transcribe`

[Rev.ai](/providers/ai-sdk-providers/revai#transcription-models)

`machine`

[Rev.ai](/providers/ai-sdk-providers/revai#transcription-models)

`low_cost`

[Rev.ai](/providers/ai-sdk-providers/revai#transcription-models)

`fusion`

[Deepgram](/providers/ai-sdk-providers/deepgram#transcription-models)

`base` (+ variants)

[Deepgram](/providers/ai-sdk-providers/deepgram#transcription-models)

`enhanced` (+ variants)

[Deepgram](/providers/ai-sdk-providers/deepgram#transcription-models)

`nova` (+ variants)

[Deepgram](/providers/ai-sdk-providers/deepgram#transcription-models)

`nova-2` (+ variants)

[Deepgram](/providers/ai-sdk-providers/deepgram#transcription-models)

`nova-3` (+ variants)

[Gladia](/providers/ai-sdk-providers/gladia#transcription-models)

`default`

[AssemblyAI](/providers/ai-sdk-providers/assemblyai#transcription-models)

`best`

[AssemblyAI](/providers/ai-sdk-providers/assemblyai#transcription-models)

`nano`

[Fal](/providers/ai-sdk-providers/fal#transcription-models)

`whisper`

[Fal](/providers/ai-sdk-providers/fal#transcription-models)

`wizper`

Above are a small subset of the transcription models supported by the AI SDK providers. For more, see the respective provider documentation.
