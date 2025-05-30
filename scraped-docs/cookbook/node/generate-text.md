# Generate Text


---
url: https://ai-sdk.dev/cookbook/node/generate-text
description: Learn how to generate text using the AI SDK and Node
---


# [Generate Text](#generate-text)


The most basic LLM use case is generating text based on a prompt. For example, you may want to generate a response to a question or summarize a body of text. The `generateText` function can be used to generate text based on the input prompt.

```
import{ generateText }from'ai';import{ openai }from'@ai-sdk/openai';const result =awaitgenerateText({  model:openai('gpt-3.5-turbo'),  prompt:'Why is the sky blue?',});console.log(result);
```
