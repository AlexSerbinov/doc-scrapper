# LangDB


---
url: https://ai-sdk.dev/providers/community-providers/langdb
description: Learn how to use LangDB with the AI SDK
---


# [LangDB](#langdb)


[LangDB](https://langdb.ai) is a high-performance enterprise AI gateway built in Rust, designed to govern, secure, and optimize AI traffic.

LangDB provides OpenAI-compatible APIs, enabling developers to connect with multiple LLMs by changing just two lines of code. With LangDB, you can:

-   Provide access to all major LLMs
-   Enable plug-and-play functionality using any framework like Langchain, Vercel AI SDK, CrewAI, etc., for easy adoption.
-   Simplify implementation of tracing and cost optimization features, ensuring streamlined operations.
-   Dynamically route requests to the most suitable LLM based on predefined parameters.


## [Setup](#setup)


The LangDB provider is available via the `@langdb/vercel-provider` module. You can install it with:

pnpm

npm

yarn

pnpm add @langdb/vercel-provider


## [Provider Instance](#provider-instance)


To create a LangDB provider instance, use the `createLangDB` function:

```
import{ createLangDB }from'@langdb/vercel-provider';const langdb =createLangDB({  apiKey: process.env.LANGDB_API_KEY,// Required  projectId:'your-project-id',// Required  threadId:uuidv4(),// Optional  runId:uuidv4(),// Optional  label:'code-agent',// Optional  headers:{'Custom-Header':'value'},// Optional});
```

You can find your LangDB API key in the [LangDB dashboard](https://app.langdb.ai).


## [Examples](#examples)


You can use LangDB with the `generateText` or `streamText` function:


### [`generateText`](#generatetext)


```
import{ createLangDB }from'@langdb/vercel-provider';import{ generateText }from'ai';const langdb =createLangDB({  apiKey: process.env.LANGDB_API_KEY,  projectId:'your-project-id',});exportasyncfunctiongenerateTextExample(){const{ text }=awaitgenerateText({    model:langdb('openai/gpt-4o-mini'),    prompt:'Write a Python function that sorts a list:',});console.log(text);}
```


### [generateImage](#generateimage)


```
import{ createLangDB }from'@langdb/vercel-provider';import{ experimental_generateImage as generateImage }from'ai';import fs from'fs';import path from'path';const langdb =createLangDB({  apiKey: process.env.LANGDB_API_KEY,  projectId:'your-project-id',});exportasyncfunctiongenerateImageExample(){const{ images }=awaitgenerateImage({    model: langdb.image('openai/dall-e-3'),    prompt:'A delighted resplendent quetzal mid-flight amidst raindrops',});const imagePath = path.join(__dirname,'generated-image.png');  fs.writeFileSync(imagePath, images[0].uint8Array);console.log(`Image saved to: ${imagePath}`);}
```


### [embed](#embed)


```
import{ createLangDB }from'@langdb/vercel-provider';import{ embed }from'ai';const langdb =createLangDB({  apiKey: process.env.LANGDB_API_KEY,  projectId:'your-project-id',});exportasyncfunctiongenerateEmbeddings(){const{ embedding }=awaitembed({    model: langdb.textEmbeddingModel('text-embedding-3-small'),    value:'sunny day at the beach',});console.log('Embedding:', embedding);}
```


## [Supported Models](#supported-models)


LangDB supports over 250+ models, enabling seamless interaction with a wide range of AI capabilities.

Checkout the [model list](https://app.langdb.ai/models) for more information.

For more information, visit the [LangDB documentation](https://docs.langdb.ai/).
