# createAI


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-rsc/create-ai
description: Reference for the createAI function from the AI SDK RSC
---


# [`createAI`](#createai)


AI SDK RSC is currently experimental. We recommend using [AI SDK UI](/docs/ai-sdk-ui/overview) for production. For guidance on migrating from RSC to UI, see our [migration guide](/docs/ai-sdk-rsc/migrating-to-ui).

Creates a client-server context provider that can be used to wrap parts of your application tree to easily manage both UI and AI states of your application.


## [Import](#import)


import { createAI } from "ai/rsc"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### actions:


Record<string, Action>

Server side actions that can be called from the client.


### initialAIState:


any

Initial AI state to be used in the client.


### initialUIState:


any

Initial UI state to be used in the client.


### onGetUIState:


() => UIState

is called during SSR to compare and update UI state.


### onSetAIState:


(Event) => void

is triggered whenever an update() or done() is called by the mutable AI state in your action, so you can safely store your AI state in the database.

Event


### state:


AIState

The resulting AI state after the update.


### done:


boolean

Whether the AI state updates have been finalized or not.


### [Returns](#returns)


It returns an `<AI/>` context provider.


## [Examples](#examples)


[

Learn to manage AI and UI states in Next.js

](/examples/next-app/state-management/ai-ui-states)[

Learn to persist and restore states UI/AI states in Next.js

](/examples/next-app/state-management/save-and-restore-states)
