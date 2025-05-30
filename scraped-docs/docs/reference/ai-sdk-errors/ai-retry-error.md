# AI_RetryError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-retry-error
description: Learn how to fix AI_RetryError
---


# [AI\_RetryError](#ai_retryerror)


This error occurs when a retry operation fails.


## [Properties](#properties)


-   `reason`: The reason for the retry failure
-   `lastError`: The most recent error that occurred during retries
-   `errors`: Array of all errors that occurred during retry attempts
-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_RetryError` using:

```
import{RetryError}from'ai';if(RetryError.isInstance(error)){// Handle the error}
```
