# LM Studio Provider


---
url: https://ai-sdk.dev/providers/openai-compatible-providers/lmstudio
description: Use the LM Studio OpenAI compatible API with the AI SDK.
---


# [LM Studio Provider](#lm-studio-provider)


[LM Studio](https://lmstudio.ai/) is a user interface for running local models.

It contains an OpenAI compatible API server that you can use with the AI SDK. You can start the local server under the [Local Server tab](https://lmstudio.ai/docs/basics/server) in the LM Studio UI ("Start Server" button).


## [Setup](#setup)


The LM Studio provider is available via the `@ai-sdk/openai-compatible` module as it is compatible with the OpenAI API. You can install it with

pnpm

npm

yarn

pnpm add @ai-sdk/openai-compatible


## [Provider Instance](#provider-instance)


To use LM Studio, you can create a custom provider instance with the `createOpenAICompatible` function from `@ai-sdk/openai-compatible`:

```
import{ createOpenAICompatible }from'@ai-sdk/openai-compatible';const lmstudio =createOpenAICompatible({  name:'lmstudio',  baseURL:'http://localhost:1234/v1',});
```

LM Studio uses port `1234` by default, but you can change in the [app's Local Server tab](https://lmstudio.ai/docs/basics/server).


## [Language Models](#language-models)


You can interact with local LLMs in [LM Studio](https://lmstudio.ai/docs/basics/server#endpoints-overview) using a provider instance. The first argument is the model id, e.g. `llama-3.2-1b`.

```
const model =lmstudio('llama-3.2-1b');
```


###### [To be able to use a model, you need to](#to-be-able-to-use-a-model-you-need-to-download-it-first) [download it first](https://lmstudio.ai/docs/basics/download-model).



### [Example](#example)


You can use LM Studio language models to generate text with the `generateText` function:

```
import{ createOpenAICompatible }from'@ai-sdk/openai-compatible';import{ generateText }from'ai';const lmstudio =createOpenAICompatible({  name:'lmstudio',  baseURL:'https://localhost:1234/v1',});const{ text }=awaitgenerateText({  model:lmstudio('llama-3.2-1b'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',  maxRetries:1,// immediately error if the server is not running});
```

LM Studio language models can also be used with `streamText`.


## [Embedding Models](#embedding-models)


You can create models that call the [LM Studio embeddings API](https://lmstudio.ai/docs/basics/server#endpoints-overview) using the `.embedding()` factory method.

```
const model = lmstudio.embedding('text-embedding-nomic-embed-text-v1.5');
```


### [Example - Embedding a Single Value](#example---embedding-a-single-value)


```
import{ createOpenAICompatible }from'@ai-sdk/openai-compatible';import{ embed }from'ai';const lmstudio =createOpenAICompatible({  name:'lmstudio',  baseURL:'https://localhost:1234/v1',});// 'embedding' is a single embedding object (number[])const{ embedding }=awaitembed({  model: lmstudio.textEmbeddingModel('text-embedding-nomic-embed-text-v1.5'),  value:'sunny day at the beach',});
```


### [Example - Embedding Many Values](#example---embedding-many-values)


When loading data, e.g. when preparing a data store for retrieval-augmented generation (RAG), it is often useful to embed many values at once (batch embedding).

The AI SDK provides the [`embedMany`](/docs/reference/ai-sdk-core/embed-many) function for this purpose. Similar to `embed`, you can use it with embeddings models, e.g. `lmstudio.textEmbeddingModel('text-embedding-nomic-embed-text-v1.5')` or `lmstudio.textEmbeddingModel('text-embedding-bge-small-en-v1.5')`.

```
import{ createOpenAICompatible }from'@ai-sdk/openai';import{ embedMany }from'ai';const lmstudio =createOpenAICompatible({  name:'lmstudio',  baseURL:'https://localhost:1234/v1',});// 'embeddings' is an array of embedding objects (number[][]).// It is sorted in the same order as the input values.const{ embeddings }=awaitembedMany({  model: lmstudio.textEmbeddingModel('text-embedding-nomic-embed-text-v1.5'),  values:['sunny day at the beach','rainy afternoon in the city','snowy night in the mountains',],});
```
