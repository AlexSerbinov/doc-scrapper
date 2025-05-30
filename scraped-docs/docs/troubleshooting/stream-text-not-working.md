# streamText is not working


---
url: https://ai-sdk.dev/docs/troubleshooting/stream-text-not-working
description: Troubleshooting errors related to the streamText function not working.
---


# [`streamText` is not working](#streamtext-is-not-working)



## [Issue](#issue)


I am using [`streamText`](/docs/reference/ai-sdk-core/stream-text) function, and it does not work. It does not throw any errors and the stream is only containing error parts.


## [Background](#background)


`streamText` immediately starts streaming to enable sending data without waiting for the model. Errors become part of the stream and are not thrown to prevent e.g. servers from crashing.


## [Solution](#solution)


To log errors, you can provide an `onError` callback that is triggered when an error occurs.

```
import{ streamText }from'ai';const result =streamText({  model: yourModel,  prompt:'Invent a new holiday and describe its traditions.',onError({ error }){console.error(error);// your error logging logic here},});
```
