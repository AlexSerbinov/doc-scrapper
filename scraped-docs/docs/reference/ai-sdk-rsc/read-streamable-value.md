# readStreamableValue


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-rsc/read-streamable-value
description: Reference for the readStreamableValue function from the AI SDK RSC
---


# [`readStreamableValue`](#readstreamablevalue)


AI SDK RSC is currently experimental. We recommend using [AI SDK UI](/docs/ai-sdk-ui/overview) for production. For guidance on migrating from RSC to UI, see our [migration guide](/docs/ai-sdk-rsc/migrating-to-ui).

It is a function that helps you read the streamable value from the client that was originally created using [`createStreamableValue`](/docs/reference/ai-sdk-rsc/create-streamable-value) on the server.


## [Import](#import)


import { readStreamableValue } from "ai/rsc"


## [Example](#example)


app/actions.ts

```
asyncfunctiongenerate(){'use server';const streamable =createStreamableValue();  streamable.update(1);  streamable.update(2);  streamable.done(3);return streamable.value;}
```

app/page.tsx

```
import{ readStreamableValue }from'ai/rsc';exportdefaultfunctionPage(){const[generation, setGeneration]=useState('');return(<div><buttononClick={async()=>{const stream =awaitgenerate();forawait(const delta ofreadStreamableValue(stream)){setGeneration(generation=> generation + delta);}}}>Generate</button></div>);}
```


## [API Signature](#api-signature)



### [Parameters](#parameters)



### stream:


StreamableValue

The streamable value to read from.


### [Returns](#returns)


It returns an async iterator that contains the values emitted by the streamable value.
