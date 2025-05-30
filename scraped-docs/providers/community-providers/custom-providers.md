# Writing a Custom Provider


---
url: https://ai-sdk.dev/providers/community-providers/custom-providers
description: Learn how to write a custom provider for the AI SDK
---


# [Writing a Custom Provider](#writing-a-custom-provider)


The AI SDK provides a [Language Model Specification](https://github.com/vercel/ai/tree/main/packages/provider/src/language-model/v1). You can write your own provider that adheres to the specification and it will be compatible with the AI SDK.

You can find the Language Model Specification in the [AI SDK repository](https://github.com/vercel/ai/tree/main/packages/provider/src/language-model/v1). It can be imported from `'@ai-sdk/provider'`. We also provide utilities that make it easier to implement a custom provider. You can find them in the `@ai-sdk/provider-utils` package ([source code](https://github.com/vercel/ai/tree/main/packages/provider-utils)).

If you open-source a provider, we'd love to promote it here. Please send us a PR to add it to the [Community Providers](/providers/community-providers) section.


## [Provider Implementation Guide](#provider-implementation-guide)


Implementing a custom language model provider involves several steps:

-   Creating an entry point
-   Adding a language model implementation
-   Mapping the input (prompt, tools, settings)
-   Processing the results (generate, streaming, tool calls)
-   Supporting object generation

The best way to get started is to copy a reference implementation and modify it to fit your needs. Check out the [Mistral reference implementation](https://github.com/vercel/ai/tree/main/packages/mistral) to see how the project is structured, and feel free to copy the setup.


### [Creating an Entry Point](#creating-an-entry-point)


Each AI SDK provider should follow the pattern of using a factory function that returns a provider instance and provide a default instance.

custom-provider.ts

```
import{  generateId,  loadApiKey,  withoutTrailingSlash,}from'@ai-sdk/provider-utils';import{CustomChatLanguageModel}from'./custom-chat-language-model';import{CustomChatModelId,CustomChatSettings}from'./custom-chat-settings';// model factory function with additional methods and propertiesexportinterfaceCustomProvider{(    modelId:CustomChatModelId,    settings?:CustomChatSettings,):CustomChatLanguageModel;// explicit method for targeting a specific API in case there are severalchat(    modelId:CustomChatModelId,    settings?:CustomChatSettings,):CustomChatLanguageModel;}// optional settings for the providerexportinterfaceCustomProviderSettings{/**Use a different URL prefix for API calls, e.g. to use proxy servers.   */  baseURL?:string;/**API key.   */  apiKey?:string;/**Custom headers to include in the requests.     */  headers?:Record<string,string>;}// provider factory functionexportfunctioncreateCustomProvider(  options:CustomProviderSettings={},):CustomProvider{constcreateModel=(    modelId:CustomChatModelId,    settings:CustomChatSettings={},)=>newCustomChatLanguageModel(modelId, settings,{      provider:'custom.chat',      baseURL:withoutTrailingSlash(options.baseURL)??'https://custom.ai/api/v1',headers:()=>({Authorization:`Bearer ${loadApiKey({          apiKey: options.apiKey,          environmentVariableName:'CUSTOM_API_KEY',          description:'Custom Provider',})}`,...options.headers,}),      generateId: options.generateId?? generateId,});constprovider=function(    modelId:CustomChatModelId,    settings?:CustomChatSettings,){if(new.target){thrownewError('The model factory function cannot be called with the new keyword.',);}returncreateModel(modelId, settings);};  provider.chat= createModel;return provider;}/** * Default custom provider instance. */exportconst customProvider =createCustomProvider();
```


### [Implementing the Language Model](#implementing-the-language-model)


A [language model](https://github.com/vercel/ai/blob/main/packages/provider/src/language-model/v1/language-model-v1.ts) needs to implement:

-   metadata fields
    -   `specificationVersion: 'v1'` - always `'v1'`
    -   `provider: string` - name of the provider
    -   `modelId: string` - unique identifier of the model
    -   `defaultObjectGenerationMode` - default object generation mode, e.g. "json"
-   `doGenerate` method
-   `doStream` method

Check out the [Mistral language model](https://github.com/vercel/ai/blob/main/packages/mistral/src/mistral-chat-language-model.ts) as an example.

At a high level, both `doGenerate` and `doStream` methods should:

1.  **Map the prompt and the settings to the format required by the provider API.** This can be extracted, e.g. the Mistral provider contains a `getArgs` method.
2.  **Call the provider API.** You could e.g. use fetch calls or a library offered by the provider.
3.  **Process the results.** You need to convert the response to the format required by the AI SDK.


### [Errors](#errors)


The AI SDK provides [standardized errors](https://github.com/vercel/ai/tree/main/packages/provider/src/errors) that should be used by providers where possible. This will make it easy for user to debug them.


### [Retries, timeouts, and abort signals](#retries-timeouts-and-abort-signals)


The AI SDK will handle retries, timeouts, and aborting requests in a unified way. The model classes should not implement retries or timeouts themselves. Instead, they should use the `abortSignal` parameter to determine when the call should be aborted, and they should throw `ApiCallErrors` (or similar) with a correct `isRetryable` flag when errors such as network errors occur.
