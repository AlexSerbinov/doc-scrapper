# AI SDK Providers


---
url: https://ai-sdk.dev/providers/ai-sdk-providers
description: Learn how to use AI SDK providers.
---


# [AI SDK Providers](#ai-sdk-providers)


The AI SDK comes with several providers that you can use to interact with different language models:

[

xAI Grok

Image InputImage GenerationObject GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/xai)[

OpenAI

Image InputImage GenerationObject GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/openai)[

Azure

Image InputObject GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/azure)[

Anthropic

Image InputObject GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/anthropic)[

Amazon Bedrock

Image InputImage GenerationObject GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/amazon-bedrock)[

Groq

Object GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/groq)[

Fal AI

Image Generation

](/providers/ai-sdk-providers/fal)[

DeepInfra

Image InputObject GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/deepinfra)[

Google Generative AI

Image InputObject GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/google-generative-ai)[

Google Vertex AI

Image InputImage GenerationObject GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/google-vertex)[

Mistral

Image InputObject GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/mistral)[

Together.ai

Object GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/togetherai)[

Cohere

Tool UsageTool Streaming

](/providers/ai-sdk-providers/cohere)[

Fireworks

Image GenerationObject GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/fireworks)[

DeepSeek

Object GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/deepseek)[

Cerebras

Object GenerationTool UsageTool Streaming

](/providers/ai-sdk-providers/cerebras)[

Perplexity

](/providers/ai-sdk-providers/perplexity)[

Luma AI

Image Generation

](/providers/ai-sdk-providers/luma)

There are also [community providers](./community-providers) that have been created using the [Language Model Specification](./community-providers/custom-providers).

[

LLamaCpp

Provider Dependent

](/providers/community-providers/llama-cpp)[

Ollama

Provider Dependent

](/providers/community-providers/ollama)[

Chrome AI

Provider Dependent

](/providers/community-providers/chrome-ai)[

Anthropic Vertex

Provider Dependent

](/providers/community-providers/anthropic-vertex-ai)[

Portkey

Provider Dependent

](/providers/community-providers/portkey)[

Cloudflare Workers AI

Provider Dependent

](/providers/community-providers/cloudflare-workers-ai)[

Write your own

Provider Dependent

](/providers/community-providers/custom-providers)


## [Provider support](#provider-support)


Not all providers support all AI SDK features. Here's a quick comparison of the capabilities of popular models:

Provider

Model

Image Input

Object Generation

Tool Usage

Tool Streaming

[xAI Grok](/providers/ai-sdk-providers/xai)

`grok-3`

[xAI Grok](/providers/ai-sdk-providers/xai)

`grok-3-fast`

[xAI Grok](/providers/ai-sdk-providers/xai)

`grok-3-mini`

[xAI Grok](/providers/ai-sdk-providers/xai)

`grok-3-mini-fast`

[xAI Grok](/providers/ai-sdk-providers/xai)

`grok-2-1212`

[xAI Grok](/providers/ai-sdk-providers/xai)

`grok-2-vision-1212`

[xAI Grok](/providers/ai-sdk-providers/xai)

`grok-beta`

[xAI Grok](/providers/ai-sdk-providers/xai)

`grok-vision-beta`

[Vercel](/providers/ai-sdk-providers/vercel)

`v0-1.0-md`

[OpenAI](/providers/ai-sdk-providers/openai)

`gpt-4.1`

[OpenAI](/providers/ai-sdk-providers/openai)

`gpt-4.1-mini`

[OpenAI](/providers/ai-sdk-providers/openai)

`gpt-4.1-nano`

[OpenAI](/providers/ai-sdk-providers/openai)

`gpt-4o`

[OpenAI](/providers/ai-sdk-providers/openai)

`gpt-4o-mini`

[OpenAI](/providers/ai-sdk-providers/openai)

`gpt-4-turbo`

[OpenAI](/providers/ai-sdk-providers/openai)

`gpt-4`

