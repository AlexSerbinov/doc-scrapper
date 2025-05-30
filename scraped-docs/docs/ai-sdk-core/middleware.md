# Language Model Middleware


---
url: https://ai-sdk.dev/docs/ai-sdk-core/middleware
description: Learn how to use middleware to enhance the behavior of language models
---


# [Language Model Middleware](#language-model-middleware)


Language model middleware is a way to enhance the behavior of language models by intercepting and modifying the calls to the language model.

It can be used to add features like guardrails, RAG, caching, and logging in a language model agnostic way. Such middleware can be developed and distributed independently from the language models that they are applied to.


## [Using Language Model Middleware](#using-language-model-middleware)


You can use language model middleware with the `wrapLanguageModel` function. It takes a language model and a language model middleware and returns a new language model that incorporates the middleware.

```
import{ wrapLanguageModel }from'ai';const wrappedLanguageModel =wrapLanguageModel({  model: yourModel,  middleware: yourLanguageModelMiddleware,});
```

The wrapped language model can be used just like any other language model, e.g. in `streamText`:

```
const result =streamText({  model: wrappedLanguageModel,  prompt:'What cities are in the United States?',});
```


## [Multiple middlewares](#multiple-middlewares)


You can provide multiple middlewares to the `wrapLanguageModel` function. The middlewares will be applied in the order they are provided.

```
const wrappedLanguageModel =wrapLanguageModel({  model: yourModel,  middleware:[firstMiddleware, secondMiddleware],});// applied as: firstMiddleware(secondMiddleware(yourModel))
```


## [Built-in Middleware](#built-in-middleware)


The AI SDK comes with several built-in middlewares that you can use to configure language models:

-   `extractReasoningMiddleware`: Extracts reasoning information from the generated text and exposes it as a `reasoning` property on the result.
-   `simulateStreamingMiddleware`: Simulates streaming behavior with responses from non-streaming language models.
-   `defaultSettingsMiddleware`: Applies default settings to a language model.


### [Extract Reasoning](#extract-reasoning)


Some providers and models expose reasoning information in the generated text using special tags, e.g. <think> and </think>.

The `extractReasoningMiddleware` function can be used to extract this reasoning information and expose it as a `reasoning` property on the result.

```
import{ wrapLanguageModel, extractReasoningMiddleware }from'ai';const model =wrapLanguageModel({  model: yourModel,  middleware:extractReasoningMiddleware({ tagName:'think'}),});
```

You can then use that enhanced model in functions like `generateText` and `streamText`.

