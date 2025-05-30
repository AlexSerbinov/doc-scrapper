# Tool Invocation Missing Result Error


---
url: https://ai-sdk.dev/docs/troubleshooting/tool-invocation-missing-result
description: How to fix the "ToolInvocation must have a result" error when using tools without execute functions
---


# [Tool Invocation Missing Result Error](#tool-invocation-missing-result-error)



## [Issue](#issue)


When using `generateText()` or `streamText()`, you may encounter the error "ToolInvocation must have a result" when a tool without an `execute` function is called.


## [Cause](#cause)


The error occurs when you define a tool without an `execute` function and don't provide the result through other means (like `useChat`'s `onToolCall` or `addToolResult` functions).

Each time a tool is invoked, the model expects to receive a result before continuing the conversation. Without a result, the model cannot determine if the tool call succeeded or failed and the conversation state becomes invalid.


## [Solution](#solution)


You have two options for handling tool results:

1.  Server-side execution using tools with an `execute` function:

```
const tools ={  weather:tool({    description:'Get the weather in a location',    parameters: z.object({location: z.string().describe('The city and state, e.g. "San Francisco, CA"'),}),execute:async({ location })=>{// Fetch and return weather datareturn{ temperature:72, conditions:'sunny',location};},}),};
```

2.  Client-side execution with `useChat` (omitting the `execute` function), but you must provide results in one of these ways:

```
const{ messages }=useChat({// Option 1: Handle using onToolCallonToolCall:async({ toolCall })=>{if(toolCall.toolName ==='getLocation'){const result =awaitgetLocationData();return result;// This becomes the tool result}},});}
```

```
// Option 2: Use addToolResult (e.g. with interactive UI elements)const{ messages, addToolResult }=useChat();// Inside your JSX, when rendering tool calls:<buttononClick={()=>addToolResult({      toolCallId,// must provide tool call ID      result:{/* your tool result */},})}>Confirm</button>;
```

Whether handling tools on the server or client, each tool call must have a corresponding result before the conversation can continue.
