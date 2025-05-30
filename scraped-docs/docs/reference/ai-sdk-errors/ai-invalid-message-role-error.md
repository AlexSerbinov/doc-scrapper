# AI_InvalidMessageRoleError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-invalid-message-role-error
description: Learn how to fix AI_InvalidMessageRoleError
---


# [AI\_InvalidMessageRoleError](#ai_invalidmessageroleerror)


This error occurs when an invalid message role is provided.


## [Properties](#properties)


-   `role`: The invalid role value
-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_InvalidMessageRoleError` using:

```
import{InvalidMessageRoleError}from'ai';if(InvalidMessageRoleError.isInstance(error)){// Handle the error}
```
