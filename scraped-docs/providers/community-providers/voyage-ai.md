# Voyage AI Provider


---
url: https://ai-sdk.dev/providers/community-providers/voyage-ai
description: Learn how to use the Voyage AI provider.
---


# [Voyage AI Provider](#voyage-ai-provider)


[patelvivekdev/voyage-ai-provider](https://github.com/patelvivekdev/voyageai-ai-provider) is a community provider that uses [Voyage AI](https://www.voyageai.com) to provide Embedding support for the AI SDK.


## [Setup](#setup)


The Voyage provider is available in the `voyage-ai-provider` module. You can install it with

pnpm

npm

yarn

pnpm add voyage-ai-provider


## [Provider Instance](#provider-instance)


You can import the default provider instance `voyage` from `voyage-ai-provider`:

```
import{ voyage }from'voyage-ai-provider';
```

If you need a customized setup, you can import `createVoyage` from `voyage-ai-provider` and create a provider instance with your settings:

```
import{ createVoyage }from'voyage-ai-provider';const voyage =createVoyage({  baseURL:'https://api.voyageai.com/v1',  apiKey: process.env.VOYAGE_API_KEY,});
```

You can use the following optional settings to customize the Voyage provider instance:

-   **baseURL** *string*

    The base URL of the voyage API

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.



## [Embedding Models](#embedding-models)


You can create models that call the [Voyage embeddings API](https://docs.voyageai.com/reference/embeddings-api) using the `.embedding()` factory method.

```
import{ voyage }from'voyage-ai-provider';const embeddingModel = voyage.textEmbeddingModel('voyage-3');
```

You can find more models on the [Voyage Library](https://docs.voyageai.com/docs/embeddings) homepage.


### [Model Capabilities](#model-capabilities)


Model

Default Dimensions

Context Length

`voyage-3-large`

1024 (default), 256, 512, 2048

32,000

`voyage-3`

1024

32000

`voyage-code-3`

1024 (default), 256, 512, 2048

32000

`voyage-3-lite`

512

32000

`voyage-finance-2`

1024

32000

`voyage-multilingual-2`

1024

32000

`voyage-law-2`

1024

32000

`voyage-code-2`

1024

16000

The table above lists popular models. Please see the [Voyage docs](https://docs.voyageai.com/docs/embeddings) for a full list of available models.


### [Add settings to the model](#add-settings-to-the-model)


The settings object should contain the settings you want to add to the model.

```
import{ voyage }from'voyage-ai-provider';const embeddingModel = voyage.textEmbeddingModel('voyage-3',{  inputType:'document',// 'document' or 'query'  truncation:false,  outputDimension:1024,// the new model voyage-code-3, voyage-3-large has 4 different output dimensions: 256, 512, 1024 (default), 2048  outputDtype:'float',// output data types - int8, uint8, binary, ubinary are supported by the new model voyage-code-3, voyage-3-large});
```

Learn more about the [output data types.](https://docs.voyageai.com/docs/faq#what-is-quantization-and-output-data-types)
