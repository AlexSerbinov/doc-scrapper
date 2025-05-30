# Building a Slack AI Chatbot with the AI SDK


---
url: https://ai-sdk.dev/docs/guides/slackbot
description: Learn how to use the AI SDK to build an AI Slackbot.
---


# [Building a Slack AI Chatbot with the AI SDK](#building-a-slack-ai-chatbot-with-the-ai-sdk)


In this guide, you will learn how to build a Slackbot powered by the AI SDK. The bot will be able to respond to direct messages and mentions in channels using the full context of the thread.


## [Slack App Setup](#slack-app-setup)


Before we start building, you'll need to create and configure a Slack app:

1.  Go to [api.slack.com/apps](https://api.slack.com/apps)
2.  Click "Create New App" and choose "From scratch"
3.  Give your app a name and select your workspace
4.  Under "OAuth & Permissions", add the following bot token scopes:
    -   `app_mentions:read`
    -   `chat:write`
    -   `im:history`
    -   `im:write`
    -   `assistant:write`
5.  Install the app to your workspace (button under "OAuth Tokens" subsection)
6.  Copy the Bot User OAuth Token and Signing Secret for the next step
7.  Under App Home -> Show Tabs -> Chat Tab, check "Allow users to send Slash commands and messages from the chat tab"


## [Project Setup](#project-setup)


This project uses the following stack:

-   [AI SDK by Vercel](/docs)
-   [Slack Web API](https://api.slack.com/web)
-   [Vercel](https://vercel.com)
-   [OpenAI](https://openai.com)


## [Getting Started](#getting-started)


1.  Clone [the repository](https://github.com/vercel-labs/ai-sdk-slackbot) and check out the `starter` branch

git clone https://github.com/vercel-labs/ai-sdk-slackbot.git

cd ai-sdk-slackbot

git checkout starter

2.  Install dependencies

pnpm install


## [Project Structure](#project-structure)


The starter repository already includes:

-   Slack utilities (`lib/slack-utils.ts`) including functions for validating incoming requests, converting Slack threads to AI SDK compatible message formats, and getting the Slackbot's user ID
-   General utility functions (`lib/utils.ts`) including initial Exa setup
-   Files to handle the different types of Slack events (`lib/handle-messages.ts` and `lib/handle-app-mention.ts`)
-   An API endpoint (`POST`) for Slack events (`api/events.ts`)


## [Event Handler](#event-handler)


First, let's take a look at our API route (`api/events.ts`):

```
importtype{SlackEvent}from'@slack/web-api';import{  assistantThreadMessage,  handleNewAssistantMessage,}from'../lib/handle-messages';import{ waitUntil }from'@vercel/functions';import{ handleNewAppMention }from'../lib/handle-app-mention';import{ verifyRequest, getBotId }from'../lib/slack-utils';exportasyncfunctionPOST(request:Request){const rawBody =await request.text();const payload =JSON.parse(rawBody);const requestType = payload.typeas'url_verification'|'event_callback';// See https://api.slack.com/events/url_verificationif(requestType ==='url_verification'){returnnewResponse(payload.challenge,{ status:200});}awaitverifyRequest({ requestType, request, rawBody });try{const botUserId =awaitgetBotId();const event = payload.eventasSlackEvent;if(event.type==='app_mention'){waitUntil(handleNewAppMention(event, botUserId));}if(event.type==='assistant_thread_started'){waitUntil(assistantThreadMessage(event));}if(      event.type==='message'&&!event.subtype&&      event.channel_type==='im'&&!event.bot_id&&!event.bot_profile&&      event.bot_id!== botUserId){waitUntil(handleNewAssistantMessage(event, botUserId));}returnnewResponse('Success!',{ status:200});}catch(error){console.error('Error generating response', error);returnnewResponse('Error generating response',{ status:500});}}
```

This file defines a `POST` function that handles incoming requests from Slack. First, you check the request type to see if it's a URL verification request. If it is, you respond with the challenge string provided by Slack. If it's an event callback, you verify the request and then have access to the event data. This is where you can implement your event handling logic.

You then handle three types of events: `app_mention`, `assistant_thread_started`, and `message`:

-   For `app_mention`, you call `handleNewAppMention` with the event and the bot user ID.
-   For `assistant_thread_started`, you call `assistantThreadMessage` with the event.
-   For `message`, you call `handleNewAssistantMessage` with the event and the bot user ID.

Finally, you respond with a success message to Slack. Note, each handler function is wrapped in a `waitUntil` function. Let's take a look at what this means and why it's important.


### [The waitUntil Function](#the-waituntil-function)


Slack expects a response within 3 seconds to confirm the request is being handled. However, generating AI responses can take longer. If you don't respond to the Slack request within 3 seconds, Slack will send another request, leading to another invocation of your API route, another call to the LLM, and ultimately another response to the user. To solve this, you can use the `waitUntil` function, which allows you to run your AI logic after the response is sent, without blocking the response itself.

This means, your API endpoint will:

1.  Immediately respond to Slack (within 3 seconds)
2.  Continue processing the message asynchronously
3.  Send the AI response when it's ready


## [Event Handlers](#event-handlers)


Let's look at how each event type is currently handled.


### [App Mentions](#app-mentions)


When a user mentions your bot in a channel, the `app_mention` event is triggered. The `handleNewAppMention` function in `handle-app-mention.ts` processes these mentions:

1.  Checks if the message is from a bot to avoid infinite response loops
2.  Creates a status updater to show the bot is "thinking"
3.  If the mention is in a thread, it retrieves the thread history
4.  Calls the LLM with the message content (using the `generateResponse` function which you will implement in the next section)
5.  Updates the initial "thinking" message with the AI response

Here's the code for the `handleNewAppMention` function:

lib/handle-app-mention.ts

```
import{AppMentionEvent}from'@slack/web-api';import{ client, getThread }from'./slack-utils';import{ generateResponse }from'./ai';constupdateStatusUtil=async(  initialStatus:string,  event:AppMentionEvent,)=>{const initialMessage =await client.chat.postMessage({    channel: event.channel,    thread_ts: event.thread_ts?? event.ts,    text: initialStatus,});if(!initialMessage |!initialMessage.ts)thrownewError('Failed to post initial message');constupdateMessage=async(status:string)=>{await client.chat.update({      channel: event.channel,      ts: initialMessage.tsasstring,      text: status,});};return updateMessage;};exportasyncfunctionhandleNewAppMention(  event:AppMentionEvent,  botUserId:string,){console.log('Handling app mention');if(event.bot_id| event.bot_id=== botUserId | event.bot_profile){console.log('Skipping app mention');return;}const{ thread_ts, channel }= event;const updateMessage =awaitupdateStatusUtil('is thinking...', event);if(thread_ts){const messages =awaitgetThread(channel, thread_ts, botUserId);const result =awaitgenerateResponse(messages, updateMessage);updateMessage(result);}else{const result =awaitgenerateResponse([{ role:'user', content: event.text}],      updateMessage,);updateMessage(result);}}
```

Now let's see how new assistant threads and messages are handled.


### [Assistant Thread Messages](#assistant-thread-messages)


When a user starts a thread with your assistant, the `assistant_thread_started` event is triggered. The `assistantThreadMessage` function in `handle-messages.ts` handles this:

1.  Posts a welcome message to the thread
2.  Sets up suggested prompts to help users get started

Here's the code for the `assistantThreadMessage` function:

lib/handle-messages.ts

```
importtype{AssistantThreadStartedEvent}from'@slack/web-api';import{ client }from'./slack-utils';exportasyncfunctionassistantThreadMessage(  event:AssistantThreadStartedEvent,){const{ channel_id, thread_ts }= event.assistant_thread;console.log(`Thread started: ${channel_id}${thread_ts}`);console.log(JSON.stringify(event));await client.chat.postMessage({    channel: channel_id,    thread_ts: thread_ts,    text:"Hello, I'm an AI assistant built with the AI SDK by Vercel!",});await client.assistant.threads.setSuggestedPrompts({    channel_id: channel_id,    thread_ts: thread_ts,    prompts:[{        title:'Get the weather',        message:'What is the current weather in London?',},{        title:'Get the news',        message:'What is the latest Premier League news from the BBC?',},],});}
```


### [Direct Messages](#direct-messages)


For direct messages to your bot, the `message` event is triggered and the event is handled by the `handleNewAssistantMessage` function in `handle-messages.ts`:

1.  Verifies the message isn't from a bot
2.  Updates the status to show the response is being generated
3.  Retrieves the conversation history
4.  Calls the LLM with the conversation context
5.  Posts the LLM's response to the thread

Here's the code for the `handleNewAssistantMessage` function:

lib/handle-messages.ts

```
importtype{GenericMessageEvent}from'@slack/web-api';import{ client, getThread }from'./slack-utils';import{ generateResponse }from'./ai';exportasyncfunctionhandleNewAssistantMessage(  event:GenericMessageEvent,  botUserId:string,){if(    event.bot_id|    event.bot_id=== botUserId |    event.bot_profile|!event.thread_ts)return;const{ thread_ts, channel }= event;const updateStatus =updateStatusUtil(channel, thread_ts);updateStatus('is thinking...');const messages =awaitgetThread(channel, thread_ts, botUserId);const result =awaitgenerateResponse(messages, updateStatus);await client.chat.postMessage({    channel: channel,    thread_ts: thread_ts,    text: result,    unfurl_links:false,    blocks:[{type:'section',        text:{type:'mrkdwn',          text: result,},},],});updateStatus('');}
```

With the event handlers in place, let's now implement the AI logic.


## [Implementing AI Logic](#implementing-ai-logic)


The core of our application is the `generateResponse` function in `lib/generate-response.ts`, which processes messages and generates responses using the AI SDK.

Here's how to implement it:

lib/generate-response.ts

```
import{ openai }from'@ai-sdk/openai';import{CoreMessage, generateText }from'ai';exportconstgenerateResponse=async(  messages:CoreMessage[],  updateStatus?:(status:string)=>void,)=>{const{ text }=awaitgenerateText({    model:openai('gpt-4o-mini'),    system:`You are a Slack bot assistant. Keep your responses concise and to the point.    - Do not tag users.    - Current date is: ${newDate().toISOString().split('T')[0]}`,    messages,});// Convert markdown to Slack mrkdwn formatreturn text.replace(/\[(.*?)\]\((.*?)\)/g,'<$2|$1>').replace(/\*\*/g,'*');};
```

This basic implementation:

1.  Uses the AI SDK's `generateText` function to call OpenAI's `gpt-4o` model
2.  Provides a system prompt to guide the model's behavior
3.  Formats the response for Slack's markdown format


## [Enhancing with Tools](#enhancing-with-tools)


The real power of the AI SDK comes from tools that enable your bot to perform actions. Let's add two useful tools:

lib/generate-response.ts

```
import{ openai }from'@ai-sdk/openai';import{CoreMessage, generateText, tool }from'ai';import{ z }from'zod';import{ exa }from'./utils';exportconstgenerateResponse=async(  messages:CoreMessage[],  updateStatus?:(status:string)=>void,)=>{const{ text }=awaitgenerateText({    model:openai('gpt-4o'),    system:`You are a Slack bot assistant. Keep your responses concise and to the point.    - Do not tag users.    - Current date is: ${newDate().toISOString().split('T')[0]}    - Always include sources in your final response if you use web search.`,    messages,    maxSteps:10,    tools:{      getWeather:tool({        description:'Get the current weather at a location',        parameters: z.object({          latitude: z.number(),          longitude: z.number(),          city: z.string(),}),execute:async({ latitude, longitude, city })=>{          updateStatus?.(`is getting weather for ${city}...`);const response =awaitfetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,relativehumidity_2m&timezone=auto`,);const weatherData =await response.json();return{            temperature: weatherData.current.temperature_2m,            weatherCode: weatherData.current.weathercode,            humidity: weatherData.current.relativehumidity_2m,            city,};},}),      searchWeb:tool({        description:'Use this to search the web for information',        parameters: z.object({          query: z.string(),          specificDomain: z.string().nullable().describe('a domain to search if the user specifies e.g. bbc.com. Should be only the domain name without the protocol',),}),execute:async({ query, specificDomain })=>{          updateStatus?.(`is searching the web for ${query}...`);const{ results }=await exa.searchAndContents(query,{            livecrawl:'always',            numResults:3,            includeDomains: specificDomain ?[specificDomain]:undefined,});return{            results: results.map(result =>({              title: result.title,              url: result.url,              snippet: result.text.slice(0,1000),})),};},}),},});// Convert markdown to Slack mrkdwn formatreturn text.replace(/\[(.*?)\]\((.*?)\)/g,'<$2|$1>').replace(/\*\*/g,'*');};
```

In this updated implementation:

1.  You added two tools:

    -   `getWeather`: Fetches weather data for a specified location
    -   `searchWeb`: Searches the web for information using the Exa API
2.  You set `maxSteps: 10` to enable multi-step conversations. This will automatically send any tool results back to the LLM to trigger additional tool calls or responses as the LLM deems necessary. This turns your LLM call from a one-off operation into a multi-step agentic flow.



## [How It Works](#how-it-works)


When a user interacts with your bot:

1.  The Slack event is received and processed by your API endpoint
2.  The user's message and the thread history is passed to the `generateResponse` function
3.  The AI SDK processes the message and may invoke tools as needed
4.  The response is formatted for Slack and sent back to the user

The tools are automatically invoked based on the user's intent. For example, if a user asks "What's the weather in London?", the AI will:

1.  Recognize this as a weather query
2.  Call the `getWeather` tool with London's coordinates (inferred by the LLM)
3.  Process the weather data
4.  Generate a final response, answering the user's question


## [Deploying the App](#deploying-the-app)


1.  Install the Vercel CLI

pnpm install -g vercel

2.  Deploy the app

vercel deploy

3.  Copy the deployment URL and update the Slack app's Event Subscriptions to point to your Vercel URL
4.  Go to your project's deployment settings (Your project -> Settings -> Environment Variables) and add your environment variables

```
SLACK_BOT_TOKEN=your_slack_bot_tokenSLACK_SIGNING_SECRET=your_slack_signing_secretOPENAI_API_KEY=your_openai_api_keyEXA_API_KEY=your_exa_api_key
```

Make sure to redeploy your app after updating environment variables.

5.  Head back to the [https://api.slack.com/](https://api.slack.com/) and navigate to the "Event Subscriptions" page. Enable events and add your deployment URL.

```
https://your-vercel-url.vercel.app/api/events
```

6.  On the Events Subscription page, subscribe to the following events.
    -   `app_mention`
    -   `assistant_thread_started`
    -   `message:im`

Finally, head to Slack and test the app by sending a message to the bot.


## [Next Steps](#next-steps)


You've built a Slack chatbot powered by the AI SDK! Here are some ways you could extend it:

1.  Add memory for specific users to give the LLM context of previous interactions
2.  Implement more tools like database queries or knowledge base searches
3.  Add support for rich message formatting with blocks
4.  Add analytics to track usage patterns

In a production environment, it is recommended to implement a robust queueing system to ensure messages are properly handled.
