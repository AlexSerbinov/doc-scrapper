# Generate Text with Image Prompt


---
url: https://ai-sdk.dev/cookbook/node/generate-text-with-image-prompt
description: Learn how to generate text with image prompt using the AI SDK and Node
---


# [Generate Text with Image Prompt](#generate-text-with-image-prompt)


Some language models that support vision capabilities accept images as part of the prompt. Here are some of the different [formats](/docs/reference/ai-sdk-core/generate-text#content-image) you can use to include images as input.


## [URL](#url)


```
import{ generateText }from'ai';import{ openai }from'@ai-sdk/openai';const result =awaitgenerateText({  model:openai('gpt-4-turbo'),  maxTokens:512,  messages:[{      role:'user',      content:[{type:'text',          text:'what are the red things in this image?',},{type:'image',          image:newURL('https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2024_Solar_Eclipse_Prominences.jpg/720px-2024_Solar_Eclipse_Prominences.jpg',),},],},],});console.log(result);
```


## [File Buffer](#file-buffer)


```
import{ generateText }from'ai';import{ openai }from'@ai-sdk/openai';importfsfrom'fs';const result =awaitgenerateText({  model:openai('gpt-4-turbo'),  maxTokens:512,  messages:[{      role:'user',      content:[{type:'text',          text:'what are the red things in this image?',},{type:'image',          image: fs.readFileSync('./node/attachments/eclipse.jpg'),},],},],});console.log(result);
```
