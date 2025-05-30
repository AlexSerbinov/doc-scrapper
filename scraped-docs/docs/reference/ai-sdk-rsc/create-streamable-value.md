# createStreamableValue


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-rsc/create-streamable-value
description: Reference for the createStreamableValue function from the AI SDK RSC
---


# [`createStreamableValue`](#createstreamablevalue)


AI SDK RSC is currently experimental. We recommend using [AI SDK UI](/docs/ai-sdk-ui/overview) for production. For guidance on migrating from RSC to UI, see our [migration guide](/docs/ai-sdk-rsc/migrating-to-ui).

Create a stream that sends values from the server to the client. The value can be any serializable data.


## [Import](#import)


import { createStreamableValue } from "ai/rsc"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### value:


any

Any data that RSC supports. Example, JSON.


### [Returns](#returns)



### value:


streamable

This creates a special value that can be returned from Actions to the client. It holds the data inside and can be updated via the update method.
