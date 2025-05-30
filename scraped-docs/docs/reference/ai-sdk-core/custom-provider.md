# customProvider()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/custom-provider
description: Custom provider that uses models from a different provider (API Reference)
---


# [`customProvider()`](#customprovider)


With a custom provider, you can map ids to any model. This allows you to set up custom model configurations, alias names, and more. The custom provider also supports a fallback provider, which is useful for wrapping existing providers and adding additional functionality.


### [Example: custom model settings](#example-custom-model-settings)


You can create a custom provider using `customProvider`.

```
import{ openai }from'@ai-sdk/openai';import{ customProvider }from'ai';// custom provider with different model settings:exportconst myOpenAI =customProvider({  languageModels:{// replacement model with custom settings:'gpt-4':openai('gpt-4',{ structuredOutputs:true}),// alias model with custom settings:'gpt-4o-structured':openai('gpt-4o',{ structuredOutputs:true}),},  fallbackProvider: openai,});
```


## [Import](#import)


import {  customProvider } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### languageModels?:


Record<string, LanguageModel>

A record of language models, where keys are model IDs and values are LanguageModel instances.


### textEmbeddingModels?:


Record<string, EmbeddingModelV1<string>>

A record of text embedding models, where keys are model IDs and values are EmbeddingModel<string> instances.


### imageModels?:


Record<string, ImageModelV1>

A record of image models, where keys are model IDs and values are ImageModelV1 instances.


### fallbackProvider?:


Provider

An optional fallback provider to use when a requested model is not found in the custom provider.


### [Returns](#returns)


The `customProvider` function returns a `Provider` instance. It has the following methods:


### languageModel:


(id: string) => LanguageModel

A function that returns a language model by its id (format: providerId:modelId)


### textEmbeddingModel:


(id: string) => EmbeddingModel<string>

A function that returns a text embedding model by its id (format: providerId:modelId)


### imageModel:


(id: string) => ImageModel

A function that returns an image model by its id (format: providerId:modelId)
