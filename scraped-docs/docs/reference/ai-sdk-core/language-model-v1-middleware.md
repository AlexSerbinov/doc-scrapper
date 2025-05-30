# LanguageModelV1Middleware


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/language-model-v1-middleware
description: Middleware for enhancing language model behavior (API Reference)
---


# [`LanguageModelV1Middleware`](#languagemodelv1middleware)


Language model middleware is an experimental feature.

Language model middleware provides a way to enhance the behavior of language models by intercepting and modifying the calls to the language model. It can be used to add features like guardrails, RAG, caching, and logging in a language model agnostic way.

See [Language Model Middleware](/docs/ai-sdk-core/middleware) for more information.


## [Import](#import)


import { LanguageModelV1Middleware } from "ai"


## [API Signature](#api-signature)



### transformParams:


({ type: "generate" | "stream", params: LanguageModelV1CallOptions }) => Promise<LanguageModelV1CallOptions>

Transforms the parameters before they are passed to the language model.


### wrapGenerate:


({ doGenerate: DoGenerateFunction, params: LanguageModelV1CallOptions, model: LanguageModelV1 }) => Promise<DoGenerateResult>

Wraps the generate operation of the language model.


### wrapStream:


({ doStream: DoStreamFunction, params: LanguageModelV1CallOptions, model: LanguageModelV1 }) => Promise<DoStreamResult>

Wraps the stream operation of the language model.
