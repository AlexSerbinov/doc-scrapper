# Letta Provider


---
url: https://ai-sdk.dev/providers/community-providers/letta
description: Learn how to use the Letta AI SDK provider for the AI SDK.
---


# [Letta Provider](#letta-provider)


The [Letta AI-SDK provider](https://github.com/letta-ai/vercel-ai-sdk-provider) is the official provider for the [Letta](https://docs.letta.com) platform. It allows you to integrate Letta's AI capabilities into your applications using the Vercel AI SDK.


## [Setup](#setup)


The Letta provider is available in the `@letta-ai/vercel-ai-sdk-provider` module. You can install it with:

pnpm

npm

yarn

pnpm add @letta-ai/vercel-ai-sdk-provider


## [Setup](#setup-1)


The Letta provider is available in the `@letta-ai/vercel-ai-sdk-provider` module. You can install it with

```
npm i @letta-ai/vercel-ai-sdk-provider a
```


## [Provider Instance](#provider-instance)


You can import the default provider instance `letta` from `@letta-ai/vercel-ai-sdk-provider`:

```
import{ letta }from'@letta-ai/vercel-ai-sdk-provider';
```


## [Quick Start](#quick-start)



### [Using Letta Cloud (](#using-letta-cloud-httpsapilettacom)[https://api.letta.com](https://api.letta.com))


Create a file called `.env.local` and add your [API Key](https://app.letta.com/api-keys)

```
LETTA_API_KEY=<your api key>
```

```
import{ lettaCloud }from'@letta-ai/vercel-ai-sdk-provider';import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:lettaCloud('your-agent-id'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',});
```


### [Local instances (](#local-instances-httplocalhost8283)[http://localhost:8283](http://localhost:8283))


```
import{ lettaLocal }from'@letta-ai/vercel-ai-sdk-provider';import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:lettaLocal('your-agent-id'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',});
```


### [Custom setups](#custom-setups)


```
import{ createLetta }from'@letta-ai/vercel-ai-sdk-provider';import{ generateText }from'ai';const letta =createLetta({  baseUrl:'<your-base-url>',  token:'<your-access-token>',});const{ text }=awaitgenerateText({  model:letta('your-agent-id'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',});
```


### [Using other Letta Client Functions](#using-other-letta-client-functions)


The `vercel-ai-sdk-provider` extends the [@letta-ai/letta-client](https://www.npmjs.com/package/@letta-ai/letta-client), you can access the operations directly by using `lettaCloud.client` or `lettaLocal.client` or your custom generated `letta.client`

```
import{ lettaCloud }from'@letta-ai/vercel-ai-sdk-provider';lettaCloud.agents.list();
```


### [More Information](#more-information)


For more information on the Letta API, please refer to the [Letta API documentation](https://docs.letta.com/api).
