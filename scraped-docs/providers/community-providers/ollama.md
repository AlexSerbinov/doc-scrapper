# Ollama Provider


---
url: https://ai-sdk.dev/providers/community-providers/ollama
description: Learn how to use the Ollama provider.
---


# [Ollama Provider](#ollama-provider)


[sgomez/ollama-ai-provider](https://github.com/sgomez/ollama-ai-provider) is a community provider that uses [Ollama](https://ollama.com/) to provide language model support for the AI SDK.


## [Setup](#setup)


The Ollama provider is available in the `ollama-ai-provider` module. You can install it with

pnpm

npm

yarn

pnpm add ollama-ai-provider


## [Provider Instance](#provider-instance)


You can import the default provider instance `ollama` from `ollama-ai-provider`:

```
import{ ollama }from'ollama-ai-provider';
```

If you need a customized setup, you can import `createOllama` from `ollama-ai-provider` and create a provider instance with your settings:

```
import{ createOllama }from'ollama-ai-provider';const ollama =createOllama({// optional settings, e.g.  baseURL:'https://api.ollama.com',});
```

You can use the following optional settings to customize the Ollama provider instance:

-   **baseURL** *string*

    Use a different URL prefix for API calls, e.g. to use proxy servers. The default prefix is `http://localhost:11434/api`.

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.



## [Language Models](#language-models)


You can create models that call the [Ollama Chat Completion API](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion) using the provider instance. The first argument is the model id, e.g. `phi3`. Some models have multi-modal capabilities.

```
const model =ollama('phi3');
```

You can find more models on the [Ollama Library](https://ollama.com/library) homepage.


### [Model Capabilities](#model-capabilities)


This provider is capable of generating and streaming text and objects. Object generation may fail depending on the model used and the schema used.

The following models have been tested with image inputs:

-   llava
-   llava-llama3
-   llava-phi3
-   moondream


## [Embedding Models](#embedding-models)


You can create models that call the [Ollama embeddings API](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-embeddings) using the `.embedding()` factory method.

```
const model = ollama.embedding('nomic-embed-text');
```
