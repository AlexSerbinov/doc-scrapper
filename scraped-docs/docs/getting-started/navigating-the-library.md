# Navigating the Library


---
url: https://ai-sdk.dev/docs/getting-started/navigating-the-library
description: Learn how to navigate the AI SDK.
---


# [Navigating the Library](#navigating-the-library)


the AI SDK is a powerful toolkit for building AI applications. This page will help you pick the right tools for your requirements.

Let’s start with a quick overview of the AI SDK, which is comprised of three parts:

-   **[AI SDK Core](/docs/ai-sdk-core/overview):** A unified, provider agnostic API for generating text, structured objects, and tool calls with LLMs.
-   **[AI SDK UI](/docs/ai-sdk-ui/overview):** A set of framework-agnostic hooks for building chat and generative user interfaces.
-   [AI SDK RSC](/docs/ai-sdk-rsc/overview): Stream generative user interfaces with React Server Components (RSC). Development is currently experimental and we recommend using [AI SDK UI](/docs/ai-sdk-ui/overview).


## [Choosing the Right Tool for Your Environment](#choosing-the-right-tool-for-your-environment)


When deciding which part of the AI SDK to use, your first consideration should be the environment and existing stack you are working with. Different components of the SDK are tailored to specific frameworks and environments.

Library

Purpose

Environment Compatibility

[AI SDK Core](/docs/ai-sdk-core/overview)

Call any LLM with unified API (e.g. [generateText](/docs/reference/ai-sdk-core/generate-text) and [generateObject](/docs/reference/ai-sdk-core/generate-object))

Any JS environment (e.g. Node.js, Deno, Browser)

[AI SDK UI](/docs/ai-sdk-ui/overview)

Build streaming chat and generative UIs (e.g. [useChat](/docs/reference/ai-sdk-ui/use-chat))

React & Next.js, Vue & Nuxt, Svelte & SvelteKit, Solid.js & SolidStart

[AI SDK RSC](/docs/ai-sdk-rsc/overview)

Stream generative UIs from Server to Client (e.g. [streamUI](/docs/reference/ai-sdk-rsc/stream-ui)). Development is currently experimental and we recommend using [AI SDK UI](/docs/ai-sdk-ui/overview).

Any framework that supports React Server Components (e.g. Next.js)


## [Environment Compatibility](#environment-compatibility)


These tools have been designed to work seamlessly with each other and it's likely that you will be using them together. Let's look at how you could decide which libraries to use based on your application environment, existing stack, and requirements.

The following table outlines AI SDK compatibility based on environment:

Environment

[AI SDK Core](/docs/ai-sdk-core/overview)

[AI SDK UI](/docs/ai-sdk-ui/overview)

[AI SDK RSC](/docs/ai-sdk-rsc/overview)

None / Node.js / Deno

Vue / Nuxt

Svelte / SvelteKit

Solid.js / SolidStart

Next.js Pages Router

Next.js App Router


## [When to use AI SDK UI](#when-to-use-ai-sdk-ui)


AI SDK UI provides a set of framework-agnostic hooks for quickly building **production-ready AI-native applications**. It offers:

-   Full support for streaming chat and client-side generative UI
-   Utilities for handling common AI interaction patterns (i.e. chat, completion, assistant)
-   Production-tested reliability and performance
-   Compatibility across popular frameworks


## [AI SDK UI Framework Compatibility](#ai-sdk-ui-framework-compatibility)


AI SDK UI supports the following frameworks: [React](https://react.dev/), [Svelte](https://svelte.dev/), [Vue.js](https://vuejs.org/), and [SolidJS](https://www.solidjs.com/). Here is a comparison of the supported functions across these frameworks:

Function

React

Svelte

Vue.js

SolidJS

[useChat](/docs/reference/ai-sdk-ui/use-chat)

[useChat](/docs/reference/ai-sdk-ui/use-chat) tool calling

[useCompletion](/docs/reference/ai-sdk-ui/use-completion)

[useObject](/docs/reference/ai-sdk-ui/use-object)

[useAssistant](/docs/reference/ai-sdk-ui/use-assistant)

[Contributions](https://github.com/vercel/ai/blob/main/CONTRIBUTING.md) are welcome to implement missing features for non-React frameworks.


## [When to use AI SDK RSC](#when-to-use-ai-sdk-rsc)


AI SDK RSC is currently experimental. We recommend using [AI SDK UI](/docs/ai-sdk-ui/overview) for production. For guidance on migrating from RSC to UI, see our [migration guide](/docs/ai-sdk-rsc/migrating-to-ui).

[React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) (RSCs) provide a new approach to building React applications that allow components to render on the server, fetch data directly, and stream the results to the client, reducing bundle size and improving performance. They also introduce a new way to call server-side functions from anywhere in your application called [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations).

AI SDK RSC provides a number of utilities that allow you to stream values and UI directly from the server to the client. However, **it's important to be aware of current limitations**:

-   **Cancellation**: currently, it is not possible to abort a stream using Server Actions. This will be improved in future releases of React and Next.js.
-   **Increased Data Transfer**: using [`createStreamableUI`](/docs/reference/ai-sdk-rsc/create-streamable-ui) can lead to quadratic data transfer (quadratic to the length of generated text). You can avoid this using [`createStreamableValue`](/docs/reference/ai-sdk-rsc/create-streamable-value) instead, and rendering the component client-side.
-   **Re-mounting Issue During Streaming**: when using `createStreamableUI`, components re-mount on `.done()`, causing [flickering](https://github.com/vercel/ai/issues/2232).

Given these limitations, **we recommend using [AI SDK UI](/docs/ai-sdk-ui/overview) for production applications**.
