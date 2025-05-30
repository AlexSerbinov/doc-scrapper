# Embed Text


---
url: https://ai-sdk.dev/cookbook/node/embed-text
description: Learn how to embed text using the AI SDK and Node
---


# [Embed Text](#embed-text)


Text embeddings are numerical representations of text that capture semantic meaning, allowing machines to understand and process language in a mathematical way. These vector representations are crucial for many AI applications, as they enable tasks like semantic search, document similarity comparison, and content recommendation.

This example demonstrates how to convert text into embeddings using a text embedding model. The resulting embedding is a high-dimensional vector that represents the semantic meaning of the input text. For a more practical application of embeddings, check out our [RAG example](/cookbook/node/retrieval-augmented-generation) which shows how embeddings can be used for document retrieval.

```
import{ openai }from'@ai-sdk/openai';import{ embed }from'ai';import'dotenv/config';asyncfunctionmain(){const{ embedding, usage }=awaitembed({    model: openai.embedding('text-embedding-3-small'),    value:'sunny day at the beach',});console.log(embedding);console.log(usage);}main().catch(console.error);
```
