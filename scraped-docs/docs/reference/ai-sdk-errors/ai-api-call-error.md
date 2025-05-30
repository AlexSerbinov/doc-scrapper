# AI_APICallError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-api-call-error
description: Learn how to fix AI_APICallError
---


# [AI\_APICallError](#ai_apicallerror)


This error occurs when an API call fails.


## [Properties](#properties)


-   `url`: The URL of the API request that failed
-   `requestBodyValues`: The request body values sent to the API
-   `statusCode`: The HTTP status code returned by the API
-   `responseHeaders`: The response headers returned by the API
-   `responseBody`: The response body returned by the API
-   `isRetryable`: Whether the request can be retried based on the status code
-   `data`: Any additional data associated with the error


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_APICallError` using:

```
import{APICallError}from'ai';if(APICallError.isInstance(error)){// Handle the error}
```
