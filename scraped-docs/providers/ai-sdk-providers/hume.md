# Hume Provider


---
url: https://ai-sdk.dev/providers/ai-sdk-providers/hume
description: Learn how to use the Hume provider for the AI SDK.
---


# [Hume Provider](#hume-provider)


The [Hume](https://hume.ai/) provider contains language model support for the Hume transcription API.


## [Setup](#setup)


The Hume provider is available in the `@ai-sdk/hume` module. You can install it with

pnpm

npm

yarn

pnpm add @ai-sdk/hume


## [Provider Instance](#provider-instance)


You can import the default provider instance `hume` from `@ai-sdk/hume`:

```
import{ hume }from'@ai-sdk/hume';
```

If you need a customized setup, you can import `createHume` from `@ai-sdk/hume` and create a provider instance with your settings:

```
import{ createHume }from'@ai-sdk/hume';const hume =createHume({// custom settings, e.g.  fetch: customFetch,});
```

You can use the following optional settings to customize the Hume provider instance:

-   **apiKey** *string*

    API key that is being sent using the `Authorization` header. It defaults to the `HUME_API_KEY` environment variable.

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.

-   **fetch** *(input: RequestInfo, init?: RequestInit) => Promise<Response>*

    Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation. Defaults to the global `fetch` function. You can use it as a middleware to intercept requests, or to provide a custom fetch implementation for e.g. testing.



## [Speech Models](#speech-models)


You can create models that call the [Hume speech API](https://dev.hume.ai/docs/text-to-speech-tts/overview) using the `.speech()` factory method.

```
const model = hume.speech();
```

You can also pass additional provider-specific options using the `providerOptions` argument. For example, supplying a voice to use for the generated audio.

```
import{ experimental_generateSpeech as generateSpeech }from'ai';import{ hume }from'@ai-sdk/hume';const result =awaitgenerateSpeech({  model: hume.speech(),  text:'Hello, world!',  voice:'d8ab67c6-953d-4bd8-9370-8fa53a0f1453',  providerOptions:{ hume:{}},});
```

The following provider options are available:

-   **context** *object*

    Either:

    -   `{ generationId: string }` - A generation ID to use for context.
    -   `{ utterances: HumeUtterance[] }` - An array of utterance objects for context.


### [Model Capabilities](#model-capabilities)


Model

Instructions

`default`
