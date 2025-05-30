# Render Visual Interface in Chat


---
url: https://ai-sdk.dev/cookbook/rsc/render-visual-interface-in-chat
description: Learn how to generate text using the AI SDK and React Server Components.
---


# [Render Visual Interface in Chat](#render-visual-interface-in-chat)


We've now seen how a language model can call a function and render a component based on a conversation with the user.

When we define multiple functions in [`tools`](/docs/reference/ai-sdk-core/generate-text#tools), it is possible for the model to reason out the right functions to call based on whatever the user's intent is. This means that you can write a bunch of functions without the burden of implementing complex routing logic to run them.


## [Client](#client)


app/page.tsx

```
'use client';import{ useState }from'react';import{ClientMessage}from'./actions';import{ useActions, useUIState }from'ai/rsc';import{ generateId }from'ai';// Allow streaming responses up to 30 secondsexportconst maxDuration =30;exportdefaultfunctionHome(){const[input, setInput]=useState<string>('');const[conversation, setConversation]=useUIState();const{ continueConversation }=useActions();return(<div><div>{conversation.map((message: ClientMessage)=>(<divkey={message.id}>{message.role}:{message.display}</div>))}</div><div><inputtype="text"value={input}onChange={event=>{setInput(event.target.value);}}/><buttononClick={async()=>{setConversation((currentConversation: ClientMessage[])=>[...currentConversation,{ id:generateId(), role:'user', display: input },]);const message =awaitcontinueConversation(input);setConversation((currentConversation: ClientMessage[])=>[...currentConversation,              message,]);}}>SendMessage</button></div></div>);}
```

components/stock.tsx

```
exportasyncfunctionStock({ symbol, numOfMonths }){const data =awaitfetch(`https://api.example.com/stock/${symbol}/${numOfMonths}`,);return(<div><div>{symbol}</div><div>{data.timeline.map(data=>(<div><div>{data.date}</div><div>{data.value}</div></div>))}</div></div>);}
```

components/flight.tsx

```
exportasyncfunctionFlight({ flightNumber }){const data =awaitfetch(`https://api.example.com/flight/${flightNumber}`);return(<div><div>{flightNumber}</div><div>{data.status}</div><div>{data.source}</div><div>{data.destination}</div></div>);}
```


## [Server](#server)


app/actions.tsx

```
'use server';import{ getMutableAIState, streamUI }from'ai/rsc';import{ openai }from'@ai-sdk/openai';import{ReactNode}from'react';import{ z }from'zod';import{ generateId }from'ai';import{Stock}from'@/components/stock';import{Flight}from'@/components/flight';exportinterfaceServerMessage{  role:'user'|'assistant';  content:string;}exportinterfaceClientMessage{  id:string;  role:'user'|'assistant';  display:ReactNode;}exportasyncfunctioncontinueConversation(input: string,):Promise<ClientMessage>{'use server';const history =getMutableAIState();const result =awaitstreamUI({    model:openai('gpt-3.5-turbo'),    messages:[...history.get(),{ role:'user', content: input }],text:({ content, done })=>{if(done){        history.done((messages: ServerMessage[])=>[...messages,{ role:'assistant', content },]);}return<div>{content}</div>;},    tools:{      showStockInformation:{        description:'Get stock information for symbol for the last numOfMonths months',        parameters: z.object({symbol: z.string().describe('The stock symbol to get information for'),          numOfMonths: z.number().describe('The number of months to get historical information for'),}),generate:async({ symbol, numOfMonths })=>{          history.done((messages: ServerMessage[])=>[...messages,{              role:'assistant',              content:`Showing stock information for ${symbol}`,},]);return<Stocksymbol={symbol}numOfMonths={numOfMonths}/>;},},      showFlightStatus:{        description:'Get the status of a flight',        parameters: z.object({          flightNumber: z.string().describe('The flight number to get status for'),}),generate:async({ flightNumber })=>{          history.done((messages: ServerMessage[])=>[...messages,{              role:'assistant',              content:`Showing flight status for ${flightNumber}`,},]);return<FlightflightNumber={flightNumber}/>;},},},});return{    id:generateId(),    role:'assistant',    display: result.value,};}
```

app/ai.ts

```
import{ createAI }from'ai/rsc';import{ServerMessage,ClientMessage, continueConversation }from'./actions';exportconstAI=createAI<ServerMessage[],ClientMessage[]>({  actions:{    continueConversation,},  initialAIState:[],  initialUIState:[],});
```
