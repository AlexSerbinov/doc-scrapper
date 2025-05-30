# Stream Object


---
url: https://ai-sdk.dev/cookbook/node/stream-object
description: Learn how to stream structured data using the AI SDK and Node
---


# [Stream Object](#stream-object)


Object generation can sometimes take a long time to complete, especially when you're generating a large schema.

In Generative UI use cases, it is useful to stream the object to the client in real-time to render UIs as the object is being generated. You can use the [`streamObject`](/docs/reference/ai-sdk-core/stream-object) function to generate partial object streams.

```
import{ openai }from'@ai-sdk/openai';import{ streamObject }from'ai';import{ z }from'zod';const{ partialObjectStream }=streamObject({  model:openai('gpt-4-turbo'),  schema: z.object({    recipe: z.object({      name: z.string(),      ingredients: z.array(z.string()),      steps: z.array(z.string()),}),}),  prompt:'Generate a lasagna recipe.',});forawait(const partialObject of partialObjectStream){console.clear();console.log(partialObject);}
```
