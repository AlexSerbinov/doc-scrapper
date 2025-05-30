# AI SDK


---
url: https://ai-sdk.dev/docs/introduction
description: The AI SDK is the TypeScript toolkit for building AI applications and agents with React, Next.js, Vue, Svelte, Node.js, and more.
---


# [AI SDK](#ai-sdk)


The AI SDK is the TypeScript toolkit designed to help developers build AI-powered applications and agents with React, Next.js, Vue, Svelte, Node.js, and more.


## [Why use the AI SDK?](#why-use-the-ai-sdk)


Integrating large language models (LLMs) into applications is complicated and heavily dependent on the specific model provider you use.

The AI SDK standardizes integrating artificial intelligence (AI) models across [supported providers](/docs/foundations/providers-and-models). This enables developers to focus on building great AI applications, not waste time on technical details.

For example, here’s how you can generate text with various models using the AI SDK:

xAI

OpenAI

Anthropic

Google

Custom

import { generateText } from "ai"

import { xai } from "@ai-sdk/xai"

const { text } = await generateText({

model: xai("grok-3-beta"),

prompt: "What is love?"

})

Love is a universal emotion that is characterized by feelings of affection, attachment, and warmth towards someone or something. It is a complex and multifaceted experience that can take many different forms, including romantic love, familial love, platonic love, and self-love.

The AI SDK has two main libraries:

-   **[AI SDK Core](/docs/ai-sdk-core):** A unified API for generating text, structured objects, tool calls, and building agents with LLMs.
-   **[AI SDK UI](/docs/ai-sdk-ui):** A set of framework-agnostic hooks for quickly building chat and generative user interface.


## [Model Providers](#model-providers)


The AI SDK supports [multiple model providers](/providers).

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


## [Templates](#templates)


We've built some [templates](https://vercel.com/templates?type=ai) that include AI SDK integrations for different use cases, providers, and frameworks. You can use these templates to get started with your AI-powered application.


### [Starter Kits](#starter-kits)


[

Chatbot Starter Template

Uses the AI SDK and Next.js. Features persistence, multi-modal chat, and more.

](https://vercel.com/templates/next.js/nextjs-ai-chatbot)[

Internal Knowledge Base (RAG)

Uses AI SDK Language Model Middleware for RAG and enforcing guardrails.

](https://vercel.com/templates/next.js/ai-sdk-internal-knowledge-base)[

Multi-Modal Chat

Uses Next.js and AI SDK useChat hook for multi-modal message chat interface.

](https://vercel.com/templates/next.js/multi-modal-chatbot)[

Semantic Image Search

An AI semantic image search app template built with Next.js, AI SDK, and Postgres.

](https://vercel.com/templates/next.js/semantic-image-search)[

Natural Language PostgreSQL

Query PostgreSQL using natural language with AI SDK and GPT-4o.

](https://vercel.com/templates/next.js/natural-language-postgres)


### [Feature Exploration](#feature-exploration)


[

Feature Flags Example

AI SDK with Next.js, Feature Flags, and Edge Config for dynamic model switching.

](https://vercel.com/templates/next.js/ai-sdk-feature-flags-edge-config)[

Chatbot with Telemetry

AI SDK chatbot with OpenTelemetry support.

](https://vercel.com/templates/next.js/ai-chatbot-telemetry)[

Structured Object Streaming

Uses AI SDK useObject hook to stream structured object generation.

](https://vercel.com/templates/next.js/use-object)[

Multi-Step Tools

Uses AI SDK streamText function to handle multiple tool steps automatically.

](https://vercel.com/templates/next.js/ai-sdk-roundtrips)


### [Frameworks](#frameworks)


[

Next.js OpenAI Starter

Uses OpenAI GPT-4, AI SDK, and Next.js.

](https://github.com/vercel/ai/tree/main/examples/next-openai)[

Nuxt OpenAI Starter

Uses OpenAI GPT-4, AI SDK, and Nuxt.js.

](https://github.com/vercel/ai/tree/main/examples/nuxt-openai)[

SvelteKit OpenAI Starter

Uses OpenAI GPT-4, AI SDK, and SvelteKit.

](https://github.com/vercel/ai/tree/main/examples/sveltekit-openai)[

Solid OpenAI Starter

Uses OpenAI GPT-4, AI SDK, and Solid.

](https://github.com/vercel/ai/tree/main/examples/solidstart-openai)


### [Generative UI](#generative-ui)


[

Gemini Chatbot

Uses Google Gemini, AI SDK, and Next.js.

](https://vercel.com/templates/next.js/gemini-ai-chatbot)[

Generative UI with RSC (experimental)

Uses Next.js, AI SDK, and streamUI to create generative UIs with React Server Components.

](https://vercel.com/templates/next.js/rsc-genui)


### [Security](#security)


[

Bot Protection

Uses Kasada, OpenAI GPT-4, AI SDK, and Next.js.

](https://vercel.com/templates/next.js/advanced-ai-bot-protection)[

Rate Limiting

Uses Vercel KV, OpenAI GPT-4, AI SDK, and Next.js.

](https://github.com/vercel/ai/tree/main/examples/next-openai-upstash-rate-limits)


## [Join our Community](#join-our-community)


If you have questions about anything related to the AI SDK, you're always welcome to ask our community on [GitHub Discussions](https://github.com/vercel/ai/discussions).


## [`llms.txt` (for Cursor, Windsurf, Copilot, Claude etc.)](#llmstxt-for-cursor-windsurf-copilot-claude-etc)


You can access the entire AI SDK documentation in Markdown format at [ai-sdk.dev/llms.txt](/llms.txt). This can be used to ask any LLM (assuming it has a big enough context window) questions about the AI SDK based on the most up-to-date documentation.


### [Example Usage](#example-usage)


For instance, to prompt an LLM with questions about the AI SDK:

1.  Copy the documentation contents from [ai-sdk.dev/llms.txt](/llms.txt)
2.  Use the following prompt format:

```
Documentation:{paste documentation here}---Based on the above documentation, answer the following:{your question}
```
