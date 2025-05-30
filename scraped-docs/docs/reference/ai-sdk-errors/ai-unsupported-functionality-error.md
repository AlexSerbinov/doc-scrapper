# AI_UnsupportedFunctionalityError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-unsupported-functionality-error
description: Learn how to fix AI_UnsupportedFunctionalityError
---


# [AI\_UnsupportedFunctionalityError](#ai_unsupportedfunctionalityerror)


This error occurs when functionality is not unsupported.


## [Properties](#properties)


-   `functionality`: The name of the unsupported functionality
-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_UnsupportedFunctionalityError` using:

```
import{UnsupportedFunctionalityError}from'ai';if(UnsupportedFunctionalityError.isInstance(error)){// Handle the error}
```
