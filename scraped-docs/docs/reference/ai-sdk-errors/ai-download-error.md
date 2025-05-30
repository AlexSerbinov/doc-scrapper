# AI_DownloadError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-download-error
description: Learn how to fix AI_DownloadError
---


# [AI\_DownloadError](#ai_downloaderror)


This error occurs when a download fails.


## [Properties](#properties)


-   `url`: The URL that failed to download
-   `statusCode`: The HTTP status code returned by the server
-   `statusText`: The HTTP status text returned by the server
-   `message`: The error message containing details about the download failure


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_DownloadError` using:

```
import{DownloadError}from'ai';if(DownloadError.isInstance(error)){// Handle the error}
```
