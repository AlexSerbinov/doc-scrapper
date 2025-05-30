# Smooth streaming chinese text


---
url: https://ai-sdk.dev/docs/ai-sdk-ui/smooth-stream-chinese
description: Learn how to stream smooth stream chinese text
---


# [Smooth streaming chinese text](#smooth-streaming-chinese-text)


You can smooth stream chinese text by using the `smoothStream` function, and the following regex that splits either on words of chinese characters:

page.tsx

```
import{ smoothStream }from'ai';import{ useChat }from'@ai-sdk/react';const{ data }=useChat({  experimental_transform:smoothStream({    chunking:/[\u4E00-\u9FFF]|\S+\s+/,}),});
```
