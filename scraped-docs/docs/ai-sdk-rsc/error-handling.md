# Error Handling


---
url: https://ai-sdk.dev/docs/ai-sdk-rsc/error-handling
description: Learn how to handle errors with the AI SDK.
---


# [Error Handling](#error-handling)


AI SDK RSC is currently experimental. We recommend using [AI SDK UI](/docs/ai-sdk-ui/overview) for production. For guidance on migrating from RSC to UI, see our [migration guide](/docs/ai-sdk-rsc/migrating-to-ui).

Two categories of errors can occur when working with the RSC API: errors while streaming user interfaces and errors while streaming other values.


## [Handling UI Errors](#handling-ui-errors)


To handle errors while generating UI, the [`streamableUI`](/docs/reference/ai-sdk-rsc/create-streamable-ui) object exposes an `error()` method.

app/actions.tsx

```
'use server';import{ createStreamableUI }from'ai/rsc';exportasyncfunctiongetStreamedUI(){const ui =createStreamableUI();(async()=>{    ui.update(<div>loading</div>);const data =awaitfetchData();    ui.done(<div>{data}</div>);})().catch(e=>{    ui.error(<div>Error:{e.message}</div>);});return ui.value;}
```

With this method, you can catch any error with the stream, and return relevant UI. On the client, you can also use a [React Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) to wrap the streamed component and catch any additional errors.

app/page.tsx

```
import{ getStreamedUI }from'@/actions';import{ useState }from'react';import{ErrorBoundary}from'./ErrorBoundary';exportdefaultfunctionPage(){const[streamedUI, setStreamedUI]=useState(null);return(<div><buttononClick={async()=>{const newUI =awaitgetStreamedUI();setStreamedUI(newUI);}}>What does the newUI look like?</button><ErrorBoundary>{streamedUI}</ErrorBoundary></div>);}
```


## [Handling Other Errors](#handling-other-errors)


To handle other errors while streaming, you can return an error object that the receiver can use to determine why the failure occurred.

app/actions.tsx

```
'use server';import{ createStreamableValue }from'ai/rsc';import{ fetchData, emptyData }from'../utils/data';exportconstgetStreamedData=async()=>{const streamableData =createStreamableValue<string>(emptyData);try{(()=>{const data1 =awaitfetchData();      streamableData.update(data1);const data2 =awaitfetchData();      streamableData.update(data2);const data3 =awaitfetchData();      streamableData.done(data3);})();return{ data: streamableData.value };}catch(e){return{ error: e.message };}};
```
