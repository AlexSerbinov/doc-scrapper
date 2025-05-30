# AI_EmptyResponseBodyError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-empty-response-body-error
description: Learn how to fix AI_EmptyResponseBodyError
---


# [AI\_EmptyResponseBodyError](#ai_emptyresponsebodyerror)


This error occurs when the server returns an empty response body.


## [Properties](#properties)


-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_EmptyResponseBodyError` using:

```
import{EmptyResponseBodyError}from'ai';if(EmptyResponseBodyError.isInstance(error)){// Handle the error}
```
