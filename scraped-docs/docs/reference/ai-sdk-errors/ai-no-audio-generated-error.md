# AI_NoAudioGeneratedError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-no-audio-generated-error
description: Learn how to fix AI_NoAudioGeneratedError
---


# [AI\_NoAudioGeneratedError](#ai_noaudiogeneratederror)


This error occurs when no audio could be generated from the input.


## [Properties](#properties)


-   `responses`: Array of responses
-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_NoAudioGeneratedError` using:

```
import{NoAudioGeneratedError}from'ai';if(NoAudioGeneratedError.isInstance(error)){// Handle the error}
```
