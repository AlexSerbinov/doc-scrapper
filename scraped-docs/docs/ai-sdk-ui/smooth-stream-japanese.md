# Smooth streaming japanese text


---
url: https://ai-sdk.dev/docs/ai-sdk-ui/smooth-stream-japanese
description: Learn how to stream smooth stream japanese text
---


# [Smooth streaming japanese text](#smooth-streaming-japanese-text)


You can smooth stream japanese text by using the `smoothStream` function, and the following regex that splits either on words of japanese characters:

page.tsx

```
import{ smoothStream }from'ai';import{ useChat }from'@ai-sdk/react';const{ data }=useChat({  experimental_transform:smoothStream({    chunking:/[\u3040-\u309F\u30A0-\u30FF]|\S+\s+/,}),});
```
