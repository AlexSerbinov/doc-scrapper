# Cohere Provider


---
url: https://ai-sdk.dev/providers/ai-sdk-providers/cohere
description: Learn how to use the Cohere provider for the AI SDK.
---


# [Cohere Provider](#cohere-provider)


The [Cohere](https://cohere.com/) provider contains language and embedding model support for the Cohere chat API.


## [Setup](#setup)


The Cohere provider is available in the `@ai-sdk/cohere` module. You can install it with

pnpm

npm

yarn

pnpm add @ai-sdk/cohere


## [Provider Instance](#provider-instance)


You can import the default provider instance `cohere` from `@ai-sdk/cohere`:

```
import{ cohere }from'@ai-sdk/cohere';
```

If you need a customized setup, you can import `createCohere` from `@ai-sdk/cohere` and create a provider instance with your settings:

```
import{ createCohere }from'@ai-sdk/cohere';const cohere =createCohere({// custom settings});
```

You can use the following optional settings to customize the Cohere provider instance:

-   **baseURL** *string*

    Use a different URL prefix for API calls, e.g. to use proxy servers. The default prefix is `https://api.cohere.com/v2`.

-   **apiKey** *string*

    API key that is being sent using the `Authorization` header. It defaults to the `COHERE_API_KEY` environment variable.

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.

-   **fetch** *(input: RequestInfo, init?: RequestInit) => Promise<Response>*

    Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation. Defaults to the global `fetch` function. You can use it as a middleware to intercept requests, or to provide a custom fetch implementation for e.g. testing.



## [Language Models](#language-models)


You can create models that call the [Cohere chat API](https://docs.cohere.com/v2/docs/chat-api) using a provider instance. The first argument is the model id, e.g. `command-r-plus`. Some Cohere chat models support tool calls.

```
const model =cohere('command-r-plus');
```


### [Example](#example)


You can use Cohere language models to generate text with the `generateText` function:

```
import{ cohere }from'@ai-sdk/cohere';import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:cohere('command-r-plus'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',});
```

Cohere language models can also be used in the `streamText`, `generateObject`, and `streamObject` functions (see [AI SDK Core](/docs/ai-sdk-core).


### [Model Capabilities](#model-capabilities)


Model

Image Input

Object Generation

Tool Usage

Tool Streaming

`command-a-03-2025`

`command-r-plus`

`command-r`

`command-a-03-2025`

`command`

`command-light`

The table above lists popular models. Please see the [Cohere docs](https://docs.cohere.com/v2/docs/models#command) for a full list of available models. You can also pass any available provider model ID as a string if needed.


## [Embedding Models](#embedding-models)


You can create models that call the [Cohere embed API](https://docs.cohere.com/v2/reference/embed) using the `.embedding()` factory method.

```
const model = cohere.embedding('embed-english-v3.0');
```

Cohere embedding models support additional settings. You can pass them as an options argument:

```
const model = cohere.embedding('embed-english-v3.0',{  inputType:'search_document',});
```

The following optional settings are available for Cohere embedding models:

-   **inputType** *'search\_document' | 'search\_query' | 'classification' | 'clustering'*

    Specifies the type of input passed to the model. Default is `search_query`.

    -   `search_document`: Used for embeddings stored in a vector database for search use-cases.
    -   `search_query`: Used for embeddings of search queries run against a vector DB to find relevant documents.
    -   `classification`: Used for embeddings passed through a text classifier.
    -   `clustering`: Used for embeddings run through a clustering algorithm.
-   **truncate** *'NONE' | 'START' | 'END'*

    Specifies how the API will handle inputs longer than the maximum token length. Default is `END`.

    -   `NONE`: If selected, when the input exceeds the maximum input token length will return an error.
    -   `START`: Will discard the start of the input until the remaining input is exactly the maximum input token length for the model.
    -   `END`: Will discard the end of the input until the remaining input is exactly the maximum input token length for the model.


### [Model Capabilities](#model-capabilities-1)


Model

Embedding Dimensions

`embed-english-v3.0`

1024

`embed-multilingual-v3.0`

1024

`embed-english-light-v3.0`

384

`embed-multilingual-light-v3.0`

384

`embed-english-v2.0`

4096

`embed-english-light-v2.0`

1024

`embed-multilingual-v2.0`

768
