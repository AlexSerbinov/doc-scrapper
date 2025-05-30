# Helicone Observability


---
url: https://ai-sdk.dev/providers/observability/helicone
description: Monitor and optimize your AI SDK applications with minimal configuration using Helicone
---


# [Helicone Observability](#helicone-observability)


[Helicone](https://helicone.ai) is an open-source LLM observability platform that helps you monitor, analyze, and optimize your AI applications through a proxy-based approach, requiring minimal setup and zero additional dependencies.


## [Setup](#setup)


Setting up Helicone:

1.  Create a Helicone account at [helicone.ai](https://helicone.ai)

2.  Set your API key as an environment variable:

    .env

    ```
    HELICONE_API_KEY=your-helicone-api-key
    ```

3.  Update your model provider configuration to use Helicone's proxy:

    ```
    import{ createOpenAI }from'@ai-sdk/openai';const openai =createOpenAI({  baseURL:'https://oai.helicone.ai/v1',  headers:{'Helicone-Auth':`Bearer ${process.env.HELICONE_API_KEY}`,},});// Use normally with AI SDKconst response =awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'Hello world',});
    ```


That's it! Your requests are now being logged and monitored through Helicone.

[→ Learn more about getting started with Helicone on AI SDK](https://docs.helicone.ai/getting-started/integration-method/vercelai)


## [Integration Approach](#integration-approach)


While other observability solutions require OpenTelemetry instrumentation, Helicone uses a simple proxy approach:

Helicone Proxy (3 lines)

Typical OTEL Setup (simplified)

```
const openai =createOpenAI({  baseURL:"https://oai.helicone.ai/v1",  headers:{"Helicone-Auth":`Bearer ${process.env.HELICONE_API_KEY}`},});
```

**Characteristics of Helicone's Proxy Approach:**

-   No additional packages required
-   Compatible with JavaScript environments
-   Minimal code changes to existing implementations
-   Supports features such as caching and rate limiting

[→ Learn more about Helicone's proxy approach](https://docs.helicone.ai/references/proxy-vs-async)


## [Core Features](#core-features)



### [User Tracking](#user-tracking)


Monitor how individual users interact with your AI application:

```
const response =awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'Hello world',  headers:{'Helicone-User-Id':'user@example.com',},});
```

[→ Learn more about User Metrics](https://docs.helicone.ai/features/advanced-usage/user-metrics)


### [Custom Properties](#custom-properties)


Add structured metadata to filter and analyze requests:

```
const response =awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'Translate this text to French',  headers:{'Helicone-Property-Feature':'translation','Helicone-Property-Source':'mobile-app','Helicone-Property-Language':'French',},});
```

[→ Learn more about Custom Properties](https://docs.helicone.ai/features/advanced-usage/custom-properties)


### [Session Tracking](#session-tracking)


Group related requests into coherent conversations:

```
const response =awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'Tell me more about that',  headers:{'Helicone-Session-Id':'convo-123','Helicone-Session-Name':'Travel Planning','Helicone-Session-Path':'/chats/travel',},});
```

[→ Learn more about Sessions](https://docs.helicone.ai/features/sessions)


## [Advanced Configuration](#advanced-configuration)



### [Request Caching](#request-caching)


Reduce costs by caching identical requests:

```
const response =awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'What is the capital of France?',  headers:{'Helicone-Cache-Enabled':'true',},});
```

[→ Learn more about Caching](https://docs.helicone.ai/features/advanced-usage/caching)


### [Rate Limiting](#rate-limiting)


Control usage by adding a rate limit policy:

```
const response =awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'Generate creative content',  headers:{// Allow 10,000 requests per hour'Helicone-RateLimit-Policy':'10000;w=3600',// Optional: limit by user'Helicone-User-Id':'user@example.com',},});
```

Format: `[quota];w=[time_window];u=[unit];s=[segment]` where:

-   `quota`: Maximum requests allowed in the time window
-   `w`: Time window in seconds (minimum 60s)
-   `u`: Optional unit - "request" (default) or "cents"
-   `s`: Optional segment - "user", custom property, or global (default)

[→ Learn more about Rate Limiting](https://docs.helicone.ai/features/advanced-usage/custom-rate-limits)


### [LLM Security](#llm-security)


Protect against prompt injection, jailbreaking, and other LLM-specific threats:

```
const response =awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt: userInput,  headers:{// Basic protection (Prompt Guard model)'Helicone-LLM-Security-Enabled':'true',// Optional: Advanced protection (Llama Guard model)'Helicone-LLM-Security-Advanced':'true',},});
```

Protects against multiple attack vectors in 8 languages with minimal latency. Advanced mode adds protection across 14 threat categories.

[→ Learn more about LLM Security](https://docs.helicone.ai/features/advanced-usage/llm-security)


## [Resources](#resources)


-   [Helicone Documentation](https://docs.helicone.ai)
-   [GitHub Repository](https://github.com/Helicone/helicone)
-   [Discord Community](https://discord.com/invite/2TkeWdXNPQ)
