# Spark Provider


---
url: https://ai-sdk.dev/providers/community-providers/spark
description: Learn how to use the Spark provider for the AI SDK.
---


# [Spark Provider](#spark-provider)


The **[Spark provider](https://github.com/klren0312/spark-ai-provider)** contains language model support for the Spark API, giving you access to models like lite, generalv3, pro-128k, generalv3.5, max-32k and 4.0Ultra.


## [Setup](#setup)


The Spark provider is available in the `spark-ai-provider` module. You can install it with

```
npm i spark-ai-provider
```


## [Provider Instance](#provider-instance)


You can import `createSparkProvider` from `spark-ai-provider` to create a provider instance:

```
import{ createSparkProvider }from'spark-ai-provider';
```


## [Example](#example)


```
import{ createSparkProvider }from'./index.mjs';import{ generateText }from'ai';const spark =createSparkProvider({  apiKey:'',});const{ text }=awaitgenerateText({  model:spark('lite'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',});
```


## [Documentation](#documentation)


Please check out the **[Spark provider documentation](https://github.com/klren0312/spark-ai-provider)** for more information.
