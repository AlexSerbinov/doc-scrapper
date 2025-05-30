# Designing Multistep Interfaces


---
url: https://ai-sdk.dev/docs/ai-sdk-rsc/multistep-interfaces
description: Overview of Building Multistep Interfaces with AI SDK RSC
---


# [Designing Multistep Interfaces](#designing-multistep-interfaces)


AI SDK RSC is currently experimental. We recommend using [AI SDK UI](/docs/ai-sdk-ui/overview) for production. For guidance on migrating from RSC to UI, see our [migration guide](/docs/ai-sdk-rsc/migrating-to-ui).

Multistep interfaces refer to user interfaces that require multiple independent steps to be executed in order to complete a specific task.

For example, if you wanted to build a Generative UI chatbot capable of booking flights, it could have three steps:

-   Search all flights
-   Pick flight
-   Check availability

To build this kind of application you will leverage two concepts, **tool composition** and **application context**.

**Tool composition** is the process of combining multiple [tools](/docs/ai-sdk-core/tools-and-tool-calling) to create a new tool. This is a powerful concept that allows you to break down complex tasks into smaller, more manageable steps. In the example above, *"search all flights"*, *"pick flight"*, and *"check availability"* come together to create a holistic *"book flight"* tool.

**Application context** refers to the state of the application at any given point in time. This includes the user's input, the output of the language model, and any other relevant information. In the example above, the flight selected in *"pick flight"* would be used as context necessary to complete the *"check availability"* task.


## [Overview](#overview)


In order to build a multistep interface with `ai/rsc`, you will need a few things:

-   A Server Action that calls and returns the result from the `streamUI` function
-   Tool(s) (sub-tasks necessary to complete your overall task)
-   React component(s) that should be rendered when the tool is called
-   A page to render your chatbot

The general flow that you will follow is:

-   User sends a message (calls your Server Action with `useActions`, passing the message as an input)
-   Message is appended to the AI State and then passed to the model alongside a number of tools
-   Model can decide to call a tool, which will render the `<SomeTool />` component
-   Within that component, you can add interactivity by using `useActions` to call the model with your Server Action and `useUIState` to append the model's response (`<SomeOtherTool />`) to the UI State
-   And so on...


## [Implementation](#implementation)


The turn-by-turn implementation is the simplest form of multistep interfaces. In this implementation, the user and the model take turns during the conversation. For every user input, the model generates a response, and the conversation continues in this turn-by-turn fashion.

In the following example, you specify two tools (`searchFlights` and `lookupFlight`) that the model can use to search for flights and lookup details for a specific flight.

app/actions.tsx

```
import{ streamUI }from'ai/rsc';import{ openai }from'@ai-sdk/openai';import{ z }from'zod';constsearchFlights=async(source: string,  destination: string,  date: string,)=>{return[{      id:'1',      flightNumber:'AA123',},{      id:'2',      flightNumber:'AA456',},];};constlookupFlight=async(flightNumber: string)=>{return{    flightNumber: flightNumber,    departureTime:'10:00 AM',    arrivalTime:'12:00 PM',};};exportasyncfunctionsubmitUserMessage(input: string){'use server';const ui =awaitstreamUI({    model:openai('gpt-4o'),    system:'you are a flight booking assistant',    prompt: input,text:async({ content })=><div>{content}</div>,    tools:{      searchFlights:{        description:'search for flights',        parameters: z.object({          source: z.string().describe('The origin of the flight'),          destination: z.string().describe('The destination of the flight'),          date: z.string().describe('The date of the flight'),}),generate:asyncfunction*({ source, destination, date }){yield`Searching for flights from ${source} to ${destination} on ${date}...`;const results =awaitsearchFlights(source, destination, date);return(<div>{results.map(result=>(<divkey={result.id}><div>{result.flightNumber}</div></div>))}</div>);},},      lookupFlight:{        description:'lookup details for a flight',        parameters: z.object({          flightNumber: z.string().describe('The flight number'),}),generate:asyncfunction*({ flightNumber }){yield`Looking up details for flight ${flightNumber}...`;const details =awaitlookupFlight(flightNumber);return(<div><div>FlightNumber:{details.flightNumber}</div><div>DepartureTime:{details.departureTime}</div><div>ArrivalTime:{details.arrivalTime}</div></div>);},},},});return ui.value;}
```

