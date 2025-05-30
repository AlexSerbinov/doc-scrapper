# Weave Observability


---
url: https://ai-sdk.dev/providers/observability/weave
description: Monitor and evaluate LLM applications with Weave.
---


# [Weave Observability](#weave-observability)


[Weave](https://wandb.ai/site/weave) is a toolkit built by [Weights & Biases](https://wandb.ai/site/) for tracking, experimenting with, evaluating, deploying, and improving LLM-based applications.

After integrating with the AI SDK, you can use Weave to view and interact with trace information for your AI SDK application including prompts, responses, flow, cost and more.


## [Setup](#setup)


To set up Weave as an [OpenTelemetry](https://opentelemetry.io/docs/) backend, you'll need to route the traces to Weave's OpenTelemetry endpoint, set your API key, and specify a team and project. In order to log your traces to Weave, you must you must have a [Weights & Biases account](https://wandb.ai/site/weave).


### [Authentication](#authentication)


First, go to [wandb.ai/authorize](https://wandb.ai/authorize), copy your API key and generate a base64-encoded authorization string by running:

```
echo -n "api:<YOUR_API_KEY>"| base64
```

Note the output. You'll use it in your environment configuration.


### [Project Configuration](#project-configuration)


Your W&B project ID identifies where your telemetry data will be logged. It follows the format `<YOUR_TEAM_NAME>/<YOUR_PROJECT_NAME>`.

1.  Navigate to the [Weights & Biases dashboard](https://wandb.ai/home).
2.  In the **Teams** section, select or create a team.
3.  Select an existing project or create a new one.
4.  Note `<YOUR_TEAM_NAME>/<YOUR_PROJECT_NAME>` for the next step.


### [Next.js](#nextjs)


In your Next.js app’s `.env` file, set the OTEL environment variables. Replace `<BASE64_AUTH_STRING>` and `<YOUR_TEAM_NAME>/<YOUR_PROJECT_NAME>` with your values from the previous steps:

```
OTEL_EXPORTER_OTLP_ENDPOINT="https://trace.wandb.ai/otel/v1/traces"OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic <BASE64_AUTH_STRING>,project_id=<YOUR_TEAM_NAME>/<YOUR_PROJECT_NAME>"
```

You can then use the `experimental_telemetry` option to enable telemetry on supported AI SDK function calls:

```
import{ openai }from'@ai-sdk/openai';import{ generateText }from'ai';const result =awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'What is 2 + 2?',  experimental_telemetry:{    isEnabled:true,    metadata:{      query:'math',      difficulty:'easy',},},});
```


## [Resources](#resources)


-   [Weave Documentation](https://weave-docs.wandb.ai)
-   [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
-   [AI SDK Telemetry Guide](/docs/ai-sdk-core/telemetry)
