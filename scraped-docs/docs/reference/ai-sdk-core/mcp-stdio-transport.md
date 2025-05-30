# Experimental_StdioMCPTransport


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/mcp-stdio-transport
description: Create a transport for Model Context Protocol (MCP) clients to communicate with MCP servers using standard input and output streams
---


# [`Experimental_StdioMCPTransport`](#experimental_stdiomcptransport)


Creates a transport for Model Context Protocol (MCP) clients to communicate with MCP servers using standard input and output streams. This transport is only supported in Node.js environments.

This feature is experimental and may change or be removed in the future.


## [Import](#import)


import { Experimental\_StdioMCPTransport } from "ai/mcp-stdio"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### config:


StdioConfig

Configuration for the MCP client.

StdioConfig


### command:


string

The command to run the MCP server.


### args?:


string\[\]

The arguments to pass to the MCP server.


### env?:


Record<string, string>

The environment variables to set for the MCP server.


### stderr?:


IOType | Stream | number

The stream to write the MCP server's stderr to.


### cwd?:


string

The current working directory for the MCP server.
