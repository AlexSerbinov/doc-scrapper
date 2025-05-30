# Migrating from RSC to UI


---
url: https://ai-sdk.dev/docs/ai-sdk-rsc/migrating-to-ui
description: Learn how to migrate from AI SDK RSC to AI SDK UI.
---


# [Migrating from RSC to UI](#migrating-from-rsc-to-ui)


This guide helps you migrate from AI SDK RSC to AI SDK UI.


## [Background](#background)


The AI SDK has two packages that help you build the frontend for your applications – [AI SDK UI](/docs/ai-sdk-ui) and [AI SDK RSC](/docs/ai-sdk-rsc).

We introduced support for using [React Server Components](https://react.dev/reference/rsc/server-components) (RSC) within the AI SDK to simplify building generative user interfaces for frameworks that support RSC.

However, given we're pushing the boundaries of this technology, AI SDK RSC currently faces significant limitations that make it unsuitable for stable production use.

-   It is not possible to abort a stream using server actions. This will be improved in future releases of React and Next.js [(1122)](https://github.com/vercel/ai/issues/1122).
-   When using `createStreamableUI` and `streamUI`, components remount on `.done()`, causing them to flicker [(2939)](https://github.com/vercel/ai/issues/2939).
-   Many suspense boundaries can lead to crashes [(2843)](https://github.com/vercel/ai/issues/2843).
-   Using `createStreamableUI` can lead to quadratic data transfer. You can avoid this using createStreamableValue instead, and rendering the component client-side.
-   Closed RSC streams cause update issues [(3007)](https://github.com/vercel/ai/issues/3007).

Due to these limitations, AI SDK RSC is marked as experimental, and we do not recommend using it for stable production environments.

As a result, we strongly recommend migrating to AI SDK UI, which has undergone extensive development to provide a more stable and production grade experience.

In building [v0](https://v0.dev), we have invested considerable time exploring how to create the best chat experience on the web. AI SDK UI ships with many of these best practices and commonly used patterns like [language model middleware](/docs/ai-sdk-core/middleware), [multi-step tool calls](/docs/ai-sdk-core/tools-and-tool-calling#multi-step-calls), [attachments](/docs/ai-sdk-ui/chatbot#attachments-experimental), [telemetry](/docs/ai-sdk-core/telemetry), [provider registry](/docs/ai-sdk-core/provider-management#provider-registry), and many more. These features have been considerately designed into a neat abstraction that you can use to reliably integrate AI into your applications.


## [Streaming Chat Completions](#streaming-chat-completions)



### [Basic Setup](#basic-setup)


The `streamUI` function executes as part of a server action as illustrated below.


#### [Before: Handle generation and rendering in a single server action](#before-handle-generation-and-rendering-in-a-single-server-action)


@/app/actions.tsx

```
import{ openai }from'@ai-sdk/openai';import{ getMutableAIState, streamUI }from'ai/rsc';exportasyncfunctionsendMessage(message: string){'use server';const messages =getMutableAIState('messages');  messages.update([...messages.get(),{ role:'user', content: message }]);const{ value: stream }=awaitstreamUI({    model:openai('gpt-4o'),    system:'you are a friendly assistant!',    messages: messages.get(),text:asyncfunction*({ content, done }){// process text},    tools:{// tool definitions},});return stream;}
```


#### [Before: Call server action and update UI state](#before-call-server-action-and-update-ui-state)


The chat interface calls the server action. The response is then saved using the `useUIState` hook.

@/app/page.tsx

```
'use client';import{ useState,ReactNode}from'react';import{ useActions, useUIState }from'ai/rsc';exportdefaultfunctionPage(){const{ sendMessage }=useActions();const[input, setInput]=useState('');const[messages, setMessages]=useUIState();return(<div>{messages.map(message=> message)}<formonSubmit={async()=>{const response:ReactNode=awaitsendMessage(input);setMessages(msgs=>[...msgs, response]);}}><inputtype="text"/><buttontype="submit">Submit</button></form></div>);}
```

The `streamUI` function combines generating text and rendering the user interface. To migrate to AI SDK UI, you need to **separate these concerns** – streaming generations with `streamText` and rendering the UI with `useChat`.


#### [After: Replace server action with route handler](#after-replace-server-action-with-route-handler)


The `streamText` function executes as part of a route handler and streams the response to the client. The `useChat` hook on the client decodes this stream and renders the response within the chat interface.

@/app/api/chat/route.ts

```
import{ streamText }from'ai';import{ openai }from'@ai-sdk/openai';exportasyncfunctionPOST(request){const{ messages }=await request.json();const result =streamText({    model:openai('gpt-4o'),    system:'you are a friendly assistant!',    messages,    tools:{// tool definitions},});return result.toDataStreamResponse();}
```


#### [After: Update client to use chat hook](#after-update-client-to-use-chat-hook)


@/app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionPage(){const{ messages, input, setInput, handleSubmit }=useChat();return(<div>{messages.map(message=>(<divkey={message.id}><div>{message.role}</div><div>{message.content}</div></div>))}<formonSubmit={handleSubmit}><inputtype="text"value={input}onChange={event=>{setInput(event.target.value);}}/><buttontype="submit">Send</button></form></div>);}
```


### [Parallel Tool Calls](#parallel-tool-calls)


In AI SDK RSC, `streamUI` does not support parallel tool calls. You will have to use a combination of `streamText`, `createStreamableUI` and `createStreamableValue`.

With AI SDK UI, `useChat` comes with built-in support for parallel tool calls. You can define multiple tools in the `streamText` and have them called them in parallel. The `useChat` hook will then handle the parallel tool calls for you automatically.


### [Multi-Step Tool Calls](#multi-step-tool-calls)


In AI SDK RSC, `streamUI` does not support multi-step tool calls. You will have to use a combination of `streamText`, `createStreamableUI` and `createStreamableValue`.

With AI SDK UI, `useChat` comes with built-in support for multi-step tool calls. You can set `maxSteps` in the `streamText` function to define the number of steps the language model can make in a single call. The `useChat` hook will then handle the multi-step tool calls for you automatically.


### [Generative User Interfaces](#generative-user-interfaces)


The `streamUI` function uses `tools` as a way to execute functions based on user input and renders React components based on the function output to go beyond text in the chat interface.


#### [Before: Render components within the server action and stream to client](#before-render-components-within-the-server-action-and-stream-to-client)


@/app/actions.tsx

```
import{ z }from'zod';import{ streamUI }from'ai/rsc';import{ openai }from'@ai-sdk/openai';import{ getWeather }from'@/utils/queries';import{Weather}from'@/components/weather';const{ value: stream }=awaitstreamUI({  model:openai('gpt-4o'),  system:'you are a friendly assistant!',  messages,text:asyncfunction*({ content, done }){// process text},  tools:{    displayWeather:{      description:'Display the weather for a location',      parameters: z.object({        latitude: z.number(),        longitude: z.number(),}),generate:asyncfunction*({ latitude, longitude }){yield<div>Loading weather...</div>;const{ value, unit }=awaitgetWeather({ latitude, longitude });return<Weathervalue={value}unit={unit}/>;},},},});
```

As mentioned earlier, `streamUI` generates text and renders the React component in a single server action call.


#### [After: Replace with route handler and stream props data to client](#after-replace-with-route-handler-and-stream-props-data-to-client)


The `streamText` function streams the props data as response to the client, while `useChat` decode the stream as `toolInvocations` and renders the chat interface.

@/app/api/chat/route.ts

```
import{ z }from'zod';import{ openai }from'@ai-sdk/openai';import{ getWeather }from'@/utils/queries';import{ streamText }from'ai';exportasyncfunctionPOST(request){const{ messages }=await request.json();const result =streamText({    model:openai('gpt-4o'),    system:'you are a friendly assistant!',    messages,    tools:{      displayWeather:{        description:'Display the weather for a location',        parameters: z.object({          latitude: z.number(),          longitude: z.number(),}),execute:asyncfunction({ latitude, longitude }){const props =awaitgetWeather({ latitude, longitude });return props;},},},});return result.toDataStreamResponse();}
```


#### [After: Update client to use chat hook and render components using tool invocations](#after-update-client-to-use-chat-hook-and-render-components-using-tool-invocations)


@/app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';import{Weather}from'@/components/weather';exportdefaultfunctionPage(){const{ messages, input, setInput, handleSubmit }=useChat();return(<div>{messages.map(message=>(<divkey={message.id}><div>{message.role}</div><div>{message.content}</div><div>{message.toolInvocations.map(toolInvocation=>{const{ toolName, toolCallId, state }= toolInvocation;if(state ==='result'){const{ result }= toolInvocation;return(<divkey={toolCallId}>{toolName ==='displayWeather'?(<WeatherweatherAtLocation={result}/>):null}</div>);}else{return(<divkey={toolCallId}>{toolName ==='displayWeather'?(<div>Loading weather...</div>):null}</div>);}})}</div></div>))}<formonSubmit={handleSubmit}><inputtype="text"value={input}onChange={event=>{setInput(event.target.value);}}/><buttontype="submit">Send</button></form></div>);}
```


### [Handling Client Interactions](#handling-client-interactions)


With AI SDK RSC, components streamed to the client can trigger subsequent generations by calling the relevant server action using the `useActions` hooks. This is possible as long as the component is a descendant of the `<AI/>` context provider.


#### [Before: Use actions hook to send messages](#before-use-actions-hook-to-send-messages)


@/app/components/list-flights.tsx

```
'use client';import{ useActions, useUIState }from'ai/rsc';exportfunctionListFlights({ flights }){const{ sendMessage }=useActions();const[_, setMessages]=useUIState();return(<div>{flights.map(flight=>(<divkey={flight.id}onClick={async()=>{const response =awaitsendMessage(`I would like to choose flight ${flight.id}!`,);setMessages(msgs=>[...msgs, response]);}}>{flight.name}</div>))}</div>);}
```


#### [After: Use another chat hook with same ID from the component](#after-use-another-chat-hook-with-same-id-from-the-component)


After switching to AI SDK UI, these messages are synced by initializing the `useChat` hook in the component with the same `id` as the parent component.

@/app/components/list-flights.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';exportfunctionListFlights({ chatId, flights }){const{ append }=useChat({    id: chatId,    body:{ id: chatId },    maxSteps:5,});return(<div>{flights.map(flight=>(<div          key={flight.id}          onClick={async()=>{awaitappend({              role:'user',              content:`I would like to choose flight ${flight.id}!`,});}}>{flight.name}</div>))}</div>);}
```


### [Loading Indicators](#loading-indicators)


In AI SDK RSC, you can use the `initial` parameter of `streamUI` to define the component to display while the generation is in progress.


#### [Before: Use `loading` to show loading indicator](#before-use-loading-to-show-loading-indicator)


@/app/actions.tsx

```
import{ openai }from'@ai-sdk/openai';import{ streamUI }from'ai/rsc';const{ value: stream }=awaitstreamUI({  model:openai('gpt-4o'),  system:'you are a friendly assistant!',  messages,  initial:<div>Loading...</div>,text:asyncfunction*({ content, done }){// process text},  tools:{// tool definitions},});return stream;
```

With AI SDK UI, you can use the tool invocation state to show a loading indicator while the tool is executing.


#### [After: Use tool invocation state to show loading indicator](#after-use-tool-invocation-state-to-show-loading-indicator)


@/app/components/message.tsx

```
'use client';exportfunctionMessage({ role, content, toolInvocations }){return(<div><div>{role}</div><div>{content}</div>{toolInvocations &&(<div>{toolInvocations.map(toolInvocation=>{const{ toolName, toolCallId, state }= toolInvocation;if(state ==='result'){const{ result }= toolInvocation;return(<divkey={toolCallId}>{toolName ==='getWeather'?(<WeatherweatherAtLocation={result}/>):null}</div>);}else{return(<divkey={toolCallId}>{toolName ==='getWeather'?(<WeatherisLoading={true}/>):(<div>Loading...</div>)}</div>);}})}</div>)}</div>);}
```


### [Saving Chats](#saving-chats)


Before implementing `streamUI` as a server action, you should create an `<AI/>` provider and wrap your application at the root layout to sync the AI and UI states. During initialization, you typically use the `onSetAIState` callback function to track updates to the AI state and save it to the database when `done(...)` is called.


#### [Before: Save chats using callback function of context provider](#before-save-chats-using-callback-function-of-context-provider)


@/app/actions.ts

```
import{ createAI }from'ai/rsc';import{ saveChat }from'@/utils/queries';exportconstAI=createAI({  initialAIState:{},  initialUIState:{},  actions:{// server actions},onSetAIState:async({ state, done })=>{'use server';if(done){awaitsaveChat(state);}},});
```


#### [After: Save chats using callback function of `streamText`](#after-save-chats-using-callback-function-of-streamtext)


With AI SDK UI, you will save chats using the `onFinish` callback function of `streamText` in your route handler.

@/app/api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{ saveChat }from'@/utils/queries';import{ streamText, convertToCoreMessages }from'ai';exportasyncfunctionPOST(request){const{ id, messages }=await request.json();const coreMessages =convertToCoreMessages(messages);const result =streamText({    model:openai('gpt-4o'),    system:'you are a friendly assistant!',    messages: coreMessages,onFinish:async({ response })=>{try{awaitsaveChat({          id,          messages:[...coreMessages,...response.messages],});}catch(error){console.error('Failed to save chat');}},});return result.toDataStreamResponse();}
```


### [Restoring Chats](#restoring-chats)


When using AI SDK RSC, the `useUIState` hook contains the UI state of the chat. When restoring a previously saved chat, the UI state needs to be loaded with messages.

Similar to how you typically save chats in AI SDK RSC, you should use the `onGetUIState` callback function to retrieve the chat from the database, convert it into UI state, and return it to be accessible through `useUIState`.


#### [Before: Load chat from database using callback function of context provider](#before-load-chat-from-database-using-callback-function-of-context-provider)


@/app/actions.ts

```
import{ createAI }from'ai/rsc';import{ loadChatFromDB, convertToUIState }from'@/utils/queries';exportconstAI=createAI({  actions:{// server actions},onGetUIState:async()=>{'use server';const chat =awaitloadChatFromDB();const uiState =convertToUIState(chat);return uiState;},});
```

AI SDK UI uses the `messages` field of `useChat` to store messages. To load messages when `useChat` is mounted, you should use `initialMessages`.

As messages are typically loaded from the database, we can use a server actions inside a Page component to fetch an older chat from the database during static generation and pass the messages as props to the `<Chat/>` component.


#### [After: Load chat from database during static generation of page](#after-load-chat-from-database-during-static-generation-of-page)


@/app/chat/\[id\]/page.tsx

```
import{Chat}from'@/app/components/chat';import{ getChatById }from'@/utils/queries';// link to example implementation: https://github.com/vercel/ai-chatbot/blob/00b125378c998d19ef60b73fe576df0fe5a0e9d4/lib/utils.ts#L87-L127import{ convertToUIMessages }from'@/utils/functions';exportdefaultasyncfunctionPage({ params }:{ params: any }){const{ id }= params;const chatFromDb =awaitgetChatById({ id });const chat:Chat={...chatFromDb,    messages:convertToUIMessages(chatFromDb.messages),};return<Chatkey={id}id={chat.id}initialMessages={chat.messages}/>;}
```


#### [After: Pass chat messages as props and load into chat hook](#after-pass-chat-messages-as-props-and-load-into-chat-hook)


@/app/components/chat.tsx

```
'use client';import{Message}from'ai';import{ useChat }from'@ai-sdk/react';exportfunctionChat({  id,  initialMessages,}:{  id;  initialMessages: Array<Message>;}){const{ messages }=useChat({    id,    initialMessages,});return(<div>{messages.map(message=>(<divkey={message.id}><div>{message.role}</div><div>{message.content}</div></div>))}</div>);}
```


## [Streaming Object Generation](#streaming-object-generation)


The `createStreamableValue` function streams any serializable data from the server to the client. As a result, this function allows you to stream object generations from the server to the client when paired with `streamObject`.


#### [Before: Use streamable value to stream object generations](#before-use-streamable-value-to-stream-object-generations)


@/app/actions.ts

```
import{ streamObject }from'ai';import{ openai }from'@ai-sdk/openai';import{ createStreamableValue }from'ai/rsc';import{ notificationsSchema }from'@/utils/schemas';exportasyncfunctiongenerateSampleNotifications(){'use server';const stream =createStreamableValue();(async()=>{const{ partialObjectStream }=streamObject({      model:openai('gpt-4o'),      system:'generate sample ios messages for testing',      prompt:'messages from a family group chat during diwali, max 4',      schema: notificationsSchema,});forawait(const partialObject of partialObjectStream){      stream.update(partialObject);}})();  stream.done();return{ partialNotificationsStream: stream.value};}
```


#### [Before: Read streamable value and update object](#before-read-streamable-value-and-update-object)


@/app/page.tsx

```
'use client';import{ useState }from'react';import{ readStreamableValue }from'ai/rsc';import{ generateSampleNotifications }from'@/app/actions';exportdefaultfunctionPage(){const[notifications, setNotifications]=useState(null);return(<div><button        onClick={async()=>{const{ partialNotificationsStream }=awaitgenerateSampleNotifications();forawait(const partialNotifications ofreadStreamableValue(            partialNotificationsStream,)){if(partialNotifications){setNotifications(partialNotifications.notifications);}}}}>Generate</button></div>);}
```

To migrate to AI SDK UI, you should use the `useObject` hook and implement `streamObject` within your route handler.


#### [After: Replace with route handler and stream text response](#after-replace-with-route-handler-and-stream-text-response)


@/app/api/object/route.ts

```
import{ streamObject }from'ai';import{ openai }from'@ai-sdk/openai';import{ notificationSchema }from'@/utils/schemas';exportasyncfunctionPOST(req:Request){const context =await req.json();const result =streamObject({    model:openai('gpt-4-turbo'),    schema: notificationSchema,    prompt:`Generate 3 notifications for a messages app in this context:`+ context,});return result.toTextStreamResponse();}
```


#### [After: Use object hook to decode stream and update object](#after-use-object-hook-to-decode-stream-and-update-object)


@/app/page.tsx

```
'use client';import{ useObject }from'@ai-sdk/react';import{ notificationSchema }from'@/utils/schemas';exportdefaultfunctionPage(){const{ object, submit }=useObject({    api:'/api/object',    schema: notificationSchema,});return(<div><buttononClick={()=>submit('Messages during finals week.')}>Generate notifications</button>{object?.notifications?.map((notification, index)=>(<divkey={index}><p>{notification?.name}</p><p>{notification?.message}</p></div>))}</div>);}
```
