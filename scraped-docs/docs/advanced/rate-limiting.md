# Rate Limiting


---
url: https://ai-sdk.dev/docs/advanced/rate-limiting
description: Learn how to rate limit your application.
---


# [Rate Limiting](#rate-limiting)


Rate limiting helps you protect your APIs from abuse. It involves setting a maximum threshold on the number of requests a client can make within a specified timeframe. This simple technique acts as a gatekeeper, preventing excessive usage that can degrade service performance and incur unnecessary costs.


## [Rate Limiting with Vercel KV and Upstash Ratelimit](#rate-limiting-with-vercel-kv-and-upstash-ratelimit)


In this example, you will protect an API endpoint using [Vercel KV](https://vercel.com/storage/kv) and [Upstash Ratelimit](https://github.com/upstash/ratelimit).

app/api/generate/route.ts

```
import kv from'@vercel/kv';import{ openai }from'@ai-sdk/openai';import{ streamText }from'ai';import{Ratelimit}from'@upstash/ratelimit';import{NextRequest}from'next/server';// Allow streaming responses up to 30 secondsexportconst maxDuration =30;// Create Rate limitconst ratelimit =newRatelimit({  redis: kv,  limiter:Ratelimit.fixedWindow(5,'30s'),});exportasyncfunctionPOST(req: NextRequest){// call ratelimit with request ipconst ip = req.ip ??'ip';const{ success, remaining }=await ratelimit.limit(ip);// block the request if unsuccessfullif(!success){returnnewResponse('Ratelimited!',{ status:429});}const{ messages }=await req.json();const result =streamText({    model:openai('gpt-3.5-turbo'),    messages,});return result.toDataStreamResponse();}
```


## [Simplify API Protection](#simplify-api-protection)


With Vercel KV and Upstash Ratelimit, it is possible to protect your APIs from such attacks with ease. To learn more about how Ratelimit works and how it can be configured to your needs, see [Ratelimit Documentation](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview).
