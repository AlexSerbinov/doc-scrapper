# LMNT Provider


---
url: https://ai-sdk.dev/providers/ai-sdk-providers/lmnt
description: Learn how to use the LMNT provider for the AI SDK.
---


# [LMNT Provider](#lmnt-provider)


The [LMNT](https://lmnt.com/) provider contains language model support for the LMNT transcription API.


## [Setup](#setup)


The LMNT provider is available in the `@ai-sdk/lmnt` module. You can install it with

pnpm

npm

yarn

pnpm add @ai-sdk/lmnt


## [Provider Instance](#provider-instance)


You can import the default provider instance `lmnt` from `@ai-sdk/lmnt`:

```
import{ lmnt }from'@ai-sdk/lmnt';
```

If you need a customized setup, you can import `createLMNT` from `@ai-sdk/lmnt` and create a provider instance with your settings:

```
import{ createLMNT }from'@ai-sdk/lmnt';const lmnt =createLMNT({// custom settings, e.g.  fetch: customFetch,});
```

You can use the following optional settings to customize the LMNT provider instance:

-   **apiKey** *string*

    API key that is being sent using the `Authorization` header. It defaults to the `LMNT_API_KEY` environment variable.

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.

-   **fetch** *(input: RequestInfo, init?: RequestInit) => Promise<Response>*

    Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation. Defaults to the global `fetch` function. You can use it as a middleware to intercept requests, or to provide a custom fetch implementation for e.g. testing.



## [Speech Models](#speech-models)


You can create models that call the [LMNT speech API](https://docs.lmnt.com/api-reference/speech/synthesize-speech-bytes) using the `.speech()` factory method.

The first argument is the model id e.g. `aurora`.

```
const model = lmnt.speech('aurora');
```

You can also pass additional provider-specific options using the `providerOptions` argument. For example, supplying a voice to use for the generated audio.

```
import{ experimental_generateSpeech as generateSpeech }from'ai';import{ lmnt }from'@ai-sdk/lmnt';const result =awaitgenerateSpeech({  model: lmnt.speech('aurora'),  text:'Hello, world!',  providerOptions:{ lmnt:{ language:'en'}},});
```


### [Provider Options](#provider-options)


The LMNT provider accepts the following options:

-   **model** *'aurora' | 'blizzard'*

    The LMNT model to use. Defaults to `'aurora'`.

-   **language** *'auto' | 'en' | 'es' | 'pt' | 'fr' | 'de' | 'zh' | 'ko' | 'hi' | 'ja' | 'ru' | 'it' | 'tr'*

    The language to use for speech synthesis. Defaults to `'auto'`.

-   **format** *'aac' | 'mp3' | 'mulaw' | 'raw' | 'wav'*

    The audio format to return. Defaults to `'mp3'`.

-   **sampleRate** *number*

    The sample rate of the audio in Hz. Defaults to `24000`.

-   **speed** *number*

    The speed of the speech. Must be between 0.25 and 2. Defaults to `1`.

-   **seed** *number*

    An optional seed for deterministic generation.

-   **conversational** *boolean*

    Whether to use a conversational style. Defaults to `false`.

-   **length** *number*

    Maximum length of the audio in seconds. Maximum value is 300.

-   **topP** *number*

    Top-p sampling parameter. Must be between 0 and 1. Defaults to `1`.

-   **temperature** *number*

    Temperature parameter for sampling. Must be at least 0. Defaults to `1`.



### [Model Capabilities](#model-capabilities)


Model

Instructions

`aurora`

`blizzard`
