# Getting Timeouts When Deploying on Vercel


---
url: https://ai-sdk.dev/docs/troubleshooting/timeout-on-vercel
description: Learn how to fix timeouts and cut off responses when deploying to Vercel.
---


# [Getting Timeouts When Deploying on Vercel](#getting-timeouts-when-deploying-on-vercel)



## [Issue](#issue)


Streaming with the AI SDK works in my local development environment. However, when I'm deploying to Vercel, longer responses get chopped off in the UI and I'm seeing timeouts in the Vercel logs or I'm seeing the error: `Uncaught (in promise) Error: Connection closed`.


## [Solution](#solution)


If you are using Next.js with the App Router, you can add the following to your route file or the page you are calling your Server Action from:

```
exportconst maxDuration =30;
```

This increases the maximum duration of the function to 30 seconds.

For other frameworks such as Svelte, you can set timeouts in your `vercel.json` file:

```
{"functions":{"api/chat/route.ts":{"maxDuration":30}}}
```


## [Learn more](#learn-more)


-   [Configuring Maximum Duration for Vercel Functions](https://vercel.com/docs/functions/configuring-functions/duration)
-   [Maximum Duration Limits](https://vercel.com/docs/functions/runtimes#max-duration)
