# Record Token Usage After Streaming Object


---
url: https://ai-sdk.dev/cookbook/node/stream-object-record-token-usage
description: Learn how to record token usage when streaming structured data using the AI SDK and Node
---


# [Record Token Usage After Streaming Object](#record-token-usage-after-streaming-object)


When you're streaming structured data with [`streamObject`](/docs/reference/ai-sdk-core/stream-object), you may want to record the token usage for billing purposes.


## [`onFinish` Callback](#onfinish-callback)


You can use the `onFinish` callback to record token usage. It is called when the stream is finished.

```
import{ openai }from'@ai-sdk/openai';import{ streamObject }from'ai';import{ z }from'zod';const result =streamObject({  model:openai('gpt-4-turbo'),  schema: z.object({    recipe: z.object({      name: z.string(),      ingredients: z.array(z.string()),      steps: z.array(z.string()),}),}),  prompt:'Generate a lasagna recipe.',onFinish({ usage }){console.log('Token usage:', usage);},});
```


## [`usage` Promise](#usage-promise)


The [`streamObject`](/docs/reference/ai-sdk-core/stream-object) result contains a `usage` promise that resolves to the total token usage.

```
import{ openai }from'@ai-sdk/openai';import{ streamObject,TokenUsage}from'ai';import{ z }from'zod';const result =streamObject({  model:openai('gpt-4-turbo'),  schema: z.object({    recipe: z.object({      name: z.string(),      ingredients: z.array(z.string()),      steps: z.array(z.string()),}),}),  prompt:'Generate a lasagna recipe.',});// your custom function to record token usage:functionrecordTokenUsage({  promptTokens,  completionTokens,  totalTokens,}:TokenUsage){console.log('Prompt tokens:', promptTokens);console.log('Completion tokens:', completionTokens);console.log('Total tokens:', totalTokens);}// use as promise:result.usage.then(recordTokenUsage);// use with async/await:recordTokenUsage(await result.usage);// note: the stream needs to be consumed because of backpressureforawait(const partialObject of result.partialObjectStream){}
```