The `extractReasoningMiddleware` function also includes a `startWithReasoning` option. When set to `true`, the reasoning tag will be prepended to the generated text. This is useful for models that do not include the reasoning tag at the beginning of the response. For more details, see the [DeepSeek R1 guide](/docs/guides/r1#deepseek-r1-middleware).


### [Simulate Streaming](#simulate-streaming)


The `simulateStreamingMiddleware` function can be used to simulate streaming behavior with responses from non-streaming language models. This is useful when you want to maintain a consistent streaming interface even when using models that only provide complete responses.

```
import{ wrapLanguageModel, simulateStreamingMiddleware }from'ai';const model =wrapLanguageModel({  model: yourModel,  middleware:simulateStreamingMiddleware(),});
```


### [Default Settings](#default-settings)


The `defaultSettingsMiddleware` function can be used to apply default settings to a language model.

```
import{ wrapLanguageModel, defaultSettingsMiddleware }from'ai';const model =wrapLanguageModel({  model: yourModel,  middleware:defaultSettingsMiddleware({    settings:{      temperature:0.5,      maxTokens:800,// note: use providerMetadata instead of providerOptions here:      providerMetadata:{ openai:{ store:false}},},}),});
```


## [Implementing Language Model Middleware](#implementing-language-model-middleware)


Implementing language model middleware is advanced functionality and requires a solid understanding of the [language model specification](https://github.com/vercel/ai/blob/main/packages/provider/src/language-model/v1/language-model-v1.ts).

You can implement any of the following three function to modify the behavior of the language model:

1.  `transformParams`: Transforms the parameters before they are passed to the language model, for both `doGenerate` and `doStream`.
2.  `wrapGenerate`: Wraps the `doGenerate` method of the [language model](https://github.com/vercel/ai/blob/main/packages/provider/src/language-model/v1/language-model-v1.ts). You can modify the parameters, call the language model, and modify the result.
3.  `wrapStream`: Wraps the `doStream` method of the [language model](https://github.com/vercel/ai/blob/main/packages/provider/src/language-model/v1/language-model-v1.ts). You can modify the parameters, call the language model, and modify the result.

Here are some examples of how to implement language model middleware:


## [Examples](#examples)


These examples are not meant to be used in production. They are just to show how you can use middleware to enhance the behavior of language models.


### [Logging](#logging)


This example shows how to log the parameters and generated text of a language model call.

```
importtype{LanguageModelV1Middleware,LanguageModelV1StreamPart}from'ai';exportconst yourLogMiddleware:LanguageModelV1Middleware={wrapGenerate:async({ doGenerate, params })=>{console.log('doGenerate called');console.log(`params: ${JSON.stringify(params,null,2)}`);const result =awaitdoGenerate();console.log('doGenerate finished');console.log(`generated text: ${result.text}`);return result;},wrapStream:async({ doStream, params })=>{console.log('doStream called');console.log(`params: ${JSON.stringify(params,null,2)}`);const{ stream,...rest }=awaitdoStream();let generatedText ='';const transformStream =newTransformStream<LanguageModelV1StreamPart,LanguageModelV1StreamPart>({transform(chunk, controller){if(chunk.type==='text-delta'){          generatedText += chunk.textDelta;}        controller.enqueue(chunk);},flush(){console.log('doStream finished');console.log(`generated text: ${generatedText}`);},});return{      stream: stream.pipeThrough(transformStream),...rest,};},};
```


### [Caching](#caching)


This example shows how to build a simple cache for the generated text of a language model call.

```
importtype{LanguageModelV1Middleware}from'ai';const cache =newMap<string,any>();exportconst yourCacheMiddleware:LanguageModelV1Middleware={wrapGenerate:async({ doGenerate, params })=>{const cacheKey =JSON.stringify(params);if(cache.has(cacheKey)){return cache.get(cacheKey);}const result =awaitdoGenerate();    cache.set(cacheKey, result);return result;},// here you would implement the caching logic for streaming};
```


### [Retrieval Augmented Generation (RAG)](#retrieval-augmented-generation-rag)


This example shows how to use RAG as middleware.

Helper functions like `getLastUserMessageText` and `findSources` are not part of the AI SDK. They are just used in this example to illustrate the concept of RAG.

```
importtype{LanguageModelV1Middleware}from'ai';exportconst yourRagMiddleware:LanguageModelV1Middleware={transformParams:async({ params })=>{const lastUserMessageText =getLastUserMessageText({      prompt: params.prompt,});if(lastUserMessageText ==null){return params;// do not use RAG (send unmodified parameters)}const instruction ='Use the following information to answer the question:\n'+findSources({ text: lastUserMessageText }).map(chunk =>JSON.stringify(chunk)).join('\n');returnaddToLastUserMessage({ params, text: instruction });},};
```


### [Guardrails](#guardrails)


Guard rails are a way to ensure that the generated text of a language model call is safe and appropriate. This example shows how to use guardrails as middleware.

```
importtype{LanguageModelV1Middleware}from'ai';exportconst yourGuardrailMiddleware:LanguageModelV1Middleware={wrapGenerate:async({ doGenerate })=>{const{ text,...rest }=awaitdoGenerate();// filtering approach, e.g. for PII or other sensitive information:const cleanedText = text?.replace(/badword/g,'<REDACTED>');return{ text: cleanedText,...rest };},// here you would implement the guardrail logic for streaming// Note: streaming guardrails are difficult to implement, because// you do not know the full content of the stream until it's finished.};
```


## [Configuring Per Request Custom Metadata](#configuring-per-request-custom-metadata)


To send and access custom metadata in Middleware, you can use `providerOptions`. This is useful when building logging middleware where you want to pass additional context like user IDs, timestamps, or other contextual data that can help with tracking and debugging.

```
import{ openai }from'@ai-sdk/openai';import{ generateText, wrapLanguageModel,LanguageModelV1Middleware}from'ai';exportconst yourLogMiddleware:LanguageModelV1Middleware={wrapGenerate:async({ doGenerate, params })=>{console.log('METADATA', params?.providerMetadata?.yourLogMiddleware);const result =awaitdoGenerate();return result;},};const{ text }=awaitgenerateText({  model:wrapLanguageModel({    model:openai('gpt-4o'),    middleware: yourLogMiddleware,}),  prompt:'Invent a new holiday and describe its traditions.',  providerOptions:{    yourLogMiddleware:{      hello:'world',},},});console.log(text);
```
