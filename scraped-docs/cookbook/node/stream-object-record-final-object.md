# Record Final Object after Streaming Object


---
url: https://ai-sdk.dev/cookbook/node/stream-object-record-final-object
description: Learn how to record the final object after streaming an object using the AI SDK and Node
---


# [Record Final Object after Streaming Object](#record-final-object-after-streaming-object)


When you're streaming structured data, you may want to record the final object for logging or other purposes.


## [`onFinish` Callback](#onfinish-callback)


You can use the `onFinish` callback to record the final object. It is called when the stream is finished.

The `object` parameter contains the final object, or `undefined` if the type validation fails. There is also an `error` parameter that contains error when e.g. the object does not match the schema.

```
import{ openai }from'@ai-sdk/openai';import{ streamObject }from'ai';import{ z }from'zod';const result =streamObject({  model:openai('gpt-4-turbo'),  schema: z.object({    recipe: z.object({      name: z.string(),      ingredients: z.array(z.string()),      steps: z.array(z.string()),}),}),  prompt:'Generate a lasagna recipe.',onFinish({ object, error }){// handle type validation failure (when the object does not match the schema):if(object ===undefined){console.error('Error:', error);return;}console.log('Final object:',JSON.stringify(object,null,2));},});
```


## [`object` Promise](#object-promise)


The [`streamObject`](/docs/reference/ai-sdk-core/stream-object) result contains an `object` promise that resolves to the final object. The object is fully typed. When the type validation according to the schema fails, the promise will be rejected with a `TypeValidationError`.

```
import{ openai }from'@ai-sdk/openai';import{ streamObject }from'ai';import{ z }from'zod';const result =streamObject({  model:openai('gpt-4-turbo'),  schema: z.object({    recipe: z.object({      name: z.string(),      ingredients: z.array(z.string()),      steps: z.array(z.string()),}),}),  prompt:'Generate a lasagna recipe.',});result.object.then(({ recipe })=>{// do something with the fully typed, final object:console.log('Recipe:',JSON.stringify(recipe,null,2));}).catch(error =>{// handle type validation failure// (when the object does not match the schema):console.error(error);});// note: the stream needs to be consumed because of backpressureforawait(const partialObject of result.partialObjectStream){}
```
