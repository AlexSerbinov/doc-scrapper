# LangSmith Observability


---
url: https://ai-sdk.dev/providers/observability/langsmith
description: Monitor and evaluate your AI SDK application with LangSmith
---


# [LangSmith Observability](#langsmith-observability)


[LangSmith](https://docs.smith.langchain.com) is a platform for building production-grade LLM applications. It allows you to closely monitor and evaluate your application, so you can ship quickly and with confidence.

Use of LangChain's open-source frameworks is not necessary, and LangSmith integrates with the [AI SDK](/docs/introduction) via the `AISDKExporter` OpenTelemetry trace exporter.

A version of this guide is also available in the [LangSmith documentation](https://docs.smith.langchain.com/observability/how_to_guides/tracing/trace_with_vercel_ai_sdk).


## [Setup](#setup)


Install an [AI SDK model provider](/providers/ai-sdk-providers) and the [LangSmith client SDK](https://npmjs.com/package/langsmith). The code snippets below will use the [AI SDK's OpenAI provider](/providers/ai-sdk-providers/openai), but you can use any [other supported provider](/providers/ai-sdk-providers) as well.

pnpm

npm

yarn

pnpm add @ai-sdk/openai langsmith

The `AISDKExporter` class is only available in `langsmith` SDK version `>=0.2.1`.

Next, set required environment variables.

```
exportLANGCHAIN_TRACING_V2=trueexportLANGCHAIN_API_KEY=<your-api-key>exportOPENAI_API_KEY=<your-openai-api-key># The examples use OpenAI (replace with your selected provider)
```

You can also [see this guide](https://docs.smith.langchain.com/observability/how_to_guides/tracing/trace_without_env_vars) for other ways to configure LangSmith, or [the section below](#custom-langsmith-client) for how to pass in a custom LangSmith client instance.


## [Trace Logging](#trace-logging)



### [Next.js](#nextjs)


First, create an `instrumentation.js` file in your project root.

```
import{ registerOTel }from'@vercel/otel';import{AISDKExporter}from'langsmith/vercel';exportfunctionregister(){registerOTel({    serviceName:'langsmith-vercel-ai-sdk-example',    traceExporter:newAISDKExporter(),});}
```

You can learn more how to [setup OpenTelemetry instrumentation within your Next.js app here](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation).

If you are using Next.js version 14, you need to add the following configuration to your `next.config.js`:

```
module.exports={  experimental:{    instrumentationHook:true,},};
```

For more information, see the [Next.js documentation on instrumentationHook](https://nextjs.org/docs/14/pages/api-reference/next-config-js/instrumentationHook).

Afterwards, add the `experimental_telemetry` argument to your AI SDK calls that you want to trace. For convenience, we've included the `AISDKExporter.getSettings()` method which appends additional metadata for LangSmith.

```
import{AISDKExporter}from'langsmith/vercel';import{ streamText }from'ai';import{ openai }from'@ai-sdk/openai';awaitstreamText({  model:openai('gpt-4o-mini'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',  experimental_telemetry:AISDKExporter.getSettings(),});
```

You should see a trace in your LangSmith dashboard [like this one](https://smith.langchain.com/public/a9d9521a-4f97-4843-b1e2-b87c3a125503/r).

You can also trace tool calls:

```
import{AISDKExporter}from'langsmith/vercel';import{ generateText, tool }from'ai';import{ openai }from'@ai-sdk/openai';import{ z }from'zod';awaitgenerateText({  model:openai('gpt-4o-mini'),  messages:[{      role:'user',      content:'What are my orders and where are they? My user ID is 123',},],  tools:{    listOrders:tool({      description:'list all orders',      parameters: z.object({ userId: z.string()}),execute:async({ userId })=>`User ${userId} has the following orders: 1`,}),    viewTrackingInformation:tool({      description:'view tracking information for a specific order',      parameters: z.object({ orderId: z.string()}),execute:async({ orderId })=>`Here is the tracking information for ${orderId}`,}),},  experimental_telemetry:AISDKExporter.getSettings(),  maxSteps:10,});
```

Which results in a trace like [this one](https://smith.langchain.com/public/4d3add36-756d-4c8c-845d-4ad701a315bb/r).


### [Node.js](#nodejs)


Add the `AISDKExporter` to the trace exporter to your OpenTelemetry setup.

```
import{AISDKExporter}from'langsmith/vercel';import{NodeSDK}from'@opentelemetry/sdk-node';import{ getNodeAutoInstrumentations }from'@opentelemetry/auto-instrumentations-node';const sdk =newNodeSDK({  traceExporter:newAISDKExporter(),  instrumentations:[getNodeAutoInstrumentations()],});sdk.start();
```

Afterwards, add the `experimental_telemetry` argument to your AI SDK calls that you want to trace.

Do not forget to call `await sdk.shutdown()` before your application shuts down in order to flush any remaining traces to LangSmith.

```
import{ generateText }from'ai';import{ openai }from'@ai-sdk/openai';import{AISDKExporter}from'langsmith/vercel';const result =awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',  experimental_telemetry:AISDKExporter.getSettings(),});await sdk.shutdown();
```

You should see a trace in your LangSmith dashboard [like this one](https://smith.langchain.com/public/a9d9521a-4f97-4843-b1e2-b87c3a125503/r).


### [Sentry](#sentry)


If you're using Sentry, you can attach the LangSmith trace exporter to Sentry's default OpenTelemetry instrumentation as follows:

```
import*asSentryfrom'@sentry/node';import{BatchSpanProcessor}from'@opentelemetry/sdk-trace-base';import{AISDKExporter}from'langsmith/vercel';const client =Sentry.init({  dsn:'[Sentry DSN]',  tracesSampleRate:1.0,});client?.traceProvider?.addSpanProcessor(newBatchSpanProcessor(newAISDKExporter()),);
```


## [Configuration](#configuration)



### [Customize run name](#customize-run-name)


You can customize the run name by passing the `runName` argument to the `AISDKExporter.getSettings()` method.

```
import{AISDKExporter}from'langsmith/vercel';import{ openai }from'@ai-sdk/openai';import{ generateText }from'ai';awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',  experimental_telemetry:AISDKExporter.getSettings({    runName:'my-custom-run-name',}),});
```


### [Customize run ID](#customize-run-id)


You can customize the run ID by passing the `runId` argument to the `AISDKExporter.getSettings()` method. This is especially useful if you want to know the run ID before the run has been completed.

The run ID has to be a valid UUID.

```
import{AISDKExporter}from'langsmith/vercel';import{ openai }from'@ai-sdk/openai';import{ generateText }from'ai';import{ v4 as uuidv4 }from'uuid';awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',  experimental_telemetry:AISDKExporter.getSettings({    runId:uuidv4(),}),});
```


### [Nesting runs](#nesting-runs)


You can also nest runs within other traced functions to create a hierarchy of associated runs. Here's an example using the [`traceable`](https://docs.smith.langchain.com/observability/how_to_guides/tracing/annotate_code#use-traceable--traceable) method:

```
import{AISDKExporter}from'langsmith/vercel';import{ openai }from'@ai-sdk/openai';import{ generateText }from'ai';import{ traceable }from'langsmith/traceable';const wrappedGenerateText =traceable(async(content:string)=>{const{ text }=awaitgenerateText({      model:openai('gpt-4o-mini'),      messages:[{ role:'user', content }],      experimental_telemetry:AISDKExporter.getSettings(),});const reverseText =traceable(async(text:string)=>{return text.split('').reverse().join('');},{        name:'reverseText',},);const reversedText =awaitreverseText(text);return{ text, reversedText };},{ name:'parentTraceable'},);const result =awaitwrappedGenerateText('What color is the sky? Respond with one word.',);
```

The resulting trace will look like [this one](https://smith.langchain.com/public/c0466ed5-3932-4140-83b1-cf11e998fa6a/r).


### [Custom LangSmith client](#custom-langsmith-client)


You can also pass a LangSmith client instance into the `AISDKExporter` constructor:

```
import{AISDKExporter}from'langsmith/vercel';import{Client}from'langsmith';import{ generateText }from'ai';import{ openai }from'@ai-sdk/openai';import{NodeSDK}from'@opentelemetry/sdk-node';import{ getNodeAutoInstrumentations }from'@opentelemetry/auto-instrumentations-node';const langsmithClient =newClient({});const sdk =newNodeSDK({  traceExporter:newAISDKExporter({ client: langsmithClient }),  instrumentations:[getNodeAutoInstrumentations()],});sdk.start();awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',  experimental_telemetry:AISDKExporter.getSettings(),});
```


### [Debugging Exporter](#debugging-exporter)


You can enable debug logs for the `AISDKExporter` by passing the `debug` argument to the constructor.

```
const traceExporter =newAISDKExporter({ debug:true});
```

Alternatively, you can set the `OTEL_LOG_LEVEL=DEBUG` environment variable to enable debug logs for the exporter as well as the rest of the OpenTelemetry stack.


### [Adding metadata](#adding-metadata)


You can add metadata to your traces to help organize and filter them in the LangSmith UI:

```
import{AISDKExporter}from'langsmith/vercel';import{ generateText }from'ai';import{ openai }from'@ai-sdk/openai';awaitgenerateText({  model:openai('gpt-4o-mini'),  prompt:'Write a vegetarian lasagna recipe for 4 people.',  experimental_telemetry:AISDKExporter.getSettings({    metadata:{ userId:'123', language:'english'},}),});
```

Metadata will be visible in your LangSmith dashboard and can be used to filter and search for specific traces.


## [Further reading](#further-reading)


-   [LangSmith docs](https://docs.smith.langchain.com)
-   [LangSmith guide on tracing with the AI SDK](https://docs.smith.langchain.com/observability/how_to_guides/tracing/trace_with_vercel_ai_sdk)
-   [LangSmith guide on tracing without environment variables](https://docs.smith.langchain.com/observability/how_to_guides/tracing/trace_without_env_vars)

Once you've set up LangSmith tracing for your project, try gathering a dataset and evaluating it:

-   [LangSmith evaluation](https://docs.smith.langchain.com/evaluation)
