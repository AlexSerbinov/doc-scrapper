# Crosshatch Provider


---
url: https://ai-sdk.dev/providers/community-providers/crosshatch
description: Learn how to use the Crosshatch provider for the AI SDK.
---


# [Crosshatch Provider](#crosshatch-provider)


The [Crosshatch](https://crosshatch.io) provider supports secure inference from popular language models with permissioned access to data users share, giving responses personalized with complete user context.

It creates language model objects that can be used with the `generateText`, `streamText`, `generateObject` and `streamObject` functions.


## [Setup](#setup)


The Crosshatch provider is available via the `@crosshatch/ai-provider` module. You can install it with:

pnpm

npm

yarn

pnpm add @crosshatch/ai-provider

The [Crosshatch](https://crosshatch.io/) provider supports all of their available models such as OpenAI's GPT and Anthropic's Claude. This provider also supports the querying interface for controlling Crosshatch's custom data integration behaviors. This provider wraps the existing underlying providers ([@ai-sdk/openai](/providers/ai-sdk-providers/openai), [@ai-sdk/anthropic](/providers/ai-sdk-providers/openai).


### [Credentials](#credentials)


The Crosshatch provider is authenticated by user-specific tokens, enabling permissioned access to personalized inference.

You can obtain synthetic and test user tokens from the [your Crosshatch developer dashboard](https://platform.crosshatch.io/).

Production user tokens are provisioned and accessed with the [Link SDK](https://www.npmjs.com/package/@crosshatch/link) using your Crosshatch developer client id.


## [Provider Instance](#provider-instance)


To create a Crosshatch provider instance, use the `createCrosshatch` function:

```
importcreateCrosshatchfrom'@crosshatch/ai-provider';
```


## [Language Models](#language-models)


You can create [Crosshatch models](https://docs.crosshatch.io/endpoints/ai#supported-model-providers) using a provider instance.

```
import{ createCrosshatch }from'@crosshatch/ai-provider';const crosshatch =createCrosshatch();
```

To create a model instance, call the provider instance and specify the model you would like to use in the first argument. In the second argument, specify the user auth token, desired context, and model arguments. You can use Crosshatch to get generated text based on permissioned user context and your favorite language model.


### [Example: Generate Text with Context](#example-generate-text-with-context)


This example uses `gpt-4o-mini` to generate text.

```
import{ generateText }from'ai';importcreateCrosshatchfrom'@crosshatch/ai-provider':const crosshatch =createCrosshatch();const{ text }=awaitgenerateText({  model: crosshatch.languageModel("gpt-4o-mini",{    token:'YOUR_ACCESS_TOKEN',    replace:{      restaurants:{        select:["entity_name","entity_city","entity_region"],from:"personalTimeline",        where:[{ field:"event", op:"=", value:"confirmed"},{ field:"entity_subtype2", op:"=", value:"RESTAURANTS"}],        groupby:["entity_name","entity_city","entity_region"],        orderby:"count DESC",        limit:5}}}),  system:`The user recently ate at these restaurants: {restaurants}`,  messages:[{role:"user", content:"Where should I stay in Paris?"}]});
```


### [Example: Recommend Items based on Context](#example-recommend-items-based-on-context)


Use crosshatch to re-rank items based on recent user purchases.

```
import{ streamObject }from'ai';importcreateCrosshatchfrom`@crosshatch/ai-provider`const crosshatch =createCrosshatch();const itemSummaries =[...];// list of itemsconst ids =(itemSummaries?.map(({ itemId })=> itemId)??[])asstring[];const{ elementStream }=streamObject({  output:"array",  mode:"json",  model: crosshatch.languageModel("gpt-4o-mini",{    token,    replace:{"orders":{        select:["originalTimestamp","entity_name","order_total","order_summary"],from:"personalTimeline",        where:[{ field:"event", op:"=", value:"purchased"}],        orderBy:[{ field:"originalTimestamp", dir:"desc"}],        limit:5,},},}),  system:`Rerank the following items based on alignment with users recent purchases {orders}`,  messages:[{role:"user", content:"Heres a list of item: ${JSON.stringify(itemSummaries)"},],  schema:jsonSchema<{ id:string; reason:string}>({type:"object",    properties:{      id:{type:"string",enum: ids },      reason:{type:"string", description:"Explain your ranking."},},}),})
```
