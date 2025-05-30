# Cloudflare Workers AI


---
url: https://ai-sdk.dev/providers/community-providers/cloudflare-workers-ai
description: Learn how to use the Cloudflare Workers AI provider for the AI SDK.
---


# [Cloudflare Workers AI](#cloudflare-workers-ai)


[workers-ai-provider](https://github.com/cloudflare/ai/tree/main/packages/workers-ai-provider) is a community provider that allows you to use Cloudflare's [Workers AI](https://ai.cloudflare.com/) models with the AI SDK.


## [Setup](#setup)


The Cloudflare Workers AI provider is available in the `workers-ai-provider` module. You can install it with:

pnpm

npm

yarn

pnpm add workers-ai-provider

Then, setup an AI binding in your Cloudflare Workers project `wrangler.toml` file:

wrangler.toml

```
[ai]binding ="AI"
```


## [Provider Instance](#provider-instance)


To create a `workersai` provider instance, use the `createWorkersAI` function, passing in the AI binding as an option:

```
import{ createWorkersAI }from'workers-ai-provider';const workersai =createWorkersAI({ binding: env.AI});
```


## [Language Models](#language-models)


To create a model instance, call the provider instance and specify the model you would like to use as the first argument. You can also pass additional settings in the second argument:

```
import{ createWorkersAI }from'workers-ai-provider';const workersai =createWorkersAI({ binding: env.AI});const model =workersai('@cf/meta/llama-3.1-8b-instruct',{// additional settings  safePrompt:true,});
```

You can use the following optional settings to customize:

-   **safePrompt** *boolean*

    Whether to inject a safety prompt before all conversations. Defaults to `false`



### [Examples](#examples)


You can use Cloudflare Workers AI language models to generate text with the **`generateText`** or **`streamText`** function:


#### [`generateText`](#generatetext)


```
import{ createWorkersAI }from'workers-ai-provider';import{ generateText }from'ai';typeEnv={AI:Ai;};exportdefault{asyncfetch(_:Request, env:Env){const workersai =createWorkersAI({ binding: env.AI});const result =awaitgenerateText({      model:workersai('@cf/meta/llama-2-7b-chat-int8'),      prompt:'Write a 50-word essay about hello world.',});returnnewResponse(result.text);},};
```


#### [`streamText`](#streamtext)


```
import{ createWorkersAI }from'workers-ai-provider';import{ streamText }from'ai';typeEnv={AI:Ai;};exportdefault{asyncfetch(_:Request, env:Env){const workersai =createWorkersAI({ binding: env.AI});const result =streamText({      model:workersai('@cf/meta/llama-2-7b-chat-int8'),      prompt:'Write a 50-word essay about hello world.',});return result.toTextStreamResponse({      headers:{// add these headers to ensure that the// response is chunked and streamed'Content-Type':'text/x-unknown','content-encoding':'identity','transfer-encoding':'chunked',},});},};
```


#### [`generateObject`](#generateobject)


Some Cloudflare Workers AI language models can also be used with the `generateObject` function:

```
import{ createWorkersAI }from'workers-ai-provider';import{ generateObject }from'ai';import{ z }from'zod';typeEnv={AI:Ai;};exportdefault{asyncfetch(_:Request, env:Env){const workersai =createWorkersAI({ binding: env.AI});const result =awaitgenerateObject({      model:workersai('@cf/meta/llama-3.1-8b-instruct'),      prompt:'Generate a Lasagna recipe',      schema: z.object({        recipe: z.object({          ingredients: z.array(z.string()),          description: z.string(),}),}),});returnResponse.json(result.object);},};
```
