# Portkey Provider


---
url: https://ai-sdk.dev/providers/community-providers/portkey
description: Learn how to use the Portkey provider for the AI SDK.
---


# [Portkey Provider](#portkey-provider)


[Portkey](https://portkey.ai/?utm_source=vercel&utm_medium=docs&utm_campaign=integration) natively integrates with the AI SDK to make your apps production-ready and reliable. Import Portkey's Vercel package and use it as a provider in your Vercel AI app to enable all of Portkey's features:

-   Full-stack **observability** and **tracing** for all requests
-   Interoperability across **250+ LLMs**
-   Built-in **50+** state-of-the-art guardrails
-   Simple & semantic **caching** to save costs & time
-   Conditional request routing with fallbacks, load-balancing, automatic retries, and more
-   Continuous improvement based on user feedback

Learn more at [Portkey docs for the AI SDK](https://docs.portkey.ai/docs/integrations/libraries/vercel)


## [Setup](#setup)


The Portkey provider is available in the `@portkey-ai/vercel-provider` module. You can install it with:

pnpm

npm

yarn

pnpm add @portkey-ai/vercel-provider


## [Provider Instance](#provider-instance)


To create a Portkey provider instance, use the `createPortkey` function:

```
import{ createPortkey }from'@portkey-ai/vercel-provider';const portkeyConfig ={  provider:'openai',//enter provider of choice  api_key:'OPENAI_API_KEY',//enter the respective provider's api key  override_params:{    model:'gpt-4',//choose from 250+ LLMs},};const portkey =createPortkey({  apiKey:'YOUR_PORTKEY_API_KEY',  config: portkeyConfig,});
```

You can find your Portkey API key in the [Portkey Dashboard](https://app.portkey.ai).


## [Language Models](#language-models)


Portkey supports both chat and completion models. Use `portkey.chatModel()` for chat models and `portkey.completionModel()` for completion models:

```
const chatModel = portkey.chatModel('');const completionModel = portkey.completionModel('');
```

Note: You can provide an empty string as the model name if you've defined it in the `portkeyConfig`.


## [Examples](#examples)


You can use Portkey language models with the `generateText` or `streamText` function:


### [`generateText`](#generatetext)


```
import{ createPortkey }from'@portkey-ai/vercel-provider';import{ generateText }from'ai';const portkey =createPortkey({  apiKey:'YOUR_PORTKEY_API_KEY',  config: portkeyConfig,});const{ text }=awaitgenerateText({  model: portkey.chatModel(''),  prompt:'What is Portkey?',});console.log(text);
```


### [`streamText`](#streamtext)


```
import{ createPortkey }from'@portkey-ai/vercel-provider';import{ streamText }from'ai';const portkey =createPortkey({  apiKey:'YOUR_PORTKEY_API_KEY',  config: portkeyConfig,});const result =streamText({  model: portkey.completionModel(''),  prompt:'Invent a new holiday and describe its traditions.',});forawait(const chunk of result){console.log(chunk);}
```

Note:

-   Portkey supports `Tool` use with the AI SDK
-   `generatObject` and `streamObject` are currently not supported.


## [Advanced Features](#advanced-features)


Portkey offers several advanced features to enhance your AI applications:

1.  **Interoperability**: Easily switch between 250+ AI models by changing the provider and model name in your configuration.

2.  **Observability**: Access comprehensive analytics and logs for all your requests.

3.  **Reliability**: Implement caching, fallbacks, load balancing, and conditional routing.

4.  **Guardrails**: Enforce LLM behavior in real-time with input and output checks.

5.  **Security and Compliance**: Set budget limits and implement fine-grained user roles and permissions.


For detailed information on these features and advanced configuration options, please refer to the [Portkey documentation](https://docs.portkey.ai/docs/integrations/libraries/vercel).


## [Additional Resources](#additional-resources)


-   [Portkey Documentation](https://docs.portkey.ai/docs/integrations/libraries/vercel)
-   [Twitter](https://twitter.com/portkeyai)
-   [Discord Community](https://discord.gg/JHPt4C7r)
-   [Portkey Dashboard](https://app.portkey.ai)
