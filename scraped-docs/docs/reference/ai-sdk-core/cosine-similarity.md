# cosineSimilarity()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/cosine-similarity
description: Calculate the cosine similarity between two vectors (API Reference)
---


# [`cosineSimilarity()`](#cosinesimilarity)


When you want to compare the similarity of embeddings, standard vector similarity metrics like cosine similarity are often used.

`cosineSimilarity` calculates the cosine similarity between two vectors. A high value (close to 1) indicates that the vectors are very similar, while a low value (close to -1) indicates that they are different.

```
import{ openai }from'@ai-sdk/openai';import{ cosineSimilarity, embedMany }from'ai';const{ embeddings }=awaitembedMany({  model: openai.embedding('text-embedding-3-small'),  values:['sunny day at the beach','rainy afternoon in the city'],});console.log(`cosine similarity: ${cosineSimilarity(embeddings[0], embeddings[1])}`,);
```


## [Import](#import)


import { cosineSimilarity } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### vector1:


number\[\]

The first vector to compare


### vector2:


number\[\]

The second vector to compare


### options?:


Object

Optional configuration.

Object


### throwErrorForEmptyVectors?:


boolean

Set throwErrorForEmptyVectors to true to throw an error when vectors are empty (default: false)


### [Returns](#returns)


A number between -1 and 1 representing the cosine similarity between the two vectors.
