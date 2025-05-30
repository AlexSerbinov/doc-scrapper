# tool()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/tool
description: Helper function for tool type inference
---


# [`tool()`](#tool)


Tool is a helper function that infers the tool parameters for its `execute` method.

It does not have any runtime behavior, but it helps TypeScript infer the types of the parameters for the `execute` method.

Without this helper function, TypeScript is unable to connect the `parameters` property to the `execute` method, and the argument types of `execute` cannot be inferred.

```
import{ tool }from'ai';import{ z }from'zod';exportconst weatherTool =tool({  description:'Get the weather in a location',  parameters: z.object({location: z.string().describe('The location to get the weather for'),}),// location below is inferred to be a string:execute:async({location})=>({location,    temperature:72+Math.floor(Math.random()*21)-10,}),});
```


## [Import](#import)


import { tool } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### tool:


Tool

The tool definition.

Tool


### description?:


string

Information about the purpose of the tool including details on how and when it can be used by the model.


### parameters:


Zod Schema | JSON Schema

The schema of the input that the tool expects. The language model will use this to generate the input. It is also used to validate the output of the language model. Use descriptions to make the input understandable for the language model. You can either pass in a Zod schema or a JSON schema (using the \`jsonSchema\` function).


### execute?:


async (parameters: T, options: ToolExecutionOptions) => RESULT

An async function that is called with the arguments from the tool call and produces a result. If not provided, the tool will not be executed automatically.

ToolExecutionOptions


### toolCallId:


string

The ID of the tool call. You can use it e.g. when sending tool-call related information with stream data.


### messages:


CoreMessage\[\]

Messages that were sent to the language model to initiate the response that contained the tool call. The messages do not include the system prompt nor the assistant response that contained the tool call.


### abortSignal:


AbortSignal

An optional abort signal that indicates that the overall operation should be aborted.


### experimental\_toToolResultContent?:


(result: RESULT) => TextToolResultContent | ImageToolResultContent

An optional function that converts the result of the tool call to a content object that can be used in LLM messages.

TextToolResultContent


### type:


'text'

The type of the tool result content.


### text:


string

The content of the message.

ImageToolResultContent


### type:


'image'

The type of the tool result content.


### data:


string

The base64 encoded png image.


### mimeType?:


string

The mime type of the image.


### [Returns](#returns)


The tool that was passed in.
