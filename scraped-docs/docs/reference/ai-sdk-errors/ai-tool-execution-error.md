# AI_ToolExecutionError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-tool-execution-error
description: Learn how to fix AI_ToolExecutionError
---


# [AI\_ToolExecutionError](#ai_toolexecutionerror)


This error occurs when there is a failure during the execution of a tool.


## [Properties](#properties)


-   `toolName`: The name of the tool that failed
-   `toolArgs`: The arguments passed to the tool
-   `toolCallId`: The ID of the tool call that failed
-   `message`: The error message
-   `cause`: The underlying error that caused the tool execution to fail


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_ToolExecutionError` using:

```
import{ToolExecutionError}from'ai';if(ToolExecutionError.isInstance(error)){// Handle the error}
```
