# Unclosed Streams


---
url: https://ai-sdk.dev/docs/troubleshooting/unclosed-streams
description: Troubleshooting errors related to unclosed streams.
---


# [Unclosed Streams](#unclosed-streams)


Sometimes streams are not closed properly, which can lead to unexpected behavior. The following are some common issues that can occur when streams are not closed properly.


## [Issue](#issue)


The streamable UI has been slow to update.


## [Solution](#solution)


This happens when you create a streamable UI using [`createStreamableUI`](/docs/reference/ai-sdk-rsc/create-streamable-ui) and fail to close the stream. In order to fix this, you must ensure you close the stream by calling the [`.done()`](/docs/reference/ai-sdk-rsc/create-streamable-ui#done) method. This will ensure the stream is closed.

```
import{ createStreamableUI }from'ai/rsc';constsubmitMessage=async()=>{'use server';const stream =createStreamableUI('1');  stream.update('2');  stream.append('3');  stream.done('4');// [!code ++]return stream.value;};
```
