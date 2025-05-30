# AI_NoTranscriptGeneratedError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-no-transcript-generated-error
description: Learn how to fix AI_NoTranscriptGeneratedError
---


# [AI\_NoTranscriptGeneratedError](#ai_notranscriptgeneratederror)


This error occurs when no transcript could be generated from the input.


## [Properties](#properties)


-   `responses`: Array of responses
-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_NoTranscriptGeneratedError` using:

```
import{NoTranscriptGeneratedError}from'ai';if(NoTranscriptGeneratedError.isInstance(error)){// Handle the error}
```
