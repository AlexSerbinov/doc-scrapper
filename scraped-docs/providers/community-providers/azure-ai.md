# Azure Custom Provider for AI SDK


---
url: https://ai-sdk.dev/providers/community-providers/azure-ai
description: Learn how to use the @quail-ai/azure-ai-provider for the AI SDK.
---


# [Azure Custom Provider for AI SDK](#azure-custom-provider-for-ai-sdk)


The **[Quail-AI/azure-ai-provider](https://github.com/QuailAI/azure-ai-provider)** enables unofficial integration with Azure-hosted language models that use Azure's native APIs instead of the standard OpenAI API format.


## [Language Models](#language-models)


This provider works with any model in the Azure AI Foundry that is compatible with the Azure-Rest AI-inference API. **Note:** This provider is not compatible with the Azure OpenAI models. For those, please use the [Azure OpenAI Provider](/providers/ai-sdk-providers/azure).


### [Models Tested:](#models-tested)


-   DeepSeek-R1
-   LLama 3.3-70B Instruct
-   Cohere-command-r-08-2024


## [Setup](#setup)



### [Installation](#installation)


Install the provider via npm:

```
npm i @quail-ai/azure-ai-provider
```


## [Provider Instance](#provider-instance)


Create an Azure AI resource and set up your endpoint URL and API key. Add the following to your `.env` file:

```
AZURE_API_ENDPOINT=https://<your-resource>.services.ai.azure.com/modelsAZURE_API_KEY=<your-api-key>
```

Import `createAzure` from the package to create your provider instance:

```
import{ createAzure }from'@quail-ai/azure-ai-provider';const azure =createAzure({  endpoint: process.env.AZURE_API_ENDPOINT,  apiKey: process.env.AZURE_API_KEY,});
```


## [Basic Usage](#basic-usage)


Generate text using the Azure custom provider:

```
import{ generateText }from'ai';const{ text }=awaitgenerateText({  model:azure('your-deployment-name'),  prompt:'Write a story about a robot.',});
```


## [Status](#status)


> ✅ Chat Completions: Working with both streaming and non-streaming responses ⚠️ Tool Calling: Functionality highly dependent on model choice ⚠️ Embeddings: Implementation present but untested
