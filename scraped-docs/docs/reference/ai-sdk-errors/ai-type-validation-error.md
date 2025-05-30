# AI_TypeValidationError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-type-validation-error
description: Learn how to fix AI_TypeValidationError
---


# [AI\_TypeValidationError](#ai_typevalidationerror)


This error occurs when type validation fails.


## [Properties](#properties)


-   `value`: The value that failed validation
-   `message`: The error message including validation details


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_TypeValidationError` using:

```
import{TypeValidationError}from'ai';if(TypeValidationError.isInstance(error)){// Handle the error}
```
