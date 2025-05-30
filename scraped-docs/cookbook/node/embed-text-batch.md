# Embed Text in Batch


---
url: https://ai-sdk.dev/cookbook/node/embed-text-batch
description: Learn how to embed multiple text using the AI SDK and Node
---


# [Embed Text in Batch](#embed-text-in-batch)


When working with large datasets or multiple pieces of text, processing embeddings one at a time can be inefficient. Batch embedding allows you to convert multiple text inputs into embeddings simultaneously, significantly improving performance and reducing API calls. This is particularly useful when processing documents, chat messages, or any collection of text that needs to be vectorized.

This example shows how to embed multiple text inputs in a single operation using the AI SDK. For single text embedding, see our [Embed Text](/cookbook/node/embed-text) example, or for a practical application, check out our [RAG example](/cookbook/node/retrieval-augmented-generation) which demonstrates how batch embeddings can be used in a document retrieval system.

```
import{ openai }from'@ai-sdk/openai';import{ embedMany }from'ai';import'dotenv/config';asyncfunctionmain(){const{ embeddings, usage }=awaitembedMany({    model: openai.embedding('text-embedding-3-small'),    values:['sunny day at the beach','rainy afternoon in the city','snowy night in the mountains',],});console.log(embeddings);console.log(usage);}main().catch(console.error);
```
