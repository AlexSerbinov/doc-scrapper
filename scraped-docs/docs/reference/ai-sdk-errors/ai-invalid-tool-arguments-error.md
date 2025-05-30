# AI_InvalidToolArgumentsError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-invalid-tool-arguments-error
description: Learn how to fix AI_InvalidToolArgumentsError
---


# [AI\_InvalidToolArgumentsError](#ai_invalidtoolargumentserror)


This error occurs when invalid tool argument was provided.


## [Properties](#properties)


-   `toolName`: The name of the tool with invalid arguments
-   `toolArgs`: The invalid tool arguments
-   `message`: The error message
-   `cause`: The cause of the error


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_InvalidToolArgumentsError` using:

```
import{InvalidToolArgumentsError}from'ai';if(InvalidToolArgumentsError.isInstance(error)){// Handle the error}
```
