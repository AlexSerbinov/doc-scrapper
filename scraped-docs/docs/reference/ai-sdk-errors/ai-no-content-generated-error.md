# AI_NoContentGeneratedError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-no-content-generated-error
description: Learn how to fix AI_NoContentGeneratedError
---


# [AI\_NoContentGeneratedError](#ai_nocontentgeneratederror)


This error occurs when the AI provider fails to generate content.


## [Properties](#properties)


-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_NoContentGeneratedError` using:

```
import{NoContentGeneratedError}from'ai';if(NoContentGeneratedError.isInstance(error)){// Handle the error}
```
