# Baseten Provider


---
url: https://ai-sdk.dev/providers/openai-compatible-providers/baseten
description: Use a Baseten OpenAI compatible API with the AI SDK.
---


# [Baseten Provider](#baseten-provider)


[Baseten](https://baseten.co/) is a platform for running and testing LLMs. It allows you to deploy models that are OpenAI API compatible that you can use with the AI SDK.


## [Setup](#setup)


The Baseten provider is available via the `@ai-sdk/openai-compatible` module as it is compatible with the OpenAI API. You can install it with

pnpm

npm

yarn

pnpm add @ai-sdk/openai-compatible


## [Provider Instance](#provider-instance)


To use Baseten, you can create a custom provider instance with the `createOpenAICompatible` function from `@ai-sdk/openai-compatible`:

```
import{ createOpenAICompatible }from'@ai-sdk/openai-compatible';constBASETEN_MODEL_ID='<model-id>';// e.g. 5q3z8xcwconstBASETEN_MODEL_URL=`https://model-${BASETEN_MODEL_ID}.api.baseten.co/environments/production/sync/v1`;const baseten =createOpenAICompatible({  name:'baseten',  baseURL:BASETEN_MODEL_URL,  headers:{Authorization:`Bearer ${process.env.BASETEN_API_KEY??''}`,},});
```

Be sure to have your `BASETEN_API_KEY` set in your environment and the model `<model-id>` ready. The `<model-id>` will be given after you have deployed the model on Baseten.


## [Language Models](#language-models)


You can create [Baseten models](https://www.baseten.co/library/) using a provider instance. The first argument is the served model name, e.g. `llama`.

```
const model =baseten('llama');
```


### [Example](#example)


You can use Baseten language models to generate text with the `generateText` function:

```
import{ createOpenAICompatible }from'@ai-sdk/openai-compatible';import{ generateText }from'ai';constBASETEN_MODEL_ID='<model-id>';// e.g. 5q3z8xcwconstBASETEN_MODEL_URL=`https://model-${BASETEN_MODEL_ID}.api.baseten.co/environments/production/sync/v1`;const baseten =createOpenAICompatible({  name:'baseten',  baseURL:BASETEN_MODEL_URL,  headers:{Authorization:`Bearer ${process.env.BASETEN_API_KEY??''}`,},});const{ text }=awaitgenerateText({  model:baseten('llama'),  prompt:'Tell me about yourself in one sentence',});console.log(text);
```

Baseten language models are also able to generate text in a streaming fashion with the `streamText` function:

```
import{ createOpenAICompatible }from'@ai-sdk/openai-compatible';import{ streamText }from'ai';constBASETEN_MODEL_ID='<model-id>';// e.g. 5q3z8xcwconstBASETEN_MODEL_URL=`https://model-${BASETEN_MODEL_ID}.api.baseten.co/environments/production/sync/v1`;const baseten =createOpenAICompatible({  name:'baseten',  baseURL:BASETEN_MODEL_URL,  headers:{Authorization:`Bearer ${process.env.BASETEN_API_KEY??''}`,},});const result =streamText({  model:baseten('llama'),  prompt:'Tell me about yourself in one sentence',});forawait(const message of result.textStream){console.log(message);}
```

Baseten language models can also be used in the `generateObject`, and `streamObject` functions.
