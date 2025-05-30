# generateId()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-id
description: Generate a unique identifier (API Reference)
---


# [`generateId()`](#generateid)


Generates a unique identifier. You can optionally provide the length of the ID.

This is the same id generator used by the AI SDK.

```
import{ generateId }from'ai';const id =generateId();
```


## [Import](#import)


import { generateId } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### size:


number

The length of the generated ID. It defaults to 16. This parameter is deprecated and will be removed in the next major version.


### [Returns](#returns)


A string representing the generated ID.


## [See also](#see-also)


-   [`createIdGenerator()`](/docs/reference/ai-sdk-core/create-id-generator)
