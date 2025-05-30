# NVIDIA NIM Provider


---
url: https://ai-sdk.dev/providers/openai-compatible-providers/nim
description: Use NVIDIA NIM OpenAI compatible API with the AI SDK.
---


# [NVIDIA NIM Provider](#nvidia-nim-provider)


[NVIDIA NIM](https://www.nvidia.com/en-us/ai/) provides optimized inference microservices for deploying foundation models. It offers an OpenAI-compatible API that you can use with the AI SDK.


## [Setup](#setup)


The NVIDIA NIM provider is available via the `@ai-sdk/openai-compatible` module as it is compatible with the OpenAI API. You can install it with:

pnpm

npm

yarn

pnpm add @ai-sdk/openai-compatible


## [Provider Instance](#provider-instance)


To use NVIDIA NIM, you can create a custom provider instance with the `createOpenAICompatible` function from `@ai-sdk/openai-compatible`:

```
import{ createOpenAICompatible }from'@ai-sdk/openai-compatible';const nim =createOpenAICompatible({  name:'nim',  baseURL:'https://integrate.api.nvidia.com/v1',  headers:{Authorization:`Bearer ${process.env.NIM_API_KEY}`,},});
```

You can obtain an API key and free credits by registering at [NVIDIA Build](https://build.nvidia.com/explore/discover). New users receive 1,000 inference credits to get started.


## [Language Models](#language-models)


You can interact with NIM models using a provider instance. For example, to use [DeepSeek-R1](https://build.nvidia.com/deepseek-ai/deepseek-r1), a powerful open-source language model:

```
const model = nim.chatModel('deepseek-ai/deepseek-r1');
```


### [Example - Generate Text](#example---generate-text)


You can use NIM language models to generate text with the `generateText` function:

```
import{ createOpenAICompatible }from'@ai-sdk/openai-compatible';import{ generateText }from'ai';const nim =createOpenAICompatible({  name:'nim',  baseURL:'https://integrate.api.nvidia.com/v1',  headers:{Authorization:`Bearer ${process.env.NIM_API_KEY}`,},});const{ text, usage, finishReason }=awaitgenerateText({  model: nim.chatModel('deepseek-ai/deepseek-r1'),  prompt:'Tell me the history of the San Francisco Mission-style burrito.',});console.log(text);console.log('Token usage:', usage);console.log('Finish reason:', finishReason);
```


### [Example - Stream Text](#example---stream-text)


NIM language models can also generate text in a streaming fashion with the `streamText` function:

```
import{ createOpenAICompatible }from'@ai-sdk/openai-compatible';import{ streamText }from'ai';const nim =createOpenAICompatible({  name:'nim',  baseURL:'https://integrate.api.nvidia.com/v1',  headers:{Authorization:`Bearer ${process.env.NIM_API_KEY}`,},});const result =streamText({  model: nim.chatModel('deepseek-ai/deepseek-r1'),  prompt:'Tell me the history of the Northern White Rhino.',});forawait(const textPart of result.textStream){  process.stdout.write(textPart);}console.log();console.log('Token usage:',await result.usage);console.log('Finish reason:',await result.finishReason);
```

NIM language models can also be used with other AI SDK functions like `generateObject` and `streamObject`.

Model support for tool calls and structured object generation varies. For example, the [`meta/llama-3.3-70b-instruct`](https://build.nvidia.com/meta/llama-3_3-70b-instruct) model supports object generation capabilities. Check each model's documentation on NVIDIA Build for specific supported features.
