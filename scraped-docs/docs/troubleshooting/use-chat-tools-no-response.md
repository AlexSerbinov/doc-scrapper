# useChat No Response with maxSteps


---
url: https://ai-sdk.dev/docs/troubleshooting/use-chat-tools-no-response
description: Troubleshooting errors related to the Use Chat Failed to Parse Stream error.
---


# [`useChat` No Response with maxSteps](#usechat-no-response-with-maxsteps)



## [Issue](#issue)


I am using [`useChat`](/docs/reference/ai-sdk-ui/use-chat) with [`maxSteps`](/docs/reference/ai-sdk-ui/use-chat#max-steps). When I log the incoming messages on the server, I can see the tool call and the tool result, but the model does not respond with anything.


## [Background](#background)


The `useChat` hook uses a message structure (`Message`) that pre-dates the AI SDK Core message structure (`CoreMessage`).


## [Solution](#solution)


This solution is outdated. The AI SDK now automatically converts the incoming messages to the `CoreMessage` format.

To resolve this issue, convert the incoming messages to the `CoreMessage` format using the [`convertToCoreMessages`](/docs/reference/ai-sdk-ui/convert-to-core-messages) function.

```
import{ openai }from'@ai-sdk/openai';import{ convertToCoreMessages, streamText }from'ai';exportasyncfunctionPOST(req: Request){const{ messages }=await req.json();const result =streamText({    model:openai('gpt-4o'),    messages:convertToCoreMessages(messages),});return result.toDataStreamResponse();}
```
