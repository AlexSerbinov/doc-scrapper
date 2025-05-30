# AI_LoadSettingError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-load-setting-error
description: Learn how to fix AI_LoadSettingError
---


# [AI\_LoadSettingError](#ai_loadsettingerror)


This error occurs when a setting is not loaded successfully.


## [Properties](#properties)


-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_LoadSettingError` using:

```
import{LoadSettingError}from'ai';if(LoadSettingError.isInstance(error)){// Handle the error}
```
