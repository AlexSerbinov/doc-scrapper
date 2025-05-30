# LangWatch Observability


---
url: https://ai-sdk.dev/providers/observability/langwatch
description: Track, monitor, guardrail and evaluate your AI SDK applications with LangWatch.
---


# [LangWatch Observability](#langwatch-observability)


[LangWatch](https://langwatch.ai/) ([GitHub](https://github.com/langwatch/langwatch)) is an LLM Ops platform for monitoring, experimenting, measuring and improving LLM pipelines, with a fair-code distribution model.


## [Setup](#setup)


Obtain your `LANGWATCH_API_KEY` from the [LangWatch dashboard](https://app.langwatch.com/).

pnpm

npm

yarn

pnpm add langwatch

Ensure `LANGWATCH_API_KEY` is set:

Environment variables

Client parameters

.env

```
LANGWATCH_API_KEY='your_api_key_here'
```


## [Basic Concepts](#basic-concepts)


-   Each message triggering your LLM pipeline as a whole is captured with a [Trace](https://docs.langwatch.ai/concepts#traces).
-   A [Trace](https://docs.langwatch.ai/concepts#traces) contains multiple [Spans](https://docs.langwatch.ai/concepts#spans), which are the steps inside your pipeline.
    -   A span can be an LLM call, a database query for a RAG retrieval, or a simple function transformation.
    -   Different types of [Spans](https://docs.langwatch.ai/concepts#spans) capture different parameters.
    -   [Spans](https://docs.langwatch.ai/concepts#spans) can be nested to capture the pipeline structure.
-   [Traces](https://docs.langwatch.ai/concepts#traces) can be grouped together on LangWatch Dashboard by having the same [`thread_id`](https://docs.langwatch.ai/concepts#threads) in their metadata, making the individual messages become part of a conversation.
    -   It is also recommended to provide the [`user_id`](https://docs.langwatch.ai/concepts#user-id) metadata to track user analytics.


## [Configuration](#configuration)


The AI SDK supports tracing via Next.js OpenTelemetry integration. By using the `LangWatchExporter`, you can automatically collect those traces to LangWatch.

First, you need to install the necessary dependencies:

```
npminstall @vercel/otel langwatch @opentelemetry/api-logs @opentelemetry/instrumentation @opentelemetry/sdk-logs
```

Then, set up the OpenTelemetry for your application, follow one of the tabs below depending whether you are using AI SDK with Next.js or on Node.js:

Next.js

Node.js

You need to enable the `instrumentationHook` in your `next.config.js` file if you haven't already:

```
/** @type {import('next').NextConfig} */const nextConfig ={  experimental:{    instrumentationHook:true,},};module.exports= nextConfig;
```

Next, you need to create a file named `instrumentation.ts` (or `.js`) in the **root directory** of the project (or inside `src` folder if using one), with `LangWatchExporter` as the traceExporter:

```
import{ registerOTel }from'@vercel/otel';import{LangWatchExporter}from'langwatch';exportfunctionregister(){registerOTel({    serviceName:'next-app',    traceExporter:newLangWatchExporter(),});}
```

(Read more about Next.js OpenTelemetry configuration [on the official guide](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration))

Finally, enable `experimental_telemetry` tracking on the AI SDK calls you want to trace:

```
const result =awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'Explain why a chicken would make a terrible astronaut, be creative and humorous about it.',  experimental_telemetry:{    isEnabled:true,// optional metadata    metadata:{      userId:'myuser-123',      threadId:'mythread-123',},},});
```

That's it! Your messages will now be visible on LangWatch:


### [Example Project](#example-project)


You can find a full example project with a more complex pipeline and AI SDK and LangWatch integration [on our GitHub](https://github.com/langwatch/langwatch/blob/main/typescript-sdk/example/lib/chat/vercel-ai.tsx).


### [Manual Integration](#manual-integration)


The docs from here below are for manual integration, in case you are not using the AI SDK OpenTelemetry integration, you can manually start a trace to capture your messages:

```
import{LangWatch}from'langwatch';const langwatch =newLangWatch();const trace = langwatch.getTrace({  metadata:{ threadId:'mythread-123', userId:'myuser-123'},});
```

Then, you can start an LLM span inside the trace with the input about to be sent to the LLM.

```
const span = trace.startLLMSpan({  name:'llm',  model: model,  input:{type:'chat_messages',    value: messages,},});
```

This will capture the LLM input and register the time the call started. Once the LLM call is done, end the span to get the finish timestamp to be registered, and capture the output and the token metrics, which will be used for cost calculation, e.g.:

```
span.end({  output:{type:'chat_messages',    value:[chatCompletion.choices[0]!.message],},  metrics:{    promptTokens: chatCompletion.usage?.prompt_tokens,    completionTokens: chatCompletion.usage?.completion_tokens,},});
```


## [Resources](#resources)


For more information and examples, you can read more below:

-   [LangWatch documentation](https://docs.langwatch.ai/)
-   [LangWatch GitHub](https://github.com/langwatch/langwatch)


## [Support](#support)


If you have questions or need help, join our community:

-   [LangWatch Discord](https://discord.gg/kT4PhDS2gH)
-   [Email support](mailto:support@langwatch.ai)
