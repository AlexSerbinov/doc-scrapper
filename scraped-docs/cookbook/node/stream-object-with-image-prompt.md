# Stream Object with Image Prompt


---
url: https://ai-sdk.dev/cookbook/node/stream-object-with-image-prompt
description: Learn how to stream structured data with an image prompt using the AI SDK and Node
---


# [Stream Object with Image Prompt](#stream-object-with-image-prompt)


Some language models that support vision capabilities accept images as part of the prompt. Here are some of the different [formats](/docs/reference/ai-sdk-core/generate-text#content-image) you can use to include images as input.


## [URL](#url)


```
import{ streamObject }from'ai';import{ openai }from'@ai-sdk/openai';importdotenvfrom'dotenv';import{ z }from'zod';dotenv.config();asyncfunctionmain(){const{ partialObjectStream }=streamObject({    model:openai('gpt-4-turbo'),    maxTokens:512,    schema: z.object({      stamps: z.array(        z.object({          country: z.string(),          date: z.string(),}),),}),    messages:[{        role:'user',        content:[{type:'text',            text:'list all the stamps in these passport pages?',},{type:'image',            image:newURL('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/WW2_Spanish_official_passport.jpg/1498px-WW2_Spanish_official_passport.jpg',),},],},],});forawait(const partialObject of partialObjectStream){console.clear();console.log(partialObject);}}main();
```


## [File Buffer](#file-buffer)


```
import{ streamObject }from'ai';import{ openai }from'@ai-sdk/openai';importdotenvfrom'dotenv';import{ z }from'zod';dotenv.config();asyncfunctionmain(){const{ partialObjectStream }=streamObject({    model:openai('gpt-4-turbo'),    maxTokens:512,    schema: z.object({      stamps: z.array(        z.object({          country: z.string(),          date: z.string(),}),),}),    messages:[{        role:'user',        content:[{type:'text',            text:'list all the stamps in these passport pages?',},{type:'image',            image: fs.readFileSync('./node/attachments/eclipse.jpg'),},],},],});forawait(const partialObject of partialObjectStream){console.clear();console.log(partialObject);}}main();
```
