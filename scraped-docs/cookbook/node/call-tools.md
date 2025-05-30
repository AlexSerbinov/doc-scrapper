# Call Tools


---
url: https://ai-sdk.dev/cookbook/node/call-tools
description: Learn how to call tools using the AI SDK and Node
---


# [Call Tools](#call-tools)


Some models allow developers to provide a list of tools that can be called at any time during a generation. This is useful for extending the capabilites of a language model to either use logic or data to interact with systems external to the model.

```
import{ generateText, tool }from'ai';import{ openai }from'@ai-sdk/openai';import{ z }from'zod';const result =awaitgenerateText({  model:openai('gpt-4-turbo'),  tools:{    weather:tool({      description:'Get the weather in a location',      parameters: z.object({location: z.string().describe('The location to get the weather for'),}),execute:async({location})=>({location,        temperature:72+Math.floor(Math.random()*21)-10,}),}),    cityAttractions:tool({      parameters: z.object({ city: z.string()}),}),},  prompt:'What is the weather in San Francisco and what attractions should I visit?',});
```


## [Accessing Tool Calls and Tool Results](#accessing-tool-calls-and-tool-results)


If the model decides to call a tool, it will generate a tool call. You can access the tool call by checking the `toolCalls` property on the result.

```
import{ openai }from'@ai-sdk/openai';import{ generateText, tool }from'ai';importdotenvfrom'dotenv';import{ z }from'zod';dotenv.config();asyncfunctionmain(){const result =awaitgenerateText({    model:openai('gpt-3.5-turbo'),    maxTokens:512,    tools:{      weather:tool({        description:'Get the weather in a location',        parameters: z.object({location: z.string().describe('The location to get the weather for'),}),execute:async({location})=>({location,          temperature:72+Math.floor(Math.random()*21)-10,}),}),      cityAttractions:tool({        parameters: z.object({ city: z.string()}),}),},    prompt:'What is the weather in San Francisco and what attractions should I visit?',});// typed tool calls:for(const toolCall of result.toolCalls){switch(toolCall.toolName){case'cityAttractions':{        toolCall.args.city;// stringbreak;}case'weather':{        toolCall.args.location;// stringbreak;}}}console.log(JSON.stringify(result,null,2));}main().catch(console.error);
```


## [Accessing Tool Results](#accessing-tool-results)


You can access the result of a tool call by checking the `toolResults` property on the result.

```
import{ openai }from'@ai-sdk/openai';import{ generateText, tool }from'ai';importdotenvfrom'dotenv';import{ z }from'zod';dotenv.config();asyncfunctionmain(){const result =awaitgenerateText({    model:openai('gpt-3.5-turbo'),    maxTokens:512,    tools:{      weather:tool({        description:'Get the weather in a location',        parameters: z.object({location: z.string().describe('The location to get the weather for'),}),execute:async({location})=>({location,          temperature:72+Math.floor(Math.random()*21)-10,}),}),      cityAttractions:tool({        parameters: z.object({ city: z.string()}),}),},    prompt:'What is the weather in San Francisco and what attractions should I visit?',});// typed tool results for tools with execute method:for(const toolResult of result.toolResults){switch(toolResult.toolName){case'weather':{        toolResult.args.location;// string        toolResult.result.location;// string        toolResult.result.temperature;// numberbreak;}}}console.log(JSON.stringify(result,null,2));}main().catch(console.error);
```

`toolResults` will only be available if the tool has an `execute` function.


## [Model Response](#model-response)


When using tools, it's important to note that the model won't respond with the tool call results by default. This is because the model has technically already generated its response to the prompt: the tool call. Many use cases will require the model to summarise the results of the tool call within the context of the original prompt automatically. You can achieve this by [using `maxSteps`](/examples/node/tools/call-tools-with-automatic-roundtrips) which will automatically send toolResults to the model to trigger another generation.
