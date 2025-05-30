# Streaming Not Working When Deployed


---
url: https://ai-sdk.dev/docs/troubleshooting/streaming-not-working-when-deployed
description: Troubleshooting streaming issues in deployed apps.
---


# [Streaming Not Working When Deployed](#streaming-not-working-when-deployed)



## [Issue](#issue)


Streaming with the AI SDK works in my local development environment. However, when deploying, streaming does not work in the deployed app. Instead of streaming, only the full response is returned after a while.


## [Cause](#cause)


The causes of this issue are varied and depend on the deployment environment.


## [Solution](#solution)


You can try the following:

-   add `'Transfer-Encoding': 'chunked'` and/or `Connection: 'keep-alive'` headers

    ```
    return result.toDataStreamResponse({  headers:{'Transfer-Encoding':'chunked',Connection:'keep-alive',},});
    ```
