# Client-Side Function Calls Not Invoked


---
url: https://ai-sdk.dev/docs/troubleshooting/client-side-function-calls-not-invoked
description: Troubleshooting client-side function calls not being invoked.
---


# [Client-Side Function Calls Not Invoked](#client-side-function-calls-not-invoked)



## [Issue](#issue)


I upgraded the AI SDK to v3.0.20 or newer. I am using [`OpenAIStream`](/docs/reference/stream-helpers/openai-stream). Client-side function calls are no longer invoked.


## [Solution](#solution)


You will need to add a stub for `experimental_onFunctionCall` to [`OpenAIStream`](/docs/reference/stream-helpers/openai-stream) to enable the correct forwarding of the function calls to the client.

```
const stream =OpenAIStream(response,{asyncexperimental_onFunctionCall(){return;},});
```
