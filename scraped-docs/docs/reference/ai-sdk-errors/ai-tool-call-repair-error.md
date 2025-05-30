# ToolCallRepairError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-tool-call-repair-error
description: Learn how to fix AI SDK ToolCallRepairError
---


# [ToolCallRepairError](#toolcallrepairerror)


This error occurs when there is a failure while attempting to repair an invalid tool call. This typically happens when the AI attempts to fix either a `NoSuchToolError` or `InvalidToolArgumentsError`.


## [Properties](#properties)


-   `originalError`: The original error that triggered the repair attempt (either `NoSuchToolError` or `InvalidToolArgumentsError`)
-   `message`: The error message
-   `cause`: The underlying error that caused the repair to fail


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `ToolCallRepairError` using:

```
import{ToolCallRepairError}from'ai';if(ToolCallRepairError.isInstance(error)){// Handle the error}
```
