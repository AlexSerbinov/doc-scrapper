# convertToCoreMessages()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-ui/convert-to-core-messages
description: Convert useChat messages to CoreMessages for AI core functions (API Reference)
---


# [`convertToCoreMessages()`](#converttocoremessages)


The `convertToCoreMessages` function is no longer required. The AI SDK now automatically converts the incoming messages to the `CoreMessage` format.

The `convertToCoreMessages` function is used to transform an array of UI messages from the `useChat` hook into an array of `CoreMessage` objects. These `CoreMessage` objects are compatible with AI core functions like `streamText`.

app/api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{ convertToCoreMessages, streamText }from'ai';exportasyncfunctionPOST(req:Request){const{ messages }=await req.json();const result =streamText({    model:openai('gpt-4o'),    messages:convertToCoreMessages(messages),});return result.toDataStreamResponse();}
```


## [Import](#import)


import { convertToCoreMessages } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)



### messages:


Message\[\]

An array of UI messages from the useChat hook to be converted


### options:


{ tools?: ToolSet }

Optional configuration object. Provide tools to enable multi-modal tool responses.


### [Returns](#returns)


An array of [`CoreMessage`](/docs/reference/ai-sdk-core/core-message) objects.


### CoreMessage\[\]:


Array

An array of CoreMessage objects


## [Multi-modal Tool Responses](#multi-modal-tool-responses)


The `convertToCoreMessages` function supports tools that can return multi-modal content. This is useful when tools need to return non-text content like images.

```
import{ tool }from'ai';import{ z }from'zod';const screenshotTool =tool({  parameters: z.object({}),execute:async()=>'imgbase64',experimental_toToolResultContent: result =>[{type:'image', data: result }],});const result =streamText({  model:openai('gpt-4'),  messages:convertToCoreMessages(messages,{    tools:{      screenshot: screenshotTool,},}),});
```

Tools can implement the optional `experimental_toToolResultContent` method to transform their results into multi-modal content. The content is an array of content parts, where each part has a `type` (e.g., 'text', 'image') and corresponding data.
