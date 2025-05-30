# Providers and Models


---
url: https://ai-sdk.dev/docs/foundations/providers-and-models
description: Learn about the providers and models available in the AI SDK.
---


# [Providers and Models](#providers-and-models)


Companies such as OpenAI and Anthropic (providers) offer access to a range of large language models (LLMs) with differing strengths and capabilities through their own APIs.

Each provider typically has its own unique method for interfacing with their models, complicating the process of switching providers and increasing the risk of vendor lock-in.

To solve these challenges, AI SDK Core offers a standardized approach to interacting with LLMs through a [language model specification](https://github.com/vercel/ai/tree/main/packages/provider/src/language-model/v1) that abstracts differences between providers. This unified interface allows you to switch between providers with ease while using the same API for all providers.

Here is an overview of the AI SDK Provider Architecture:


## [AI SDK Providers](#ai-sdk-providers)


The AI SDK comes with a wide range of providers that you can use to interact with different language models:

-   [xAI Grok Provider](/providers/ai-sdk-providers/xai) (`@ai-sdk/xai`)
-   [OpenAI Provider](/providers/ai-sdk-providers/openai) (`@ai-sdk/openai`)
-   [Azure OpenAI Provider](/providers/ai-sdk-providers/azure) (`@ai-sdk/azure`)
-   [Anthropic Provider](/providers/ai-sdk-providers/anthropic) (`@ai-sdk/anthropic`)
-   [Amazon Bedrock Provider](/providers/ai-sdk-providers/amazon-bedrock) (`@ai-sdk/amazon-bedrock`)
-   [Google Generative AI Provider](/providers/ai-sdk-providers/google-generative-ai) (`@ai-sdk/google`)
-   [Google Vertex Provider](/providers/ai-sdk-providers/google-vertex) (`@ai-sdk/google-vertex`)
-   [Mistral Provider](/providers/ai-sdk-providers/mistral) (`@ai-sdk/mistral`)
-   [Together.ai Provider](/providers/ai-sdk-providers/togetherai) (`@ai-sdk/togetherai`)
-   [Cohere Provider](/providers/ai-sdk-providers/cohere) (`@ai-sdk/cohere`)
-   [Fireworks Provider](/providers/ai-sdk-providers/fireworks) (`@ai-sdk/fireworks`)
-   [DeepInfra Provider](/providers/ai-sdk-providers/deepinfra) (`@ai-sdk/deepinfra`)
-   [DeepSeek Provider](/providers/ai-sdk-providers/deepseek) (`@ai-sdk/deepseek`)
-   [Cerebras Provider](/providers/ai-sdk-providers/cerebras) (`@ai-sdk/cerebras`)
-   [Groq Provider](/providers/ai-sdk-providers/groq) (`@ai-sdk/groq`)
-   [Perplexity Provider](/providers/ai-sdk-providers/perplexity) (`@ai-sdk/perplexity`)
-   [ElevenLabs Provider](/providers/ai-sdk-providers/elevenlabs) (`@ai-sdk/elevenlabs`)
-   [LMNT Provider](/providers/ai-sdk-providers/lmnt) (`@ai-sdk/lmnt`)
-   [Hume Provider](/providers/ai-sdk-providers/hume) (`@ai-sdk/hume`)
-   [Rev.ai Provider](/providers/ai-sdk-providers/revai) (`@ai-sdk/revai`)
-   [Deepgram Provider](/providers/ai-sdk-providers/deepgram) (`@ai-sdk/deepgram`)
-   [Gladia Provider](/providers/ai-sdk-providers/gladia) (`@ai-sdk/gladia`)
-   [AssemblyAI Provider](/providers/ai-sdk-providers/assemblyai) (`@ai-sdk/assemblyai`)

You can also use the [OpenAI Compatible provider](/providers/openai-compatible-providers) with OpenAI-compatible APIs:

-   [LM Studio](/providers/openai-compatible-providers/lmstudio)
-   [Baseten](/providers/openai-compatible-providers/baseten)

Our [language model specification](https://github.com/vercel/ai/tree/main/packages/provider/src/language-model/v1) is published as an open-source package, which you can use to create [custom providers](/providers/community-providers/custom-providers).

The open-source community has created the following providers:

-   [Ollama Provider](/providers/community-providers/ollama) (`ollama-ai-provider`)
-   [ChromeAI Provider](/providers/community-providers/chrome-ai) (`chrome-ai`)
-   [FriendliAI Provider](/providers/community-providers/friendliai) (`@friendliai/ai-provider`)
-   [Portkey Provider](/providers/community-providers/portkey) (`@portkey-ai/vercel-provider`)
-   [Cloudflare Workers AI Provider](/providers/community-providers/cloudflare-workers-ai) (`workers-ai-provider`)
-   [OpenRouter Provider](/providers/community-providers/openrouter) (`@openrouter/ai-sdk-provider`)
-   [Crosshatch Provider](/providers/community-providers/crosshatch) (`@crosshatch/ai-provider`)
-   [Mixedbread Provider](/providers/community-providers/mixedbread) (`mixedbread-ai-provider`)
-   [Voyage AI Provider](/providers/community-providers/voyage-ai) (`voyage-ai-provider`)
-   [Mem0 Provider](/providers/community-providers/mem0)(`@mem0/vercel-ai-provider`)
-   [Letta Provider](/providers/community-providers/letta)(`@letta-ai/vercel-ai-sdk-provider`)
-   [Spark Provider](/providers/community-providers/spark) (`spark-ai-provider`)
-   [AnthropicVertex Provider](/providers/community-providers/anthropic-vertex-ai) (`anthropic-vertex-ai`)
-   [LangDB Provider](/providers/community-providers/langdb) (`@langdb/vercel-provider`)
-   [Dify Provider](/providers/community-providers/dify) (`dify-ai-provider`)
-   [Sarvam Provider](/providers/community-providers/sarvam) (`sarvam-ai-provider`)


## [Self-Hosted Models](#self-hosted-models)


You can access self-hosted models with the following providers:

-   [Ollama Provider](/providers/community-providers/ollama)
-   [LM Studio](/providers/openai-compatible-providers/lmstudio)
-   [Baseten](/providers/openai-compatible-providers/baseten)

Additionally, any self-hosted provider that supports the OpenAI specification can be used with the [OpenAI Compatible Provider](/providers/openai-compatible-providers) .


## [Model Capabilities](#model-capabilities)


The AI providers support different language models with various capabilities. Here are the capabilities of popular models:

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

`o3-mini`

[OpenAI](/providers/ai-sdk-providers/openai)

`o3`

[OpenAI](/providers/ai-sdk-providers/openai)

`o4-mini`

[OpenAI](/providers/ai-sdk-providers/openai)

`o1`

[OpenAI](/providers/ai-sdk-providers/openai)

`o1-mini`

[OpenAI](/providers/ai-sdk-providers/openai)

`o1-preview`

[Anthropic](/providers/ai-sdk-providers/anthropic)

`claude-4-opus-20250514`

[Anthropic](/providers/ai-sdk-providers/anthropic)

`claude-4-sonnet-20250514`

[Anthropic](/providers/ai-sdk-providers/anthropic)

`claude-3-7-sonnet-20250219`

[Anthropic](/providers/ai-sdk-providers/anthropic)

`claude-3-5-sonnet-20241022`

[Anthropic](/providers/ai-sdk-providers/anthropic)

`claude-3-5-sonnet-20240620`

[Anthropic](/providers/ai-sdk-providers/anthropic)

`claude-3-5-haiku-20241022`

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

`llama3.1-70b`

[Cerebras](/providers/ai-sdk-providers/cerebras)

`llama3.3-70b`

[Groq](/providers/ai-sdk-providers/groq)

`meta-llama/llama-4-scout-17b-16e-instruct`

[Groq](/providers/ai-sdk-providers/groq)

`llama-3.3-70b-versatile`

[Groq](/providers/ai-sdk-providers/groq)

`llama-3.1-8b-instant`

[Groq](/providers/ai-sdk-providers/groq)

`mixtral-8x7b-32768`

[Groq](/providers/ai-sdk-providers/groq)

`gemma2-9b-it`

This table is not exhaustive. Additional models can be found in the provider documentation pages and on the provider websites.
