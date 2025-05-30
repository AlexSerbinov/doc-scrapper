# Migrate AI SDK 3.0 to 3.1


---
url: https://ai-sdk.dev/docs/migration-guides/migration-guide-3-1
description: Learn how to upgrade AI SDK 3.0 to 3.1.
---


# [Migrate AI SDK 3.0 to 3.1](#migrate-ai-sdk-30-to-31)


Check out the [AI SDK 3.1 release blog post](https://vercel.com/blog/vercel-ai-sdk-3-1-modelfusion-joins-the-team) for more information about the release.

This guide will help you:

-   Upgrade to AI SDK 3.1
-   Migrate from Legacy Providers to AI SDK Core
-   Migrate from [`render`](/docs/reference/ai-sdk-rsc/render) to [`streamUI`](/docs/reference/ai-sdk-rsc/stream-ui)

Upgrading to AI SDK 3.1 does not require using the newly released AI SDK Core API or [`streamUI`](/docs/reference/ai-sdk-rsc/stream-ui) function.


## [Upgrading](#upgrading)



### [AI SDK](#ai-sdk)


To update to AI SDK version 3.1, run the following command using your preferred package manager:

pnpm add ai@3.1


## [Next Steps](#next-steps)


The release of AI SDK 3.1 introduces several new features that improve the way you build AI applications with the SDK:

-   AI SDK Core, a brand new unified API for interacting with large language models (LLMs).
-   [`streamUI`](/docs/reference/ai-sdk-rsc/stream-ui), a new abstraction, built upon AI SDK Core functions that simplifies building streaming UIs.


## [Migrating from Legacy Providers to AI SDK Core](#migrating-from-legacy-providers-to-ai-sdk-core)


Prior to AI SDK Core, you had to use a model provider's SDK to query their models.

In the following Route Handler, you use the OpenAI SDK to query their model. You then pipe that response into the [`OpenAIStream`](/docs/reference/stream-helpers/openai-stream) function which returns a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) that you can pass to the client using a new [`StreamingTextResponse`](/docs/reference/stream-helpers/streaming-text-response).

```
importOpenAIfrom'openai';import{OpenAIStream,StreamingTextResponse}from'ai';const openai =newOpenAI({  apiKey: process.env.OPENAI_API_KEY!,});exportasyncfunctionPOST(req: Request){const{ messages }=await req.json();const response =await openai.chat.completions.create({    model:'gpt-4-turbo',    stream:true,    messages,});const stream =OpenAIStream(response);returnnewStreamingTextResponse(stream);}
```

With AI SDK Core you have a unified API for any provider that implements the [AI SDK Language Model Specification](/providers/community-providers/custom-providers).

Let’s take a look at the example above, but refactored to utilize the AI SDK Core API alongside the AI SDK OpenAI provider. In this example, you import the LLM function you want to use from the `ai` package, import the OpenAI provider from `@ai-sdk/openai`, and then you call the model and return the response using the `toDataStreamResponse()` helper function.

```
import{ streamText }from'ai';import{ openai }from'@ai-sdk/openai';exportasyncfunctionPOST(req: Request){const{ messages }=await req.json();const result =awaitstreamText({    model:openai('gpt-4-turbo'),    messages,});return result.toDataStreamResponse();}
```


## [Migrating from `render` to `streamUI`](#migrating-from-render-to-streamui)


The AI SDK RSC API was launched as part of version 3.0. This API introduced the [`render`](/docs/reference/ai-sdk-rsc/render) function, a helper function to create streamable UIs with OpenAI models. With the new AI SDK Core API, it became possible to make streamable UIs possible with any compatible provider.

The following example Server Action uses the `render` function using the model provider directly from OpenAI. You first create an OpenAI provider instance with the OpenAI SDK. Then, you pass it to the provider key of the render function alongside a tool that returns a React Server Component, defined in the `render` key of the tool.

```
import{ render }from'ai/rsc';importOpenAIfrom'openai';import{ z }from'zod';import{Spinner,Weather}from'@/components';import{ getWeather }from'@/utils';const openai =newOpenAI();asyncfunctionsubmitMessage(userInput ='What is the weather in SF?'){'use server';returnrender({    provider: openai,    model:'gpt-4-turbo',    messages:[{ role:'system', content:'You are a helpful assistant'},{ role:'user', content: userInput },],text:({ content })=><p>{content}</p>,    tools:{      get_city_weather:{        description:'Get the current weather for a city',        parameters: z.object({            city: z.string().describe('the city'),}).required(),render:asyncfunction*({ city }){yield<Spinner/>;const weather =awaitgetWeather(city);return<Weatherinfo={weather}/>;},},},});}
```

With the new [`streamUI`](/docs/reference/ai-sdk-rsc/stream-ui) function, you can now use any compatible AI SDK provider. In this example, you import the AI SDK OpenAI provider. Then, you pass it to the [`model`](/docs/reference/ai-sdk-rsc/stream-ui#model) key of the new [`streamUI`](/docs/reference/ai-sdk-rsc/stream-ui) function. Finally, you declare a tool and return a React Server Component, defined in the [`generate`](/docs/reference/ai-sdk-rsc/stream-ui#tools-generate) key of the tool.

```
import{ streamUI }from'ai/rsc';import{ openai }from'@ai-sdk/openai';import{ z }from'zod';import{Spinner,Weather}from'@/components';import{ getWeather }from'@/utils';asyncfunctionsubmitMessage(userInput ='What is the weather in SF?'){'use server';const result =awaitstreamUI({    model:openai('gpt-4-turbo'),    system:'You are a helpful assistant',    messages:[{ role:'user', content: userInput }],text:({ content })=><p>{content}</p>,    tools:{      get_city_weather:{        description:'Get the current weather for a city',        parameters: z.object({            city: z.string().describe('Name of the city'),}).required(),generate:asyncfunction*({ city }){yield<Spinner/>;const weather =awaitgetWeather(city);return<Weatherinfo={weather}/>;},},},});return result.value;}
```