Next, create an AI context that will hold the UI State and AI State.

app/ai.ts

```
import{ createAI }from'ai/rsc';import{ submitUserMessage }from'./actions';exportconstAI=createAI<any[],React.ReactNode[]>({  initialUIState:[],  initialAIState:[],  actions:{    submitUserMessage,},});
```

Next, wrap your application with your newly created context.

app/layout.tsx

```
import{typeReactNode}from'react';import{AI}from'./ai';exportdefaultfunctionRootLayout({  children,}: Readonly<{ children: ReactNode }>){return(<AI><htmllang="en"><body>{children}</body></html></AI>);}
```

To call your Server Action, update your root page with the following:

app/page.tsx

```
'use client';import{ useState }from'react';import{AI}from'./ai';import{ useActions, useUIState }from'ai/rsc';exportdefaultfunctionPage(){const[input, setInput]=useState<string>('');const[conversation, setConversation]=useUIState<typeofAI>();const{ submitUserMessage }=useActions();consthandleSubmit=async(e: React.FormEvent<HTMLFormElement>)=>{    e.preventDefault();setInput('');setConversation(currentConversation=>[...currentConversation,<div>{input}</div>,]);const message =awaitsubmitUserMessage(input);setConversation(currentConversation=>[...currentConversation, message]);};return(<div><div>{conversation.map((message, i)=>(<divkey={i}>{message}</div>))}</div><div><formonSubmit={handleSubmit}><inputtype="text"value={input}onChange={e=>setInput(e.target.value)}/><button>SendMessage</button></form></div></div>);}
```

This page pulls in the current UI State using the `useUIState` hook, which is then mapped over and rendered in the UI. To access the Server Action, you use the `useActions` hook which will return all actions that were passed to the `actions` key of the `createAI` function in your `actions.tsx` file. Finally, you call the `submitUserMessage` function like any other TypeScript function. This function returns a React component (`message`) that is then rendered in the UI by updating the UI State with `setConversation`.

In this example, to call the next tool, the user must respond with plain text. **Given you are streaming a React component, you can add a button to trigger the next step in the conversation**.

To add user interaction, you will have to convert the component into a client component and use the `useAction` hook to trigger the next step in the conversation.

components/flights.tsx

```
'use client';import{ useActions, useUIState }from'ai/rsc';import{ReactNode}from'react';interfaceFlightsProps{  flights:{ id:string; flightNumber:string}[];}exportconstFlights=({ flights }: FlightsProps)=>{const{ submitUserMessage }=useActions();const[_, setMessages]=useUIState();return(<div>{flights.map(result=>(<divkey={result.id}><divonClick={async()=>{const display =awaitsubmitUserMessage(`lookupFlight ${result.flightNumber}`,);setMessages((messages: ReactNode[])=>[...messages, display]);}}>{result.flightNumber}</div></div>))}</div>);};
```

Now, update your `searchFlights` tool to render the new `<Flights />` component.

actions.tsx

```
...searchFlights:{  description:'search for flights',  parameters: z.object({    source: z.string().describe('The origin of the flight'),    destination: z.string().describe('The destination of the flight'),    date: z.string().describe('The date of the flight'),}),generate:asyncfunction*({ source, destination, date }){yield`Searching for flights from ${source} to ${destination} on ${date}...`;const results =awaitsearchFlights(source, destination, date);return(<Flightsflights={results}/>);},}...
```

In the above example, the `Flights` component is used to display the search results. When the user clicks on a flight number, the `lookupFlight` tool is called with the flight number as a parameter. The `submitUserMessage` action is then called to trigger the next step in the conversation.

Learn more about tool calling in Next.js App Router by checking out examples [here](/examples/next-app/tools).
