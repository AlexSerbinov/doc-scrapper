# AI_NoSuchProviderError


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-no-such-provider-error
description: Learn how to fix AI_NoSuchProviderError
---


# [AI\_NoSuchProviderError](#ai_nosuchprovidererror)


This error occurs when a provider ID is not found.


## [Properties](#properties)


-   `providerId`: The ID of the provider that was not found
-   `availableProviders`: Array of available provider IDs
-   `modelId`: The ID of the model
-   `modelType`: The type of model
-   `message`: The error message


## [Checking for this Error](#checking-for-this-error)


You can check if an error is an instance of `AI_NoSuchProviderError` using:

```
import{NoSuchProviderError}from'ai';if(NoSuchProviderError.isInstance(error)){// Handle the error}
```
