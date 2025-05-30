# AI_InvalidPromptError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-invalid-prompt-error
description: Learn how to fix AI_InvalidPromptError
---


# [AI\_InvalidPromptError](#ai_invalidprompterror)


This error occurs when the prompt provided is invalid.


## [Properties](#properties)


-   `prompt`: The invalid prompt value
-   `message`: The error message
-   `cause`: The cause of the error


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_InvalidPromptError` using:

```
import{InvalidPromptError}from'ai';if(InvalidPromptError.isInstance(error)){// Handle the error}
```
