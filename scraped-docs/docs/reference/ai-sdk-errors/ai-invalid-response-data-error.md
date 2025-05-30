# AI_InvalidResponseDataError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-invalid-response-data-error
description: Learn how to fix AI_InvalidResponseDataError
---


# [AI\_InvalidResponseDataError](#ai_invalidresponsedataerror)


This error occurs when the server returns a response with invalid data content.


## [Properties](#properties)


-   `data`: The invalid response data value
-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_InvalidResponseDataError` using:

```
import{InvalidResponseDataError}from'ai';if(InvalidResponseDataError.isInstance(error)){// Handle the error}
```
