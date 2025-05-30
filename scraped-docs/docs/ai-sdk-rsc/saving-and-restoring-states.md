# Saving and Restoring States


---
url: https://ai-sdk.dev/docs/ai-sdk-rsc/saving-and-restoring-states
description: Saving and restoring AI and UI states with onGetUIState and onSetAIState
---


# [Saving and Restoring States](#saving-and-restoring-states)


AI SDK RSC is currently experimental. We recommend using [AI SDK UI](/docs/ai-sdk-ui/overview) for production. For guidance on migrating from RSC to UI, see our [migration guide](/docs/ai-sdk-rsc/migrating-to-ui).

AI SDK RSC provides convenient methods for saving and restoring AI and UI state. This is useful for saving the state of your application after every model generation, and restoring it when the user revisits the generations.


## [AI State](#ai-state)



### [Saving AI state](#saving-ai-state)


The AI state can be saved using the [`onSetAIState`](/docs/reference/ai-sdk-rsc/create-ai#on-set-ai-state) callback, which gets called whenever the AI state is updated. In the following example, you save the chat history to a database whenever the generation is marked as done.

app/ai.ts

```
exportconstAI=createAI<ServerMessage[],ClientMessage[]>({  actions:{    continueConversation,},onSetAIState:async({ state, done })=>{'use server';if(done){saveChatToDB(state);}},});
```


### [Restoring AI state](#restoring-ai-state)


The AI state can be restored using the [`initialAIState`](/docs/reference/ai-sdk-rsc/create-ai#initial-ai-state) prop passed to the context provider created by the [`createAI`](/docs/reference/ai-sdk-rsc/create-ai) function. In the following example, you restore the chat history from a database when the component is mounted.

```
import{ReactNode}from'react';import{AI}from'./ai';exportdefaultasyncfunctionRootLayout({  children,}: Readonly<{ children: ReactNode }>){const chat =awaitloadChatFromDB();return(<htmllang="en"><body><AIinitialAIState={chat}>{children}</AI></body></html>);}
```


## [UI State](#ui-state)



### [Saving UI state](#saving-ui-state)


The UI state cannot be saved directly, since the contents aren't yet serializable. Instead, you can use the AI state as proxy to store details about the UI state and use it to restore the UI state when needed.


### [Restoring UI state](#restoring-ui-state)


The UI state can be restored using the AI state as a proxy. In the following example, you restore the chat history from the AI state when the component is mounted. You use the [`onGetUIState`](/docs/reference/ai-sdk-rsc/create-ai#on-get-ui-state) callback to listen for SSR events and restore the UI state.

app/ai.ts

```
exportconstAI=createAI<ServerMessage[],ClientMessage[]>({  actions:{    continueConversation,},onGetUIState:async()=>{'use server';const historyFromDB:ServerMessage[]=awaitloadChatFromDB();const historyFromApp:ServerMessage[]=getAIState();// If the history from the database is different from the// history in the app, they're not in sync so return the UIState// based on the history from the databaseif(historyFromDB.length !== historyFromApp.length){return historyFromDB.map(({ role, content })=>({        id:generateId(),        role,        display:          role ==='function'?(<Component{...JSON.parse(content)}/>):(            content),}));}},});
```

To learn more, check out this [example](/examples/next-app/state-management/save-and-restore-states) that persists and restores states in your Next.js application.

Next, you will learn how you can use `ai/rsc` functions like `useActions` and `useUIState` to create interactive, multistep interfaces.
