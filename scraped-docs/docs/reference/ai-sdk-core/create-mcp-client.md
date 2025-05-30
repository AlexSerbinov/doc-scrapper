# experimental_createMCPClient()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/create-mcp-client
description: Create a client for connecting to MCP servers
---


# [`experimental_createMCPClient()`](#experimental_createmcpclient)


Creates a lightweight Model Context Protocol (MCP) client that connects to an MCP server. The client's primary purpose is tool conversion between MCP tools and AI SDK tools.

It currently does not support accepting notifications from an MCP server, and custom configuration of the client.

This feature is experimental and may change or be removed in the future.


## [Import](#import)


import { experimental\_createMCPClient } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### config:


MCPClientConfig

Configuration for the MCP client.

MCPClientConfig


### transport:


TransportConfig = MCPTransport | McpSSEServerConfig

Configuration for the message transport layer.

MCPTransport


### start:


() => Promise<void>

A method that starts the transport


### send:


(message: JSONRPCMessage) => Promise<void>

A method that sends a message through the transport


### close:


() => Promise<void>

A method that closes the transport


### onclose:


() => void

A method that is called when the transport is closed


### onerror:


(error: Error) => void

A method that is called when the transport encounters an error


### onmessage:


(message: JSONRPCMessage) => void

A method that is called when the transport receives a message

McpSSEServerConfig


### type:


'sse'

Use Server-Sent Events for communication


### url:


string

URL of the MCP server


### headers?:


Record<string, string>

Additional HTTP headers to be sent with requests.


### name?:


string

Client name. Defaults to "ai-sdk-mcp-client"


### onUncaughtError?:


(error: unknown) => void

Handler for uncaught errors


### [Returns](#returns)


Returns a Promise that resolves to an `MCPClient` with the following methods:


### tools:


async (options?: { schemas?: TOOL\_SCHEMAS }) => Promise<McpToolSet<TOOL\_SCHEMAS>>

Gets the tools available from the MCP server.

options


### schemas?:


TOOL\_SCHEMAS

Schema definitions for compile-time type checking. When not provided, schemas are inferred from the server.


### close:


async () => void

Closes the connection to the MCP server and cleans up resources.


## [Example](#example)


```
import{ experimental_createMCPClient, generateText }from'ai';import{ openai }from'@ai-sdk/openai';try{const client =awaitexperimental_createMCPClient({    transport:{type:'stdio',      command:'node server.js',},});const tools =await client.tools();const response =awaitgenerateText({    model:openai('gpt-4o-mini'),    tools,    messages:[{ role:'user', content:'Query the data'}],});console.log(response);}finally{await client.close();}
```


## [Error Handling](#error-handling)


The client throws `MCPClientError` for:

-   Client initialization failures
-   Protocol version mismatches
-   Missing server capabilities
-   Connection failures

For tool execution, errors are propagated as `CallToolError` errors.

For unknown errors, the client exposes an `onUncaughtError` callback that can be used to manually log or handle errors that are not covered by known error types.
