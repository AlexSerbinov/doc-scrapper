# Handling Loading State


---
url: https://ai-sdk.dev/docs/ai-sdk-rsc/loading-state
description: Overview of handling loading state with AI SDK RSC
---


# [Handling Loading State](#handling-loading-state)


AI SDK RSC is currently experimental. We recommend using [AI SDK UI](/docs/ai-sdk-ui/overview) for production. For guidance on migrating from RSC to UI, see our [migration guide](/docs/ai-sdk-rsc/migrating-to-ui).

Given that responses from language models can often take a while to complete, it's crucial to be able to show loading state to users. This provides visual feedback that the system is working on their request and helps maintain a positive user experience.

There are three approaches you can take to handle loading state with the AI SDK RSC:

-   Managing loading state similar to how you would in a traditional Next.js application. This involves setting a loading state variable in the client and updating it when the response is received.
-   Streaming loading state from the server to the client. This approach allows you to track loading state on a more granular level and provide more detailed feedback to the user.
-   Streaming loading component from the server to the client. This approach allows you to stream a React Server Component to the client while awaiting the model's response.


## [Handling Loading State on the Client](#handling-loading-state-on-the-client)



### [Client](#client)


Let's create a simple Next.js page that will call the `generateResponse` function when the form is submitted. The function will take in the user's prompt (`input`) and then generate a response (`response`). To handle the loading state, use the `loading` state variable. When the form is submitted, set `loading` to `true`, and when the response is received, set it back to `false`. While the response is being streamed, the input field will be disabled.

app/page.tsx

```
'use client';import{ useState }from'react';import{ generateResponse }from'./actions';import{ readStreamableValue }from'ai/rsc';// Force the page to be dynamic and allow streaming responses up to 30 secondsexportconst maxDuration =30;exportdefaultfunctionHome(){const[input, setInput]=useState<string>('');const[generation, setGeneration]=useState<string>('');const[loading, setLoading]=useState<boolean>(false);return(<div><div>{generation}</div><form        onSubmit={asynce=>{          e.preventDefault();setLoading(true);const response =awaitgenerateResponse(input);let textContent ='';forawait(const delta ofreadStreamableValue(response)){            textContent =`${textContent}${delta}`;setGeneration(textContent);}setInput('');setLoading(false);}}><inputtype="text"value={input}disabled={loading}className="disabled:opacity-50"onChange={event=>{setInput(event.target.value);}}/><button>SendMessage</button></form></div>);}
```


### [Server](#server)


Now let's implement the `generateResponse` function. Use the `streamText` function to generate a response to the input.

app/actions.ts

```
'use server';import{ streamText }from'ai';import{ openai }from'@ai-sdk/openai';import{ createStreamableValue }from'ai/rsc';exportasyncfunctiongenerateResponse(prompt:string){const stream =createStreamableValue();(async()=>{const{ textStream }=streamText({      model:openai('gpt-4o'),      prompt,});forawait(const text of textStream){      stream.update(text);}    stream.done();})();return stream.value;}
```


## [Streaming Loading State from the Server](#streaming-loading-state-from-the-server)


If you are looking to track loading state on a more granular level, you can create a new streamable value to store a custom variable and then read this on the frontend. Let's update the example to create a new streamable value for tracking loading state:


### [Server](#server-1)


app/actions.ts

```
'use server';import{ streamText }from'ai';import{ openai }from'@ai-sdk/openai';import{ createStreamableValue }from'ai/rsc';exportasyncfunctiongenerateResponse(prompt:string){const stream =createStreamableValue();const loadingState =createStreamableValue({ loading:true});(async()=>{const{ textStream }=streamText({      model:openai('gpt-4o'),      prompt,});forawait(const text of textStream){      stream.update(text);}    stream.done();    loadingState.done({ loading:false});})();return{ response: stream.value, loadingState: loadingState.value};}
```


### [Client](#client-1)


app/page.tsx

```
'use client';import{ useState }from'react';import{ generateResponse }from'./actions';import{ readStreamableValue }from'ai/rsc';// Force the page to be dynamic and allow streaming responses up to 30 secondsexportconst maxDuration =30;exportdefaultfunctionHome(){const[input, setInput]=useState<string>('');const[generation, setGeneration]=useState<string>('');const[loading, setLoading]=useState<boolean>(false);return(<div><div>{generation}</div><form        onSubmit={asynce=>{          e.preventDefault();setLoading(true);const{ response, loadingState }=awaitgenerateResponse(input);let textContent ='';forawait(const responseDelta ofreadStreamableValue(response)){            textContent =`${textContent}${responseDelta}`;setGeneration(textContent);}forawait(const loadingDelta ofreadStreamableValue(loadingState)){if(loadingDelta){setLoading(loadingDelta.loading);}}setInput('');setLoading(false);}}><inputtype="text"value={input}disabled={loading}className="disabled:opacity-50"onChange={event=>{setInput(event.target.value);}}/><button>SendMessage</button></form></div>);}
```

This allows you to provide more detailed feedback about the generation process to your users.


## [Streaming Loading Components with `streamUI`](#streaming-loading-components-with-streamui)


If you are using the [`streamUI`](/docs/reference/ai-sdk-rsc/stream-ui) function, you can stream the loading state to the client in the form of a React component. `streamUI` supports the usage of [JavaScript generator functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) , which allow you to yield some value (in this case a React component) while some other blocking work completes.


## [Server](#server-2)


```
'use server';import{ openai }from'@ai-sdk/openai';import{ streamUI }from'ai/rsc';exportasyncfunctiongenerateResponse(prompt:string){const result =awaitstreamUI({    model:openai('gpt-4o'),    prompt,text:asyncfunction*({ content }){yield<div>loading...</div>;return<div>{content}</div>;},});return result.value;}
```

Remember to update the file from `.ts` to `.tsx` because you are defining a React component in the `streamUI` function.


## [Client](#client-2)


```
'use client';import{ useState }from'react';import{ generateResponse }from'./actions';import{ readStreamableValue }from'ai/rsc';// Force the page to be dynamic and allow streaming responses up to 30 secondsexportconst maxDuration =30;exportdefaultfunctionHome(){const[input, setInput]=useState<string>('');const[generation, setGeneration]=useState<React.ReactNode>();return(<div><div>{generation}</div><formonSubmit={asynce=>{          e.preventDefault();const result =awaitgenerateResponse(input);setGeneration(result);setInput('');}}><inputtype="text"value={input}onChange={event=>{setInput(event.target.value);}}/><button>SendMessage</button></form></div>);}
```
