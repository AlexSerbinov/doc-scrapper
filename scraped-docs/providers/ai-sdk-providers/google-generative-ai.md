# Google Generative AI Provider


---
url: https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai
description: Learn how to use Google Generative AI Provider.
---


# [Google Generative AI Provider](#google-generative-ai-provider)


The [Google Generative AI](https://ai.google/discover/generativeai/) provider contains language and embedding model support for the [Google Generative AI](https://ai.google.dev/api/rest) APIs.


## [Setup](#setup)


The Google provider is available in the `@ai-sdk/google` module. You can install it with

pnpm

npm

yarn

pnpm add @ai-sdk/google


## [Provider Instance](#provider-instance)


You can import the default provider instance `google` from `@ai-sdk/google`:

```
import{ google }from'@ai-sdk/google';
```

If you need a customized setup, you can import `createGoogleGenerativeAI` from `@ai-sdk/google` and create a provider instance with your settings:

```
import{ createGoogleGenerativeAI }from'@ai-sdk/google';const google =createGoogleGenerativeAI({// custom settings});
```

You can use the following optional settings to customize the Google Generative AI provider instance:

-   **baseURL** *string*

    Use a different URL prefix for API calls, e.g. to use proxy servers. The default prefix is `https://generativelanguage.googleapis.com/v1beta`.

-   **apiKey** *string*

    API key that is being sent using the `x-goog-api-key` header. It defaults to the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable.

-   **headers** *Record<string,string>*

    Custom headers to include in the requests.

-   **fetch** *(input: RequestInfo, init?: RequestInit) => Promise<Response>*

    Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation. Defaults to the global `fetch` function. You can use it as a middleware to intercept requests, or to provide a custom fetch implementation for e.g. testing.



## [Language Models](#language-models)


You can create models that call the [Google Generative AI API](https://ai.google.dev/api/rest) using the provider instance. The first argument is the model id, e.g. `gemini-1.5-pro-latest`. The models support tool calls and some have multi-modal capabilities.

```
const model =google('gemini-1.5-pro-latest');
```

You can use fine-tuned models by prefixing the model id with `tunedModels/`, e.g. `tunedModels/my-model`.

Google Generative AI also supports some model specific settings that are not part of the [standard call settings](/docs/ai-sdk-core/settings). You can pass them as an options argument:

```
const model =google('gemini-1.5-pro-latest',{  safetySettings:[{ category:'HARM_CATEGORY_UNSPECIFIED', threshold:'BLOCK_LOW_AND_ABOVE'},],});
```

The following optional settings are available for Google Generative AI models:

-   **cachedContent** *string*

    Optional. The name of the cached content used as context to serve the prediction. Format: cachedContents/{cachedContent}

-   **structuredOutputs** *boolean*

    Optional. Enable structured output. Default is true.

    This is useful when the JSON Schema contains elements that are not supported by the OpenAPI schema version that Google Generative AI uses. You can use this to disable structured outputs if you need to.

    See [Troubleshooting: Schema Limitations](#schema-limitations) for more details.

-   **safetySettings** *Array<{ category: string; threshold: string }>*

    Optional. Safety settings for the model.

    -   **category** *string*

        The category of the safety setting. Can be one of the following:

        -   `HARM_CATEGORY_HATE_SPEECH`
        -   `HARM_CATEGORY_DANGEROUS_CONTENT`
        -   `HARM_CATEGORY_HARASSMENT`
        -   `HARM_CATEGORY_SEXUALLY_EXPLICIT`
    -   **threshold** *string*

        The threshold of the safety setting. Can be one of the following:

        -   `HARM_BLOCK_THRESHOLD_UNSPECIFIED`
        -   `BLOCK_LOW_AND_ABOVE`
        -   `BLOCK_MEDIUM_AND_ABOVE`
        -   `BLOCK_ONLY_HIGH`
        -   `BLOCK_NONE`

Further configuration can be done using Google Generative AI provider options. You can validate the provider options using the `GoogleGenerativeAIProviderOptions` type.

```
import{ google }from'@ai-sdk/google';import{GoogleGenerativeAIProviderOptions}from'@ai-sdk/google';import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:google('gemini-1.5-pro-latest'),  providerOptions:{    google:{      responseModalities:['TEXT','IMAGE'],} satisfies GoogleGenerativeAIProviderOptions,},// ...});
```

Another example showing the use of provider options to specify the thinking budget for a Google Generative AI thinking model:

```
import{ google }from'@ai-sdk/google';import{GoogleGenerativeAIProviderOptions}from'@ai-sdk/google';import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:google('gemini-2.5-flash-preview-04-17'),  providerOptions:{    google:{      thinkingConfig:{        thinkingBudget:2048,},} satisfies GoogleGenerativeAIProviderOptions,},// ...});
```

The following provider options are available:

-   **responseModalities** *string\[\]* The modalities to use for the response. The following modalities are supported: `TEXT`, `IMAGE`. When not defined or empty, the model defaults to returning only text.

-   **thinkingConfig** *{ thinkingBudget: number; }*

    Optional. Configuration for the model's thinking process. Only supported by specific [Google Generative AI models](https://ai.google.dev/gemini-api/docs/thinking).

    -   **thinkingBudget** *number*

        Optional. Gives the model guidance on the number of thinking tokens it can use when generating a response. Must be an integer in the range 0 to 24576. Setting it to 0 disables thinking. Budgets from 1 to 1024 tokens will be set to 1024. For more information see [Google Generative AI documentation](https://ai.google.dev/gemini-api/docs/thinking).


You can use Google Generative AI language models to generate text with the `generateText` function:

```
import{ google }from'@ai-sdk/google';import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:google('gemini-1.5-pro-latest'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',});
```

Google Generative AI language models can also be used in the `streamText`, `generateObject`, and `streamObject` functions (see [AI SDK Core](/docs/ai-sdk-core)).


### [File Inputs](#file-inputs)


The Google Generative AI provider supports file inputs, e.g. PDF files.

```
import{ google }from'@ai-sdk/google';import{ generateText }from'ai';const result =awaitgenerateText({  model:google('gemini-1.5-flash'),  messages:[{      role:'user',      content:[{type:'text',          text:'What is an embedding model according to this document?',},{type:'file',          data: fs.readFileSync('./data/ai.pdf'),          mimeType:'application/pdf',},],},],});
```

The AI SDK will automatically download URLs if you pass them as data, except for `https://generativelanguage.googleapis.com/v1beta/files/`. You can use the Google Generative AI Files API to upload larger files to that location.

See [File Parts](/docs/foundations/prompts#file-parts) for details on how to use files in prompts.


### [Cached Content](#cached-content)


You can use Google Generative AI language models to cache content:

```
import{ google }from'@ai-sdk/google';import{GoogleAICacheManager}from'@google/generative-ai/server';import{ generateText }from'ai';const cacheManager =newGoogleAICacheManager(  process.env.GOOGLE_GENERATIVE_AI_API_KEY,);// As of August 23rd, 2024, these are the only models that support cachingtypeGoogleModelCacheableId=|'models/gemini-1.5-flash-001'|'models/gemini-1.5-pro-001';const model:GoogleModelCacheableId='models/gemini-1.5-pro-001';const{ name: cachedContent }=await cacheManager.create({  model,  contents:[{      role:'user',      parts:[{ text:'1000 Lasanga Recipes...'}],},],  ttlSeconds:60*5,});const{ text: veggieLasangaRecipe }=awaitgenerateText({  model:google(model,{ cachedContent }),  prompt:'Write a vegetarian lasagna recipe for 4 people.',});const{ text: meatLasangaRecipe }=awaitgenerateText({  model:google(model,{ cachedContent }),  prompt:'Write a meat lasagna recipe for 12 people.',});
```


### [Search Grounding](#search-grounding)


With [search grounding](https://ai.google.dev/gemini-api/docs/grounding), the model has access to the latest information using Google search. Search grounding can be used to provide answers around current events:

```
import{ google }from'@ai-sdk/google';import{GoogleGenerativeAIProviderMetadata}from'@ai-sdk/google';import{ generateText }from'ai';const{ text, providerMetadata }=awaitgenerateText({  model:google('gemini-1.5-pro',{    useSearchGrounding:true,}),  prompt:'List the top 5 San Francisco news from the past week.'+'You must include the date of each article.',});// access the grounding metadata. Casting to the provider metadata type// is optional but provides autocomplete and type safety.const metadata = providerMetadata?.google as|GoogleGenerativeAIProviderMetadata|undefined;const groundingMetadata = metadata?.groundingMetadata;const safetyRatings = metadata?.safetyRatings;
```

The grounding metadata includes detailed information about how search results were used to ground the model's response. Here are the available fields:

-   **`webSearchQueries`** (`string[] | null`)

    -   Array of search queries used to retrieve information
    -   Example: `["What's the weather in Chicago this weekend?"]`
-   **`searchEntryPoint`** (`{ renderedContent: string } | null`)

    -   Contains the main search result content used as an entry point
    -   The `renderedContent` field contains the formatted content
-   **`groundingSupports`** (Array of support objects | null)

    -   Contains details about how specific response parts are supported by search results
    -   Each support object includes:
        -   **`segment`**: Information about the grounded text segment
            -   `text`: The actual text segment
            -   `startIndex`: Starting position in the response
            -   `endIndex`: Ending position in the response
        -   **`groundingChunkIndices`**: References to supporting search result chunks
        -   **`confidenceScores`**: Confidence scores (0-1) for each supporting chunk

Example response:

```
{"groundingMetadata":{"webSearchQueries":["What's the weather in Chicago this weekend?"],"searchEntryPoint":{"renderedContent":"..."},"groundingSupports":[{"segment":{"startIndex":0,"endIndex":65,"text":"Chicago weather changes rapidly, so layers let you adjust easily."},"groundingChunkIndices":[0],"confidenceScores":[0.99]}]}}
```


#### [Dynamic Retrieval](#dynamic-retrieval)


With [dynamic retrieval](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/ground-with-google-search#dynamic-retrieval), you can configure how the model decides when to turn on Grounding with Google Search. This gives you more control over when and how the model grounds its responses.

```
import{ google }from'@ai-sdk/google';import{ generateText }from'ai';const{ text, providerMetadata }=awaitgenerateText({  model:google('gemini-1.5-flash',{    useSearchGrounding:true,    dynamicRetrievalConfig:{      mode:'MODE_DYNAMIC',      dynamicThreshold:0.8,},}),  prompt:'Who won the latest F1 grand prix?',});
```

The `dynamicRetrievalConfig` describes the options to customize dynamic retrieval:

-   `mode`: The mode of the predictor to be used in dynamic retrieval. The following modes are supported:

    -   `MODE_DYNAMIC`: Run retrieval only when system decides it is necessary
    -   `MODE_UNSPECIFIED`: Always trigger retrieval
-   `dynamicThreshold`: The threshold to be used in dynamic retrieval (if not set, a system default value is used).


Dynamic retrieval is only available with Gemini 1.5 Flash models and is not supported with 8B variants.


### [Sources](#sources)


When you use [Search Grounding](#search-grounding), the model will include sources in the response. You can access them using the `sources` property of the result:

```
import{ google }from'@ai-sdk/google';import{ generateText }from'ai';const{ sources }=awaitgenerateText({  model:google('gemini-2.0-flash-exp',{ useSearchGrounding:true}),  prompt:'List the top 5 San Francisco news from the past week.',});
```


### [Image Outputs](#image-outputs)


The model `gemini-2.0-flash-exp` supports image generation. Images are exposed as files in the response. You need to enable image output in the provider options using the `responseModalities` option.

```
import{ google }from'@ai-sdk/google';import{ generateText }from'ai';const result =awaitgenerateText({  model:google('gemini-2.0-flash-exp'),  providerOptions:{    google:{ responseModalities:['TEXT','IMAGE']},},  prompt:'Generate an image of a comic cat',});for(const file of result.files){if(file.mimeType.startsWith('image/')){// show the image}}
```


### [Safety Ratings](#safety-ratings)


The safety ratings provide insight into the safety of the model's response. See [Google AI documentation on safety settings](https://ai.google.dev/gemini-api/docs/safety-settings).

Example response excerpt:

```
{"safetyRatings":[{"category":"HARM_CATEGORY_HATE_SPEECH","probability":"NEGLIGIBLE","probabilityScore":0.11027937,"severity":"HARM_SEVERITY_LOW","severityScore":0.28487435},{"category":"HARM_CATEGORY_DANGEROUS_CONTENT","probability":"HIGH","blocked":true,"probabilityScore":0.95422274,"severity":"HARM_SEVERITY_MEDIUM","severityScore":0.43398145},{"category":"HARM_CATEGORY_HARASSMENT","probability":"NEGLIGIBLE","probabilityScore":0.11085559,"severity":"HARM_SEVERITY_NEGLIGIBLE","severityScore":0.19027223},{"category":"HARM_CATEGORY_SEXUALLY_EXPLICIT","probability":"NEGLIGIBLE","probabilityScore":0.22901751,"severity":"HARM_SEVERITY_NEGLIGIBLE","severityScore":0.09089675}]}
```


### [Troubleshooting](#troubleshooting)



#### [Schema Limitations](#schema-limitations)


The Google Generative AI API uses a subset of the OpenAPI 3.0 schema, which does not support features such as unions. The errors that you get in this case look like this:

`GenerateContentRequest.generation_config.response_schema.properties[occupation].type: must be specified`

By default, structured outputs are enabled (and for tool calling they are required). You can disable structured outputs for object generation as a workaround:

```
const result =awaitgenerateObject({  model:google('gemini-1.5-pro-latest',{    structuredOutputs:false,}),  schema: z.object({    name: z.string(),    age: z.number(),    contact: z.union([      z.object({type: z.literal('email'),        value: z.string(),}),      z.object({type: z.literal('phone'),        value: z.string(),}),]),}),  prompt:'Generate an example person for testing.',});
```

The following Zod features are known to not work with Google Generative AI:

-   `z.union`
-   `z.record`


### [Model Capabilities](#model-capabilities)


Model

Image Input

Object Generation

Tool Usage

Tool Streaming

`gemini-2.5-pro-preview-05-06`

`gemini-2.5-flash-preview-04-17`

`gemini-2.5-pro-exp-03-25`

`gemini-2.0-flash`

`gemini-1.5-pro`

`gemini-1.5-pro-latest`

`gemini-1.5-flash`

`gemini-1.5-flash-latest`

`gemini-1.5-flash-8b`

`gemini-1.5-flash-8b-latest`

The table above lists popular models. Please see the [Google Generative AI docs](https://ai.google.dev/gemini-api/docs/models/gemini) for a full list of available models. The table above lists popular models. You can also pass any available provider model ID as a string if needed.


## [Embedding Models](#embedding-models)


You can create models that call the [Google Generative AI embeddings API](https://ai.google.dev/api/embeddings) using the `.textEmbeddingModel()` factory method.

```
const model = google.textEmbeddingModel('text-embedding-004');
```

Google Generative AI embedding models support aditional settings. You can pass them as an options argument:

```
const model = google.textEmbeddingModel('text-embedding-004',{  outputDimensionality:512,// optional, number of dimensions for the embedding  taskType:'SEMANTIC_SIMILARITY',// optional, specifies the task type for generating embeddings});
```

The following optional settings are available for Google Generative AI embedding models:

-   **outputDimensionality**: *number*

    Optional reduced dimension for the output embedding. If set, excessive values in the output embedding are truncated from the end.

-   **taskType**: *string*

    Optional. Specifies the task type for generating embeddings. Supported task types include:

    -   `SEMANTIC_SIMILARITY`: Optimized for text similarity.
    -   `CLASSIFICATION`: Optimized for text classification.
    -   `CLUSTERING`: Optimized for clustering texts based on similarity.
    -   `RETRIEVAL_DOCUMENT`: Optimized for document retrieval.
    -   `RETRIEVAL_QUERY`: Optimized for query-based retrieval.
    -   `QUESTION_ANSWERING`: Optimized for answering questions.
    -   `FACT_VERIFICATION`: Optimized for verifying factual information.
    -   `CODE_RETRIEVAL_QUERY`: Optimized for retrieving code blocks based on natural language queries.


### [Model Capabilities](#model-capabilities-1)


Model

Default Dimensions

Custom Dimensions

`text-embedding-004`

768
