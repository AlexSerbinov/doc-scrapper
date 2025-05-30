# Laminar observability


---
url: https://ai-sdk.dev/providers/observability/laminar
description: Monitor your AI SDK applications with Laminar
---


# [Laminar observability](#laminar-observability)


[Laminar](https://www.lmnr.ai) is the open-source platform for tracing and evaluating AI applications.

Laminar features:

-   [Tracing compatible with AI SDK and more](https://docs.lmnr.ai/tracing/introduction),
-   [Evaluations](https://docs.lmnr.ai/evaluations/introduction),
-   [Browser agent observability](https://docs.lmnr.ai/tracing/browser-agent-observability)

A version of this guide is available in [Laminar's docs](https://docs.lmnr.ai/tracing/integrations/vercel-ai-sdk).


## [Setup](#setup)


Laminar's tracing is based on OpenTelemetry. It supports AI SDK [telemetry](/docs/ai-sdk-core/telemetry).


### [Installation](#installation)


To start with Laminar's tracing, first [install](https://docs.lmnr.ai/installation) the `@lmnr-ai/lmnr` package.

pnpm

npm

yarn

pnpm add @lmnr-ai/lmnr


### [Get your project API key and set in the environment](#get-your-project-api-key-and-set-in-the-environment)


Then, either sign up on [Laminar](https://www.lmnr.ai) or self-host an instance ([github](https://github.com/lmnr-ai/lmnr)) and create a new project.

In the project settings, create and copy the API key.

In your .env

```
LMNR_PROJECT_API_KEY=...
```


## [Next.js](#nextjs)



### [Initialize tracing](#initialize-tracing)


In Next.js, Laminar initialization should be done in `instrumentation.{ts,js}`:

```
exportasyncfunctionregister(){// prevent this from running in the edge runtimeif(process.env.NEXT_RUNTIME==='nodejs'){const{Laminar}=awaitimport('@lmnr-ai/lmnr');Laminar.initialize({      projectApiKey: process.env.LMNR_API_KEY,});}}
```


### [Add @lmnr-ai/lmnr to your next.config](#add-lmnr-ailmnr-to-your-nextconfig)


In your `next.config.js` (`.ts` / `.mjs`), add the following lines:

```
const nextConfig ={  serverExternalPackages:['@lmnr-ai/lmnr'],};exportdefault nextConfig;
```

This is because Laminar depends on OpenTelemetry, which uses some Node.js-specific functionality, and we need to inform Next.js about it. Learn more in the [Next.js docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages).


### [Tracing AI SDK calls](#tracing-ai-sdk-calls)


Then, when you call AI SDK functions in any of your API routes, add the Laminar tracer to the `experimental_telemetry` option.

```
import{ openai }from'@ai-sdk/openai';import{ generateText }from'ai';import{ getTracer }from'@lmnr-ai/lmnr';const{ text }=awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'What is Laminar flow?',  experimental_telemetry:{    isEnabled:true,    tracer:getTracer(),},});
```

This will create spans for `ai.generateText`. Laminar collects and displays the following information:

-   LLM call input and output
-   Start and end time
-   Duration / latency
-   Provider and model used
-   Input and output tokens
-   Input and output price
-   Additional metadata and span attributes


### [Older versions of Next.js](#older-versions-of-nextjs)


If you are using 13.4 ≤ Next.js < 15, you will also need to enable the experimental instrumentation hook. Place the following in your `next.config.js`:

```
module.exports={  experimental:{    instrumentationHook:true,},};
```

For more information, see Laminar's [Next.js guide](https://docs.lmnr.ai/tracing/nextjs) and Next.js [instrumentation docs](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation). You can also learn how to enable all traces for Next.js in the docs.


### [Usage with `@vercel/otel`](#usage-with-vercelotel)


Laminar can live alongside `@vercel/otel` and trace AI SDK calls. The default Laminar setup will ensure that

-   regular Next.js traces are sent via `@vercel/otel` to your Telemetry backend configured with Vercel,
-   AI SDK and other LLM or browser agent traces are sent via Laminar.

```
import{ registerOTel }from'@vercel/otel';exportasyncfunctionregister(){registerOTel('my-service-name');if(process.env.NEXT_RUNTIME==='nodejs'){const{Laminar}=awaitimport('@lmnr-ai/lmnr');// Make sure to initialize Laminar **after** `@registerOTel`Laminar.initialize({      projectApiKey: process.env.LMNR_PROJECT_API_KEY,});}}
```

For an advanced configuration that allows you to trace all Next.js traces via Laminar, see an example [repo](https://github.com/lmnr-ai/lmnr-ts/tree/main/examples/nextjs).


### [Usage with `@sentry/node`](#usage-with-sentrynode)


Laminar can live alongside `@sentry/node` and trace AI SDK calls. Make sure to initialize Laminar **after** `Sentry.init`.

This will ensure that

-   Whatever is instrumented by Sentry is sent to your Sentry backend,
-   AI SDK and other LLM or browser agent traces are sent via Laminar.

```
exportasyncfunctionregister(){if(process.env.NEXT_RUNTIME==='nodejs'){constSentry=awaitimport('@sentry/node');const{Laminar}=awaitimport('@lmnr-ai/lmnr');Sentry.init({      dsn: process.env.SENTRY_DSN,});// Make sure to initialize Laminar **after** `Sentry.init`Laminar.initialize({      projectApiKey: process.env.LMNR_PROJECT_API_KEY,});}}
```


## [Node.js](#nodejs)



### [Initialize tracing](#initialize-tracing-1)


Then, initialize tracing in your application:

```
import{Laminar}from'@lmnr-ai/lmnr';Laminar.initialize();
```

This must be done once in your application, as early as possible, but *after* other tracing libraries (e.g. `@sentry/node`) are initialized.

Read more in Laminar [docs](https://docs.lmnr.ai/tracing/introduction).


### [Tracing AI SDK calls](#tracing-ai-sdk-calls-1)


Then, when you call AI SDK functions in any of your API routes, add the Laminar tracer to the `experimental_telemetry` option.

```
import{ openai }from'@ai-sdk/openai';import{ generateText }from'ai';import{ getTracer }from'@lmnr-ai/lmnr';const{ text }=awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'What is Laminar flow?',  experimental_telemetry:{    isEnabled:true,    tracer:getTracer(),},});
```

This will create spans for `ai.generateText`. Laminar collects and displays the following information:

-   LLM call input and output
-   Start and end time
-   Duration / latency
-   Provider and model used
-   Input and output tokens
-   Input and output price
-   Additional metadata and span attributes


### [Usage with `@sentry/node`](#usage-with-sentrynode-1)


Laminar can work with `@sentry/node` to trace AI SDK calls. Make sure to initialize Laminar **after** `Sentry.init`:

```
constSentry=awaitimport('@sentry/node');const{Laminar}=awaitimport('@lmnr-ai/lmnr');Sentry.init({  dsn: process.env.SENTRY_DSN,});Laminar.initialize({  projectApiKey: process.env.LMNR_PROJECT_API_KEY,});
```

This will ensure that

-   Whatever is instrumented by Sentry is sent to your Sentry backend,
-   AI SDK and other LLM or browser agent traces are sent via Laminar.

The two libraries allow for additional advanced configuration, but the default setup above is recommended.


## [Additional configuration](#additional-configuration)



### [Nested spans](#nested-spans)


If you want to trace not just the AI SDK calls, but also other functions in your application, you can use Laminar's `observe` wrapper.

```
import{ getTracer, observe }from'@lmnr-ai/lmnr';const result =awaitobserve({ name:'my-function'},async()=>{// ... some workawaitgenerateText({//...});// ... some work});
```

This will create a span with the name "my-function" and trace the function call. Inside it, you will see the nested `ai.generateText` spans.

To trace input arguments of the function that you wrap in `observe`, pass them to the wrapper as additional arguments. The return value of the function will be returned from the wrapper and traced as the span's output.

```
const result =awaitobserve({ name:'poem writer'},async(topic: string, mood: string)=>{const{ text }=awaitgenerateText({      model:openai('gpt-4.1-nano'),      prompt:`Write a poem about ${topic} in ${mood} mood.`,});return text;},'Laminar flow','happy',);
```


### [Metadata](#metadata)


In Laminar, metadata is set on the trace level. Metadata contains key-value pairs and can be used to filter traces.

```
import{ getTracer }from'@lmnr-ai/lmnr';const{ text }=awaitgenerateText({  model:openai('gpt-4.1-nano'),  prompt:`Write a poem about Laminar flow.`,  experimental_telemetry:{    isEnabled:true,    tracer:getTracer(),    metadata:{'my-key':'my-value','another-key':'another-value',},},});
```

This is converted to Laminar's metadata and stored in the trace.
