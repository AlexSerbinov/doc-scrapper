# Traceloop


---
url: https://ai-sdk.dev/providers/observability/traceloop
description: Monitoring and evaluating LLM applications with Traceloop
---


# [Traceloop](#traceloop)


[Traceloop](https://www.traceloop.com/) is a development platform for building reliable AI applications. After integrating with the AI SDK, you can use Traceloop to trace, monitor, and experiment with LLM providers, prompts and flows.


## [Setup](#setup)


Traceloop supports [AI SDK telemetry data](/docs/ai-sdk-core/telemetry) through [OpenTelemetry](https://opentelemetry.io/docs/). You'll need to sign up at [https://app.traceloop.com](https://app.traceloop.com) and get an API Key.


### [Next.js](#nextjs)


To use the AI SDK to send telemetry data to Traceloop, set these environment variables in your Next.js app's `.env` file:

```
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.traceloop.comOTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer <Your API Key>"
```

You can then use the `experimental_telemetry` option to enable telemetry on supported AI SDK function calls:

```
import{ openai }from'@ai-sdk/openai';import{ generateText }from'ai';const result =awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'What is 2 + 2?',  experimental_telemetry:{    isEnabled:true,    metadata:{      query:'weather',location:'San Francisco',},},});
```


## [Resources](#resources)


-   [Traceloop demo chatbot](https://www.traceloop.com/docs/demo)
-   [Traceloop docs](https://www.traceloop.com/docs)