[OpenAI](/providers/ai-sdk-providers/openai)

`o1`

[OpenAI](/providers/ai-sdk-providers/openai)

`o1-mini`

[OpenAI](/providers/ai-sdk-providers/openai)

`o1-preview`

[Anthropic](/providers/ai-sdk-providers/anthropic)

`claude-3-7-sonnet-20250219`

[Anthropic](/providers/ai-sdk-providers/anthropic)

`claude-3-5-sonnet-20241022`

[Anthropic](/providers/ai-sdk-providers/anthropic)

`claude-3-5-sonnet-20240620`

[Anthropic](/providers/ai-sdk-providers/anthropic)

`claude-3-5-haiku-20241022`

[Groq](/providers/ai-sdk-providers/groq)

`meta-llama/llama-4-scout-17b-16e-instruct`

[Groq](/providers/ai-sdk-providers/groq)

`deepseek-r1-distill-llama-70b`

[Groq](/providers/ai-sdk-providers/groq)

`llama-3.3-70b-versatile`

[Groq](/providers/ai-sdk-providers/groq)

`llama-3.1-8b-instant`

[Groq](/providers/ai-sdk-providers/groq)

`mistral-saba-24b`

[Groq](/providers/ai-sdk-providers/groq)

`qwen-qwq-32b`

[Groq](/providers/ai-sdk-providers/groq)

`mixtral-8x7b-32768`

[Groq](/providers/ai-sdk-providers/groq)

`gemma2-9b-it`

[DeepInfra](/providers/ai-sdk-providers/deepinfra)

`meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8`

[DeepInfra](/providers/ai-sdk-providers/deepinfra)

`meta-llama/Llama-4-Scout-17B-16E-Instruct`

[DeepInfra](/providers/ai-sdk-providers/deepinfra)

`meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo`

[DeepInfra](/providers/ai-sdk-providers/deepinfra)

`meta-llama/Llama-3.3-70B-Instruct`

[DeepInfra](/providers/ai-sdk-providers/deepinfra)

`deepseek-ai/DeepSeek-V3`

[DeepInfra](/providers/ai-sdk-providers/deepinfra)

`deepseek-ai/DeepSeek-R1`

[DeepInfra](/providers/ai-sdk-providers/deepinfra)

`deepseek-ai/DeepSeek-R1-Distill-Llama-70B`

[DeepInfra](/providers/ai-sdk-providers/deepinfra)

`deepseek-ai/DeepSeek-R1-Turbo`

[Mistral](/providers/ai-sdk-providers/mistral)

`pixtral-large-latest`

[Mistral](/providers/ai-sdk-providers/mistral)

`mistral-large-latest`

[Mistral](/providers/ai-sdk-providers/mistral)

`mistral-small-latest`

[Mistral](/providers/ai-sdk-providers/mistral)

`pixtral-12b-2409`

[Google Generative AI](/providers/ai-sdk-providers/google-generative-ai)

`gemini-2.0-flash-exp`

[Google Generative AI](/providers/ai-sdk-providers/google-generative-ai)

`gemini-1.5-flash`

[Google Generative AI](/providers/ai-sdk-providers/google-generative-ai)

`gemini-1.5-pro`

[Google Vertex](/providers/ai-sdk-providers/google-vertex)

`gemini-2.0-flash-exp`

[Google Vertex](/providers/ai-sdk-providers/google-vertex)

`gemini-1.5-flash`

[Google Vertex](/providers/ai-sdk-providers/google-vertex)

`gemini-1.5-pro`

[DeepSeek](/providers/ai-sdk-providers/deepseek)

`deepseek-chat`

[DeepSeek](/providers/ai-sdk-providers/deepseek)

`deepseek-reasoner`

[Cerebras](/providers/ai-sdk-providers/cerebras)

`llama3.1-8b`

[Cerebras](/providers/ai-sdk-providers/cerebras)

`llama3.3-70b`

This table is not exhaustive. Additional models can be found in the provider documentation pages and on the provider websites.
