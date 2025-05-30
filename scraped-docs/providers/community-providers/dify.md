# Dify Provider


---
url: https://ai-sdk.dev/providers/community-providers/dify
description: Learn how to use the Dify provider for the AI SDK.
---


# [Dify Provider](#dify-provider)


The **[Dify provider](https://github.com/warmwind/dify-ai-provider)** allows you to easily integrate Dify's application workflow with your applications using the AI SDK.


## [Setup](#setup)


The Dify provider is available in the `dify-ai-provider` module. You can install it with:

```
npminstall dify-ai-provider# pnpmpnpmadd dify-ai-provider# yarnyarnadd dify-ai-provider
```


## [Provider Instance](#provider-instance)


You can import `difyProvider` from `dify-ai-provider` to create a provider instance:

```
import{ difyProvider }from'dify-ai-provider';
```


## [Example](#example)



### [Use dify.ai](#use-difyai)


```
import{ generateText }from'ai';import{ difyProvider }from'dify-ai-provider';const dify =difyProvider('dify-application-id',{  responseMode:'blocking',  apiKey:'dify-api-key',});const{ text, providerMetadata }=awaitgenerateText({  model: dify,  messages:[{ role:'user', content:'Hello, how are you today?'}],  headers:{'user-id':'test-user'},});const{ conversationId, messageId }= providerMetadata.difyWorkflowData;console.log(text);console.log('conversationId', conversationId);console.log('messageId', messageId);
```


### [Use self-hosted Dify](#use-self-hosted-dify)


```
import{ createDifyProvider }from'dify-ai-provider';const difyProvider =createDifyProvider({  baseURL:'your-base-url',});const dify =difyProvider('dify-application-id',{  responseMode:'blocking',  apiKey:'dify-api-key',});
```


## [Documentation](#documentation)


Please refer to the **[Dify provider documentation](https://github.com/warmwind/dify-ai-provider)** for more detailed information.
