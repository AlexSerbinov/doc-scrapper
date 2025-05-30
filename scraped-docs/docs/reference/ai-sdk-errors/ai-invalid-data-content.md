# AI_InvalidDataContent


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-invalid-data-content
description: Learn how to fix AI_InvalidDataContent
---


# [AI\_InvalidDataContent](#ai_invaliddatacontent)


This error occurs when invalid data content is provided.


## [Properties](#properties)


-   `content`: The invalid content value
-   `message`: The error message
-   `cause`: The cause of the error


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_InvalidDataContent` using:

```
import{InvalidDataContent}from'ai';if(InvalidDataContent.isInstance(error)){// Handle the error}
```
