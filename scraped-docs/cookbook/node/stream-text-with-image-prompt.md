# Stream Text with Image Prompt


---
url: https://ai-sdk.dev/cookbook/node/stream-text-with-image-prompt
description: Learn how to stream text with image prompt using the AI SDK and Node
---


# [Stream Text with Image Prompt](#stream-text-with-image-prompt)


Vision-language models can analyze images alongside text prompts to generate responses about visual content. This multimodal approach allows for rich interactions where you can ask questions about images, request descriptions, or analyze visual details. The combination of image and text inputs enables more sophisticated AI applications like visual question answering and image analysis.

```
import{ anthropic }from'@ai-sdk/anthropic';import{ streamText }from'ai';import'dotenv/config';importfsfrom'node:fs';asyncfunctionmain(){const result =streamText({    model:anthropic('claude-3-5-sonnet-20240620'),    messages:[{        role:'user',        content:[{type:'text', text:'Describe the image in detail.'},{type:'image', image: fs.readFileSync('./data/comic-cat.png')},],},],});forawait(const textPart of result.textStream){    process.stdout.write(textPart);}}main().catch(console.error);
```
