# AI_InvalidDataContentError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-invalid-data-content-error
description: How to fix AI_InvalidDataContentError
---


# [AI\_InvalidDataContentError](#ai_invaliddatacontenterror)


This error occurs when the data content provided in a multi-modal message part is invalid. Check out the [prompt examples for multi-modal messages](/docs/foundations/prompts#message-prompts) .


## [Properties](#properties)


-   `content`: The invalid content value
-   `message`: The error message describing the expected and received content types


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_InvalidDataContentError` using:

```
import{InvalidDataContentError}from'ai';if(InvalidDataContentError.isInstance(error)){// Handle the error}
```
