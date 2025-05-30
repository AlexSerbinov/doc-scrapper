# AI_InvalidArgumentError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-invalid-argument-error
description: Learn how to fix AI_InvalidArgumentError
---


# [AI\_InvalidArgumentError](#ai_invalidargumenterror)


This error occurs when an invalid argument was provided.


## [Properties](#properties)


-   `parameter`: The name of the parameter that is invalid
-   `value`: The invalid value
-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_InvalidArgumentError` using:

```
import{InvalidArgumentError}from'ai';if(InvalidArgumentError.isInstance(error)){// Handle the error}
```
