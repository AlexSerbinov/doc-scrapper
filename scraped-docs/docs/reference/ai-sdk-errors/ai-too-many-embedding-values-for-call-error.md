# AI_TooManyEmbeddingValuesForCallError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-too-many-embedding-values-for-call-error
description: Learn how to fix AI_TooManyEmbeddingValuesForCallError
---


# [AI\_TooManyEmbeddingValuesForCallError](#ai_toomanyembeddingvaluesforcallerror)


This error occurs when too many values are provided in a single embedding call.


## [Properties](#properties)


-   `provider`: The AI provider name
-   `modelId`: The ID of the embedding model
-   `maxEmbeddingsPerCall`: The maximum number of embeddings allowed per call
-   `values`: The array of values that was provided


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_TooManyEmbeddingValuesForCallError` using:

```
import{TooManyEmbeddingValuesForCallError}from'ai';if(TooManyEmbeddingValuesForCallError.isInstance(error)){// Handle the error}
```
