# OpenRouter


---
url: https://ai-sdk.dev/providers/community-providers/openrouter
description: OpenRouter Provider for the AI SDK
---


# [OpenRouter](#openrouter)


[OpenRouter](https://openrouter.ai/) is a unified API gateway that provides access to hundreds of AI models from leading providers like Anthropic, Google, Meta, Mistral, and more. The OpenRouter provider for the AI SDK enables seamless integration with all these models while offering unique advantages:

-   **Universal Model Access**: One API key for hundreds of models from multiple providers
-   **Cost-Effective**: Pay-as-you-go pricing with no monthly fees or commitments
-   **Transparent Pricing**: Clear per-token costs for all models
-   **High Availability**: Enterprise-grade infrastructure with automatic failover
-   **Simple Integration**: Standardized API across all models
-   **Latest Models**: Immediate access to new models as they're released

Learn more about OpenRouter's capabilities in the [OpenRouter Documentation](https://openrouter.ai/docs).


## [Setup](#setup)


The OpenRouter provider is available in the `@openrouter/ai-sdk-provider` module. You can install it with:

pnpm

npm

yarn

pnpm add @openrouter/ai-sdk-provider


## [Provider Instance](#provider-instance)


To create an OpenRouter provider instance, use the `createOpenRouter` function:

```
import{ createOpenRouter }from'@openrouter/ai-sdk-provider';const openrouter =createOpenRouter({  apiKey:'YOUR_OPENROUTER_API_KEY',});
```

You can obtain your OpenRouter API key from the [OpenRouter Dashboard](https://openrouter.ai/keys).


## [Language Models](#language-models)


OpenRouter supports both chat and completion models. Use `openrouter.chat()` for chat models and `openrouter.completion()` for completion models:

```
// Chat models (recommended)const chatModel = openrouter.chat('anthropic/claude-3.5-sonnet');// Completion modelsconst completionModel = openrouter.completion('meta-llama/llama-3.1-405b-instruct',);
```

You can find the full list of available models in the [OpenRouter Models documentation](https://openrouter.ai/docs#models).


## [Examples](#examples)


Here are examples of using OpenRouter with the AI SDK:


### [`generateText`](#generatetext)


```
import{ createOpenRouter }from'@openrouter/ai-sdk-provider';import{ generateText }from'ai';const openrouter =createOpenRouter({  apiKey:'YOUR_OPENROUTER_API_KEY',});const{ text }=awaitgenerateText({  model: openrouter.chat('anthropic/claude-3.5-sonnet'),  prompt:'What is OpenRouter?',});console.log(text);
```


### [`streamText`](#streamtext)


```
import{ createOpenRouter }from'@openrouter/ai-sdk-provider';import{ streamText }from'ai';const openrouter =createOpenRouter({  apiKey:'YOUR_OPENROUTER_API_KEY',});const result =streamText({  model: openrouter.chat('meta-llama/llama-3.1-405b-instruct'),  prompt:'Write a short story about AI.',});forawait(const chunk of result){console.log(chunk);}
```


## [Advanced Features](#advanced-features)


OpenRouter offers several advanced features to enhance your AI applications:

1.  **Model Flexibility**: Switch between hundreds of models without changing your code or managing multiple API keys.

2.  **Cost Management**: Track usage and costs per model in real-time through the dashboard.

3.  **Enterprise Support**: Available for high-volume users with custom SLAs and dedicated support.

4.  **Cross-Provider Compatibility**: Use the same code structure across different model providers.

5.  **Regular Updates**: Automatic access to new models and features as they become available.


For more information about these features and advanced configuration options, visit the [OpenRouter Documentation](https://openrouter.ai/docs).


## [Additional Resources](#additional-resources)


-   [OpenRouter Provider Repository](https://github.com/OpenRouterTeam/ai-sdk-provider)
-   [OpenRouter Documentation](https://openrouter.ai/docs)
-   [OpenRouter Dashboard](https://openrouter.ai/dashboard)
-   [OpenRouter Discord Community](https://discord.gg/openrouter)
-   [OpenRouter Status Page](https://status.openrouter.ai)
