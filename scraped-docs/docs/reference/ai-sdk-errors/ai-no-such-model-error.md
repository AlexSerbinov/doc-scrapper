# AI_NoSuchModelError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-no-such-model-error
description: Learn how to fix AI_NoSuchModelError
---


# [AI\_NoSuchModelError](#ai_nosuchmodelerror)


This error occurs when a model ID is not found.


## [Properties](#properties)


-   `modelId`: The ID of the model that was not found
-   `modelType`: The type of model
-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_NoSuchModelError` using:

```
import{NoSuchModelError}from'ai';if(NoSuchModelError.isInstance(error)){// Handle the error}
```
