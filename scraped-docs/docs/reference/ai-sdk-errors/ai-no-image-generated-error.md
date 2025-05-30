# AI_NoImageGeneratedError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-no-image-generated-error
description: Learn how to fix AI_NoImageGeneratedError
---


# [AI\_NoImageGeneratedError](#ai_noimagegeneratederror)


This error occurs when the AI provider fails to generate an image. It can arise due to the following reasons:

-   The model failed to generate a response.
-   The model generated an invalid response.


## [Properties](#properties)


-   `message`: The error message.
-   `responses`: Metadata about the image model responses, including timestamp, model, and headers.
-   `cause`: The cause of the error. You can use this for more detailed error handling.


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_NoImageGeneratedError` using:

```
import{ generateImage,NoImageGeneratedError}from'ai';try{awaitgenerateImage({ model, prompt });}catch(error){if(NoImageGeneratedError.isInstance(error)){console.log('NoImageGeneratedError');console.log('Cause:', error.cause);console.log('Responses:', error.responses);}}
```
