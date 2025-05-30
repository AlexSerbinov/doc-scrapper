# Call Tools with Image Prompt


---
url: https://ai-sdk.dev/cookbook/node/call-tools-with-image-prompt
description: Learn how to call tools with image prompt using the AI SDK and Node
---


# [Call Tools with Image Prompt](#call-tools-with-image-prompt)


Some language models that support vision capabilities accept images as part of the prompt. Here are some of the different [formats](/docs/reference/ai-sdk-core/generate-text#content-image) you can use to include images as input.

```
import{ generateText, tool }from'ai';import{ openai }from'@ai-sdk/openai';import{ z }from'zod';const result =awaitgenerateText({  model:openai('gpt-4-turbo'),  messages:[{      role:'user',      content:[{type:'text', text:'can you log this meal for me?'},{type:'image',          image:newURL('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Cheeseburger_%2817237580619%29.jpg/640px-Cheeseburger_%2817237580619%29.jpg',),},],},],  tools:{    logFood:tool({      description:'Log a food item',      parameters: z.object({        name: z.string(),        calories: z.number(),}),execute({ name, calories }){storeInDatabase({ name, calories });},}),},});
```
