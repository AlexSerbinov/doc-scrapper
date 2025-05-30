# Stream Text with File Prompt


---
url: https://ai-sdk.dev/cookbook/node/stream-text-with-file-prompt
description: Learn how to stream text with file prompt using the AI SDK and Node
---


# [Stream Text with File Prompt](#stream-text-with-file-prompt)


Working with files in AI applications often requires analyzing documents, processing structured data, or extracting information from various file formats. File prompts allow you to send file content directly to the model, enabling tasks like document analysis, data extraction, or generating responses based on file contents.

```
import{ anthropic }from'@ai-sdk/anthropic';import{ streamText }from'ai';import'dotenv/config';importfsfrom'node:fs';asyncfunctionmain(){const result =streamText({    model:anthropic('claude-3-5-sonnet-20241022'),    messages:[{        role:'user',        content:[{type:'text',            text:'What is an embedding model according to this document?',},{type:'file',            data: fs.readFileSync('./data/ai.pdf'),            mimeType:'application/pdf',},],},],});forawait(const textPart of result.textStream){    process.stdout.write(textPart);}}main().catch(console.error);
```
