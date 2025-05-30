# Streaming Not Working When Proxied


---
url: https://ai-sdk.dev/docs/troubleshooting/streaming-not-working-when-proxied
description: Troubleshooting streaming issues in proxied apps.
---


# [Streaming Not Working When Proxied](#streaming-not-working-when-proxied)



## [Issue](#issue)


Streaming with the AI SDK doesn't work in local development environment, or deployed in some proxy environments. Instead of streaming, only the full response is returned after a while.


## [Cause](#cause)


The causes of this issue are caused by the proxy middleware.

If the middleware is configured to compress the response, it will cause the streaming to fail.


## [Solution](#solution)


You can try the following, the solution only affects the streaming API:

-   add `'Content-Encoding': 'none'` headers

    ```
    return result.toDataStreamResponse({  headers:{'Content-Encoding':'none',},});
    ```
