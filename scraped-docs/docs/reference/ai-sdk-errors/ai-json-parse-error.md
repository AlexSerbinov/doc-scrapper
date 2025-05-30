# AI_JSONParseError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-json-parse-error
description: Learn how to fix AI_JSONParseError
---


# [AI\_JSONParseError](#ai_jsonparseerror)


This error occurs when JSON fails to parse.


## [Properties](#properties)


-   `text`: The text value that could not be parsed
-   `message`: The error message including parse error details


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_JSONParseError` using:

```
import{JSONParseError}from'ai';if(JSONParseError.isInstance(error)){// Handle the error}
```
