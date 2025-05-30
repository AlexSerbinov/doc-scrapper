# MCP Tools


---
url: https://ai-sdk.dev/cookbook/next/mcp-tools
description: Learn how to use MCP tools with the AI SDK and Next.js
---


# [MCP Tools](#mcp-tools)


The AI SDK supports Model Context Protocol (MCP) tools by offering a lightweight client that exposes a `tools` method for retrieving tools from a MCP server. After use, the client should always be closed to release resources.


## [Server](#server)


Let's create a route handler for `/api/completion` that will generate text based on the input prompt and MCP tools that can be called at any time during a generation. The route will call the `streamText` function from the `ai` module, which will then generate text based on the input prompt and stream it to the client.

To use the `StreamableHTTPClientTransport`, you will need to install the official Typescript SDK for Model Context Protocol:

pnpm install @modelcontextprotocol/sdk

app/api/completion/route.ts

```
import{ experimental_createMCPClient, streamText }from'ai';import{Experimental_StdioMCPTransport}from'ai/mcp-stdio';import{ openai }from'@ai-sdk/openai';import{StreamableHTTPClientTransport}from'@modelcontextprotocol/sdk/client/streamableHttp';exportasyncfunctionPOST(req:Request){const{ prompt }:{ prompt:string}=await req.json();try{// Initialize an MCP client to connect to a `stdio` MCP server:const transport =newExperimental_StdioMCPTransport({      command:'node',      args:['src/stdio/dist/server.js'],});const stdioClient =awaitexperimental_createMCPClient({      transport,});// Alternatively, you can connect to a Server-Sent Events (SSE) MCP server:const sseClient =awaitexperimental_createMCPClient({      transport:{type:'sse',        url:'https://actions.zapier.com/mcp/[YOUR_KEY]/sse',},});// Similarly to the stdio example, you can pass in your own custom transport as long as it implements the `MCPTransport` interface (e.g. `StreamableHTTPClientTransport`):const transport =newStreamableHTTPClientTransport(newURL('http://localhost:3000/mcp'),);const customClient =awaitexperimental_createMCPClient({      transport,});const toolSetOne =await stdioClient.tools();const toolSetTwo =await sseClient.tools();const toolSetThree =await customClient.tools();const tools ={...toolSetOne,...toolSetTwo,...toolSetThree,// note: this approach causes subsequent tool sets to override tools with the same name};const response =awaitstreamText({      model:openai('gpt-4o'),      tools,      prompt,// When streaming, the client should be closed after the response is finished:onFinish:async()=>{await stdioClient.close();await sseClient.close();await customClient.close();},// Closing clients onError is optional// - Closing: Immediately frees resources, prevents hanging connections// - Not closing: Keeps connection open for retriesonError:async error =>{await stdioClient.close();await sseClient.close();await customClient.close();},});return response.toDataStreamResponse();}catch(error){returnnewResponse('Internal Server Error',{ status:500});}}
```


## [Client](#client)


Let's create a simple React component that imports the `useCompletion` hook from the `@ai-sdk/react` module. The `useCompletion` hook will call the `/api/completion` endpoint when a button is clicked. The endpoint will generate text based on the input prompt and stream it to the client.

app/page.tsx

```
'use client';import{ useCompletion }from'@ai-sdk/react';exportdefaultfunctionPage(){const{ completion, complete }=useCompletion({    api:'/api/completion',});return(<div><divonClick={async()=>{awaitcomplete('Please schedule a call with Sonny and Robby for tomorrow at 10am ET for me!',);}}>Schedule a call</div>{completion}</div>);}
```
