# Speech


---
url: https://ai-sdk.dev/docs/ai-sdk-core/speech
description: Learn how to generate speech from text with the AI SDK.
---


# [Speech](#speech)


Speech is an experimental feature.

The AI SDK provides the [`generateSpeech`](/docs/reference/ai-sdk-core/generate-speech) function to generate speech from text using a speech model.

```
import{ experimental_generateSpeech as generateSpeech }from'ai';import{ openai }from'@ai-sdk/openai';import{ readFile }from'fs/promises';const audio =awaitgenerateSpeech({  model: openai.speech('tts-1'),  text:'Hello, world!',  voice:'alloy',});
```

To access the generated audio:

```
const audio = audio.audioData;// audio data e.g. Uint8Array
```


## [Settings](#settings)



### [Provider-Specific settings](#provider-specific-settings)


You can set model-specific settings with the `providerOptions` parameter.

```
import{ experimental_generateSpeech as generateSpeech }from'ai';import{ openai }from'@ai-sdk/openai';import{ readFile }from'fs/promises';const audio =awaitgenerateSpeech({  model: openai.speech('tts-1'),  text:'Hello, world!',  providerOptions:{    openai:{// ...},},});
```


### [Abort Signals and Timeouts](#abort-signals-and-timeouts)


`generateSpeech` accepts an optional `abortSignal` parameter of type [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that you can use to abort the speech generation process or set a timeout.

```
import{ openai }from'@ai-sdk/openai';import{ experimental_generateSpeech as generateSpeech }from'ai';import{ readFile }from'fs/promises';const audio =awaitgenerateSpeech({  model: openai.speech('tts-1'),  text:'Hello, world!',  abortSignal:AbortSignal.timeout(1000),// Abort after 1 second});
```


### [Custom Headers](#custom-headers)


`generateSpeech` accepts an optional `headers` parameter of type `Record<string, string>` that you can use to add custom headers to the speech generation request.

```
import{ openai }from'@ai-sdk/openai';import{ experimental_generateSpeech as generateSpeech }from'ai';import{ readFile }from'fs/promises';const audio =awaitgenerateSpeech({  model: openai.speech('tts-1'),  text:'Hello, world!',  headers:{'X-Custom-Header':'custom-value'},});
```


### [Warnings](#warnings)


Warnings (e.g. unsupported parameters) are available on the `warnings` property.

```
import{ openai }from'@ai-sdk/openai';import{ experimental_generateSpeech as generateSpeech }from'ai';import{ readFile }from'fs/promises';const audio =awaitgenerateSpeech({  model: openai.speech('tts-1'),  text:'Hello, world!',});const warnings = audio.warnings;
```


### [Error Handling](#error-handling)


When `generateSpeech` cannot generate a valid audio, it throws a [`AI_NoAudioGeneratedError`](/docs/reference/ai-sdk-errors/ai-no-audio-generated-error).

This error can arise for any the following reasons:

-   The model failed to generate a response
-   The model generated a response that could not be parsed

The error preserves the following information to help you log the issue:

-   `responses`: Metadata about the speech model responses, including timestamp, model, and headers.
-   `cause`: The cause of the error. You can use this for more detailed error handling.

```
import{  experimental_generateSpeech as generateSpeech,AI_NoAudioGeneratedError,}from'ai';import{ openai }from'@ai-sdk/openai';import{ readFile }from'fs/promises';try{awaitgenerateSpeech({    model: openai.speech('tts-1'),    text:'Hello, world!',});}catch(error){if(AI_NoAudioGeneratedError.isInstance(error)){console.log('AI_NoAudioGeneratedError');console.log('Cause:', error.cause);console.log('Responses:', error.responses);}}
```


## [Speech Models](#speech-models)


Provider

Model

[OpenAI](/providers/ai-sdk-providers/openai#speech-models)

`tts-1`

[OpenAI](/providers/ai-sdk-providers/openai#speech-models)

`tts-1-hd`

[OpenAI](/providers/ai-sdk-providers/openai#speech-models)

`gpt-4o-mini-tts`

[LMNT](/providers/ai-sdk-providers/lmnt#speech-models)

`aurora`

[LMNT](/providers/ai-sdk-providers/lmnt#speech-models)

`blizzard`

[Hume](/providers/ai-sdk-providers/hume#speech-models)

`default`

Above are a small subset of the speech models supported by the AI SDK providers. For more, see the respective provider documentation.
