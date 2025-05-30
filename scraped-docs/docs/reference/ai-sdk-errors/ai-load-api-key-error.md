# AI_LoadAPIKeyError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-load-api-key-error
description: Learn how to fix AI_LoadAPIKeyError
---


# [AI\_LoadAPIKeyError](#ai_loadapikeyerror)


This error occurs when API key is not loaded successfully.


## [Properties](#properties)


-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_LoadAPIKeyError` using:

```
import{LoadAPIKeyError}from'ai';if(LoadAPIKeyError.isInstance(error)){// Handle the error}
```
