# wrapLanguageModel()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/wrap-language-model
description: Function for wrapping a language model with middleware (API Reference)
---


# [`wrapLanguageModel()`](#wraplanguagemodel)


The `wrapLanguageModel` function provides a way to enhance the behavior of language models by wrapping them with middleware. See [Language Model Middleware](/docs/ai-sdk-core/middleware) for more information on middleware.

```
import{ wrapLanguageModel }from'ai';const wrappedLanguageModel =wrapLanguageModel({  model: yourModel,  middleware: yourLanguageModelMiddleware,});
```


## [Import](#import)


import { wrapLanguageModel } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### model:


LanguageModelV1

The original LanguageModelV1 instance to be wrapped.


### middleware:


LanguageModelV1Middleware | LanguageModelV1Middleware\[\]

The middleware to be applied to the language model. When multiple middlewares are provided, the first middleware will transform the input first, and the last middleware will be wrapped directly around the model.


### modelId:


string

Optional custom model ID to override the original model's ID.


### providerId:


string

Optional custom provider ID to override the original model's provider.


### [Returns](#returns)


A new `LanguageModelV1` instance with middleware applied.
