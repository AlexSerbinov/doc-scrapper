# AI_MessageConversionError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-message-conversion-error
description: Learn how to fix AI_MessageConversionError
---


# [AI\_MessageConversionError](#ai_messageconversionerror)


This error occurs when message conversion fails.


## [Properties](#properties)


-   `originalMessage`: The original message that failed conversion
-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_MessageConversionError` using:

```
import{MessageConversionError}from'ai';if(MessageConversionError.isInstance(error)){// Handle the error}
```
