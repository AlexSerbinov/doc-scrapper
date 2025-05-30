# createIdGenerator()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/create-id-generator
description: Create a customizable unique identifier generator (API Reference)
---


# [`createIdGenerator()`](#createidgenerator)


Creates a customizable ID generator function. You can configure the alphabet, prefix, separator, and default size of the generated IDs.

```
import{ createIdGenerator }from'ai';const generateCustomId =createIdGenerator({  prefix:'user',  separator:'_',});const id =generateCustomId();// Example: "user_1a2b3c4d5e6f7g8h"
```


## [Import](#import)


import { createIdGenerator } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### options:


object

Optional configuration object with the following properties:


### options.alphabet:


string

The characters to use for generating the random part of the ID. Defaults to alphanumeric characters (0-9, A-Z, a-z).


### options.prefix:


string

A string to prepend to all generated IDs. Defaults to none.


### options.separator:


string

The character(s) to use between the prefix and the random part. Defaults to "-".


### options.size:


number

The default length of the random part of the ID. Defaults to 16.


### [Returns](#returns)


Returns a function that generates IDs based on the configured options.


### [Notes](#notes)


-   The generator uses non-secure random generation and should not be used for security-critical purposes.
-   The separator character must not be part of the alphabet to ensure reliable prefix checking.


## [Example](#example)


```
// Create a custom ID generator for user IDsconst generateUserId =createIdGenerator({  prefix:'user',  separator:'_',  size:8,});// Generate IDsconst id1 =generateUserId();// e.g., "user_1a2b3c4d"
```


## [See also](#see-also)


-   [`generateId()`](/docs/reference/ai-sdk-core/generate-id)
