# AI_NoSuchToolError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-no-such-tool-error
description: Learn how to fix AI_NoSuchToolError
---


# [AI\_NoSuchToolError](#ai_nosuchtoolerror)


This error occurs when a model tries to call an unavailable tool.


## [Properties](#properties)


-   `toolName`: The name of the tool that was not found
-   `availableTools`: Array of available tool names
-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_NoSuchToolError` using:

```
import{NoSuchToolError}from'ai';if(NoSuchToolError.isInstance(error)){// Handle the error}
```
