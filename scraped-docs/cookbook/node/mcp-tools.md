# MCP Tools


---
url: https://ai-sdk.dev/cookbook/node/mcp-tools
description: Learn how to use MCP tools with the AI SDK and Node
---


# [MCP Tools](#mcp-tools)


The AI SDK supports Model Context Protocol (MCP) tools by offering a lightweight client that exposes a `tools` method for retrieving tools from a MCP server. After use, the client should always be closed to release resources.

```
import{ experimental_createMCPClient, generateText }from'ai';import{Experimental_StdioMCPTransport}from'ai/mcp-stdio';import{ openai }from'@ai-sdk/openai';let clientOne;let clientTwo;let clientThree;try{// Initialize an MCP client to connect to a `stdio` MCP server:const transport =newExperimental_StdioMCPTransport({    command:'node',    args:['src/stdio/dist/server.js'],});  clientOne =awaitexperimental_createMCPClient({    transport,});// Alternatively, you can connect to a Server-Sent Events (SSE) MCP server:  clientTwo =awaitexperimental_createMCPClient({    transport:{type:'sse',      url:'http://localhost:3000/sse',},});// Similarly to the stdio example, you can pass in your own custom transport as long as it implements the `MCPTransport` interface:const transport =newMyCustomTransport({// ...});  clientThree =awaitexperimental_createMCPClient({    transport,});const toolSetOne =await clientOne.tools();const toolSetTwo =await clientTwo.tools();const toolSetThree =await clientThree.tools();const tools ={...toolSetOne,...toolSetTwo,...toolSetThree,// note: this approach causes subsequent tool sets to override tools with the same name};const response =awaitgenerateText({    model:openai('gpt-4o'),    tools,    messages:[{        role:'user',        content:'Find products under $100',},],});console.log(response.text);}catch(error){console.error(error);}finally{awaitPromise.all([clientOne.close(), clientTwo.close()]);}
```
