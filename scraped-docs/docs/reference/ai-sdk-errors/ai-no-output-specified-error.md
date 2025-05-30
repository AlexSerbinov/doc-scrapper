# AI_NoOutputSpecifiedError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-no-output-specified-error
description: Learn how to fix AI_NoOutputSpecifiedError
---


# [AI\_NoOutputSpecifiedError](#ai_nooutputspecifiederror)


This error occurs when no output format was specified for the AI response, and output-related methods are called.


## [Properties](#properties)


-   `message`: The error message (defaults to 'No output specified.')


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_NoOutputSpecifiedError` using:

```
import{NoOutputSpecifiedError}from'ai';if(NoOutputSpecifiedError.isInstance(error)){// Handle the error}
```
