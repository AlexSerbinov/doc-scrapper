# Server Actions in Client Components


---
url: https://ai-sdk.dev/docs/troubleshooting/server-actions-in-client-components
description: Troubleshooting errors related to server actions in client components.
---


# [Server Actions in Client Components](#server-actions-in-client-components)


You may use Server Actions in client components, but sometimes you may encounter the following issues.


## [Issue](#issue)


It is not allowed to define inline `"use server"` annotated Server Actions in Client Components.


## [Solution](#solution)


To use Server Actions in a Client Component, you can either:

-   Export them from a separate file with `"use server"` at the top.
-   Pass them down through props from a Server Component.
-   Implement a combination of [`createAI`](/docs/reference/ai-sdk-rsc/create-ai) and [`useActions`](/docs/reference/ai-sdk-rsc/use-actions) hooks to access them.

Learn more about [Server Actions and Mutations](https://nextjs.org/docs/app/api-reference/functions/server-actions#with-client-components).

```
'use server';import{ generateText }from'ai';import{ openai }from'@ai-sdk/openai';exportasyncfunctiongetAnswer(question:string){'use server';const{ text }=awaitgenerateText({    model: openai.chat('gpt-3.5-turbo'),    prompt: question,});return{ answer: text };}
```
