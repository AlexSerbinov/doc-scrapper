# Mixedbread Provider


---
url: https://ai-sdk.dev/providers/community-providers/mixedbread
description: Learn how to use the Mixedbread provider.
---


# [Mixedbread Provider](#mixedbread-provider)


[patelvivekdev/mixedbread-ai-provider](https://github.com/patelvivekdev/mixedbread-ai-provider) is a community provider that uses [Mixedbread](https://www.mixedbread.ai/) to provide Embedding support for the AI SDK.


## [Setup](#setup)


The Mixedbread provider is available in the `mixedbread-ai-provider` module. You can install it with

pnpm

npm

yarn

pnpm add mixedbread-ai-provider


## [Provider Instance](#provider-instance)


You can import the default provider instance `mixedbread` from `mixedbread-ai-provider`:

```
import{ mixedbread }from'mixedbread-ai-provider';
```

If you need a customized setup, you can import `createMixedbread` from `mixedbread-ai-provider` and create a provider instance with your settings:

```
import{ createMixedbread }from'mixedbread-ai-provider';const mixedbread =createMixedbread({  baseURL:'https://api.mixedbread.ai/v1',  apiKey: process.env.MIXEDBREAD_API_KEY,});
```

You can use the following optional settings to customize the Mixedbread provider instance:

-   **baseURL** *string*

    The base URL of the Mixedbread API

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.



## [Embedding Models](#embedding-models)


You can create models that call the [Mixedbread embeddings API](https://www.mixedbread.ai/api-reference/endpoints/embeddings) using the `.embedding()` factory method.

```
import{ mixedbread }from'mixedbread-ai-provider';const embeddingModel = mixedbread.textEmbeddingModel('mixedbread-ai/mxbai-embed-large-v1',);
```


### [Model Capabilities](#model-capabilities)


Model

Default Dimensions

Context Length

Custom Dimensions

`mxbai-embed-large-v1`

1024

512

`deepset-mxbai-embed-de-large-v1`

1024

512

The table above lists popular models. Please see the [Mixedbread docs](https://www.mixedbread.ai/docs/embeddings/models) for a full list of available models.


### [Add settings to the model](#add-settings-to-the-model)


The settings object should contain the settings you want to add to the model.

```
import{ mixedbread }from'mixedbread-ai-provider';const embeddingModel = mixedbread.textEmbeddingModel('mixedbread-ai/mxbai-embed-large-v1',{    prompt:'Generate embeddings for text',// Max 256 characters    dimensions:512,// Max 1024 for embed-large-v1},);
```
