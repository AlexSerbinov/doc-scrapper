# Sarvam Provider


---
url: https://ai-sdk.dev/providers/community-providers/sarvam
description: Learn how to use the Sarvam AI provider for the AI SDK.
---


# [Sarvam Provider](#sarvam-provider)


The Sarvam AI Provider is a library developed to integrate with the AI SDK. This library brings Speech to Text (STT) capabilities to your applications, allowing for seamless interaction with audio and text data.


## [Setup](#setup)


The Sarvam provider is available in the `sarvam-ai-provider` module. You can install it with:

pnpm

npm

yarn

pnpm add sarvam-ai-provider


## [Provider Instance](#provider-instance)


First, get your **Sarvam API Key** from the [Sarvam Dashboard](https://dashboard.sarvam.ai/auth/signin).

Then initialize `Sarvam` in your application:

```
import{ createSarvam }from'sarvam-ai-provider';const sarvam =createSarvam({  headers:{'api-subscription-key':'YOUR_API_KEY',},});
```

The `api-subscription-key` needs to be passed in headers. Consider using `YOUR_API_KEY` as environment variables for security.

-   Transcribe speech to text

```
import{ experimental_transcribe as transcribe }from'ai';import{ readFile }from'fs/promises';awaittranscribe({  model: sarvam.transcription('saarika:v2'),  audio:awaitreadFile('./src/transcript-test.mp3'),  providerOptions:{    sarvam:{      language_code:'en-IN',},},});
```


## [Features](#features)



### [Changing parameters](#changing-parameters)


-   Change language\_code

```
providerOptions:{    sarvam:{      language_code:'en-IN',},},
```

`language_code` specifies the language of the input audio and is required for accurate transcription. • It is mandatory for the `saarika:v1` model (this model does not support `unknown`). • It is optional for the `saarika:v2` model. • Use `unknown` when the language is not known; in that case, the API will auto‑detect it. Available options: `unknown`, `hi-IN`, `bn-IN`, `kn-IN`, `ml-IN`, `mr-IN`, `od-IN`, `pa-IN`, `ta-IN`, `te-IN`, `en-IN`, `gu-IN`.

-   with\_timestamps?

```
providerOptions:{  sarvam:{    with_timestamps:true,},},
```

`with_timestamps` specifies whether to include start/end timestamps for each word/token. • Type: boolean • When true, each word/token will include start/end timestamps. • Default: false

-   with\_diarization?

```
providerOptions:{  sarvam:{    with_diarization:true,},},
```

`with_diarization` enables speaker diarization (Beta). • Type: boolean • When true, enables speaker diarization. • Default: false

-   num\_speakers?

```
providerOptions:{  sarvam:{    with_diarization:true,    num_speakers:2,},},
```

`num_speakers` sets the number of distinct speakers to detect (only when `with_diarization` is true). • Type: number | null • Number of distinct speakers to detect. • Default: null


## [References](#references)


-   [Sarvam API Docs](https://docs.sarvam.ai/api-reference-docs/endpoints/speech-to-text)
