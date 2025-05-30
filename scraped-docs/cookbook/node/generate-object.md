# Generate Object


---
url: https://ai-sdk.dev/cookbook/node/generate-object
description: Learn how to generate structured data using the AI SDK and Node
---


# [Generate Object](#generate-object)


Earlier functions like `generateText` and `streamText` gave us the ability to generate unstructured text. However, if you want to generate structured data like JSON, you can provide a schema that describes the structure of your desired object to the `generateObject` function.

The function requires you to provide a schema using [zod](https://zod.dev), a library for defining schemas for JavaScript objects. By using zod, you can also use it to validate the generated object and ensure that it conforms to the specified structure.

```
import{ generateObject }from'ai';import{ openai }from'@ai-sdk/openai';import{ z }from'zod';const result =awaitgenerateObject({  model:openai('gpt-4-turbo'),  schema: z.object({    recipe: z.object({      name: z.string(),      ingredients: z.array(        z.object({          name: z.string(),          amount: z.string(),}),),      steps: z.array(z.string()),}),}),  prompt:'Generate a lasagna recipe.',});console.log(JSON.stringify(result.object.recipe,null,2));
```
