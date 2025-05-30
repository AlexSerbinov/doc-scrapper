# Unofficial Community Provider for AI SDK - Inflection AI


---
url: https://ai-sdk.dev/providers/community-providers/inflection-ai
description: Learn how to use the unofficial Inflection AI provider for the AI SDK.
---


# [Unofficial Community Provider for AI SDK - Inflection AI](#unofficial-community-provider-for-ai-sdk---inflection-ai)


The **[unofficial Inflection AI provider](https://www.npmjs.com/package/inflection-ai-sdk-provider)** for the [AI SDK](/docs) contains language model support for the [Inflection AI API](https://developers.inflection.ai/).


## [Setup](#setup)


The Inflection AI provider is available in the [`inflection-ai-sdk-provider`](https://www.npmjs.com/package/inflection-ai-sdk-provider) module on npm. You can install it with

```
npm i inflection-ai-sdk-provider
```


## [Provider Instance](#provider-instance)


You can import the default provider instance `inflection` from `inflection-ai-sdk-provider`:

```
import{ inflection }from'inflection-ai-sdk-provider';
```


## [Example](#example)


```
import{ inflection }from'inflection-ai-sdk-provider';import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:inflection('inflection_3_with_tools'),  prompt:'how can I make quick chicken pho?',});
```


## [Models](#models)


The following models are supported:

-   `inflection_3_pi` - "the model powering our Pi experience, including a backstory, emotional intelligence, productivity, and safety. It excels in scenarios such as customer support chatbots."
-   `inflection_3_productivity`\- "the model optimized for following instructions. It is better for tasks requiring JSON output or precise adherence to provided guidelines."
-   `inflection_3_with_tools` - This model seems to be in preview and it lacks an official description as of the writing of this README in 1.0.0.

Model

Text Generation

Streaming

Image Input

Object Generation

Tool Usage

Tool Streaming

`inflection_3_pi`

✓

✓

✗

✗

✗

✗

`inflection_3_productivity`

✓

✓

✗

✗

✗

✗

`inflection_3_with_tools`

✓

✓

✗

✗

✗

✗

There is limited API support for features other than text generation and streaming text at this time. Should that change, the table above will be updated and support will be added to this unofficial provider.


## [Documentation](#documentation)


Please check out Inflection AI's [API Documentation](https://developers.inflection.ai/docs/api-reference) for more information.

You can find the source code for this provider [here on GitHub](https://github.com/Umbrage-Studios/inflection-ai-sdk-provider).
