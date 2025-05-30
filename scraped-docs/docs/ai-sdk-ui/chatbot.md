# Chatbot


---
url: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
description: Learn how to use the useChat hook.
---


# [Chatbot](#chatbot)


The `useChat` hook makes it effortless to create a conversational user interface for your chatbot application. It enables the streaming of chat messages from your AI provider, manages the chat state, and updates the UI automatically as new messages arrive.

To summarize, the `useChat` hook provides the following features:

-   **Message Streaming**: All the messages from the AI provider are streamed to the chat UI in real-time.
-   **Managed States**: The hook manages the states for input, messages, status, error and more for you.
-   **Seamless Integration**: Easily integrate your chat AI into any design or layout with minimal effort.

In this guide, you will learn how to use the `useChat` hook to create a chatbot application with real-time message streaming. Check out our [chatbot with tools guide](/docs/ai-sdk-ui/chatbot-with-tool-calling) to learn how to use tools in your chatbot. Let's start with the following example first.


## [Example](#example)


app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionPage(){const{ messages, input, handleInputChange, handleSubmit }=useChat({});return(<>{messages.map(message=>(<divkey={message.id}>{message.role ==='user'?'User: ':'AI: '}{message.content}</div>))}<formonSubmit={handleSubmit}><inputname="prompt"value={input}onChange={handleInputChange}/><buttontype="submit">Submit</button></form></>);}
```

app/api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{ streamText }from'ai';// Allow streaming responses up to 30 secondsexportconst maxDuration =30;exportasyncfunctionPOST(req:Request){const{ messages }=await req.json();const result =streamText({    model:openai('gpt-4-turbo'),    system:'You are a helpful assistant.',    messages,});return result.toDataStreamResponse();}
```

The UI messages have a new `parts` property that contains the message parts. We recommend rendering the messages using the `parts` property instead of the `content` property. The parts property supports different message types, including text, tool invocation, and tool result, and allows for more flexible and complex chat UIs.

In the `Page` component, the `useChat` hook will request to your AI provider endpoint whenever the user submits a message. The messages are then streamed back in real-time and displayed in the chat UI.

This enables a seamless chat experience where the user can see the AI response as soon as it is available, without having to wait for the entire response to be received.


## [Customized UI](#customized-ui)


`useChat` also provides ways to manage the chat message and input states via code, show status, and update messages without being triggered by user interactions.


### [Status](#status)


The `useChat` hook returns a `status`. It has the following possible values:

-   `submitted`: The message has been sent to the API and we're awaiting the start of the response stream.
-   `streaming`: The response is actively streaming in from the API, receiving chunks of data.
-   `ready`: The full response has been received and processed; a new user message can be submitted.
-   `error`: An error occurred during the API request, preventing successful completion.

You can use `status` for e.g. the following purposes:

-   To show a loading spinner while the chatbot is processing the user's message.
-   To show a "Stop" button to abort the current message.
-   To disable the submit button.

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionPage(){const{ messages, input, handleInputChange, handleSubmit, status, stop }=useChat({});return(<>{messages.map(message=>(<divkey={message.id}>{message.role ==='user'?'User: ':'AI: '}{message.content}</div>))}{(status ==='submitted'| status ==='streaming')&&(<div>{status ==='submitted'&&<Spinner/>}<buttontype="button"onClick={()=>stop()}>Stop</button></div>)}<formonSubmit={handleSubmit}><inputname="prompt"value={input}onChange={handleInputChange}disabled={status !=='ready'}/><buttontype="submit">Submit</button></form></>);}
```


### [Error State](#error-state)


Similarly, the `error` state reflects the error object thrown during the fetch request. It can be used to display an error message, disable the submit button, or show a retry button:

We recommend showing a generic error message to the user, such as "Something went wrong." This is a good practice to avoid leaking information from the server.

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit, error, reload }=useChat({});return(<div>{messages.map(m=>(<divkey={m.id}>{m.role}:{m.content}</div>))}{error &&(<><div>An error occurred.</div><buttontype="button"onClick={()=>reload()}>Retry</button></>)}<formonSubmit={handleSubmit}><inputvalue={input}onChange={handleInputChange}disabled={error !=null}/></form></div>);}
```

Please also see the [error handling](/docs/ai-sdk-ui/error-handling) guide for more information.


### [Modify messages](#modify-messages)


Sometimes, you may want to directly modify some existing messages. For example, a delete button can be added to each message to allow users to remove them from the chat history.

The `setMessages` function can help you achieve these tasks:

```
const{ messages, setMessages,...}=useChat()consthandleDelete=(id)=>{setMessages(messages.filter(message=> message.id !== id))}return<>{messages.map(message=>(<divkey={message.id}>{message.role ==='user'?'User: ':'AI: '}{message.content}<buttononClick={()=>handleDelete(message.id)}>Delete</button></div>))}...
```

You can think of `messages` and `setMessages` as a pair of `state` and `setState` in React.


### [Controlled input](#controlled-input)


In the initial example, we have `handleSubmit` and `handleInputChange` callbacks that manage the input changes and form submissions. These are handy for common use cases, but you can also use uncontrolled APIs for more advanced scenarios such as form validation or customized components.

The following example demonstrates how to use more granular APIs like `setInput` and `append` with your custom input and submit button components:

```
const{ input, setInput, append }=useChat()return<><MyCustomInputvalue={input}onChange={value=>setInput(value)}/><MySubmitButtononClick={()=>{// Send a new message to the AI providerappend({      role:'user',      content: input,})}}/>...
```


### [Cancellation and regeneration](#cancellation-and-regeneration)


It's also a common use case to abort the response message while it's still streaming back from the AI provider. You can do this by calling the `stop` function returned by the `useChat` hook.

```
const{ stop, status,...}=useChat()return<><buttononClick={stop}disabled={!(status ==='streaming'| status ==='submitted')}>Stop</button>...
```

When the user clicks the "Stop" button, the fetch request will be aborted. This avoids consuming unnecessary resources and improves the UX of your chatbot application.

Similarly, you can also request the AI provider to reprocess the last message by calling the `reload` function returned by the `useChat` hook:

```
const{ reload, status,...}=useChat()return<><buttononClick={reload}disabled={!(status ==='ready'| status ==='error')}>Regenerate</button>...</>
```

When the user clicks the "Regenerate" button, the AI provider will regenerate the last message and replace the current one correspondingly.


### [Throttling UI Updates](#throttling-ui-updates)


This feature is currently only available for React.

By default, the `useChat` hook will trigger a render every time a new chunk is received. You can throttle the UI updates with the `experimental_throttle` option.

page.tsx

```
const{ messages,...}=useChat({// Throttle the messages and data updates to 50ms:  experimental_throttle:50})
```


## [Event Callbacks](#event-callbacks)


`useChat` provides optional event callbacks that you can use to handle different stages of the chatbot lifecycle:

-   `onFinish`: Called when the assistant message is completed
-   `onError`: Called when an error occurs during the fetch request.
-   `onResponse`: Called when the response from the API is received.

These callbacks can be used to trigger additional actions, such as logging, analytics, or custom UI updates.

```
import{Message}from'@ai-sdk/react';const{/* ... */}=useChat({onFinish:(message,{ usage, finishReason })=>{console.log('Finished streaming message:', message);console.log('Token usage:', usage);console.log('Finish reason:', finishReason);},onError:error=>{console.error('An error occurred:', error);},onResponse:response=>{console.log('Received HTTP response from server:', response);},});
```

It's worth noting that you can abort the processing by throwing an error in the `onResponse` callback. This will trigger the `onError` callback and stop the message from being appended to the chat UI. This can be useful for handling unexpected responses from the AI provider.


## [Request Configuration](#request-configuration)



### [Custom headers, body, and credentials](#custom-headers-body-and-credentials)


By default, the `useChat` hook sends a HTTP POST request to the `/api/chat` endpoint with the message list as the request body. You can customize the request by passing additional options to the `useChat` hook:

```
const{ messages, input, handleInputChange, handleSubmit }=useChat({  api:'/api/custom-chat',  headers:{Authorization:'your_token',},  body:{    user_id:'123',},  credentials:'same-origin',});
```

In this example, the `useChat` hook sends a POST request to the `/api/custom-chat` endpoint with the specified headers, additional body fields, and credentials for that fetch request. On your server side, you can handle the request with these additional information.


### [Setting custom body fields per request](#setting-custom-body-fields-per-request)


You can configure custom `body` fields on a per-request basis using the `body` option of the `handleSubmit` function. This is useful if you want to pass in additional information to your backend that is not part of the message list.

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit }=useChat();return(<div>{messages.map(m=>(<divkey={m.id}>{m.role}:{m.content}</div>))}<form        onSubmit={event=>{handleSubmit(event,{            body:{              customKey:'customValue',},});}}><inputvalue={input}onChange={handleInputChange}/></form></div>);}
```

You can retrieve these custom fields on your server side by destructuring the request body:

app/api/chat/route.ts

```
exportasyncfunctionPOST(req:Request){// Extract addition information ("customKey") from the body of the request:const{ messages, customKey }=await req.json();//...}
```


## [Controlling the response stream](#controlling-the-response-stream)


With `streamText`, you can control how error messages and usage information are sent back to the client.


### [Error Messages](#error-messages)


By default, the error message is masked for security reasons. The default error message is "An error occurred." You can forward error messages or send your own error message by providing a `getErrorMessage` function:

app/api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{ streamText }from'ai';exportasyncfunctionPOST(req:Request){const{ messages }=await req.json();const result =streamText({    model:openai('gpt-4o'),    messages,});return result.toDataStreamResponse({getErrorMessage: error =>{if(error ==null){return'unknown error';}if(typeof error ==='string'){return error;}if(error instanceofError){return error.message;}returnJSON.stringify(error);},});}
```


### [Usage Information](#usage-information)


By default, the usage information is sent back to the client. You can disable it by setting the `sendUsage` option to `false`:

app/api/chat/route.ts

```
import{ openai }from'@ai-sdk/openai';import{ streamText }from'ai';exportasyncfunctionPOST(req:Request){const{ messages }=await req.json();const result =streamText({    model:openai('gpt-4o'),    messages,});return result.toDataStreamResponse({    sendUsage:false,});}
```


### [Text Streams](#text-streams)


`useChat` can handle plain text streams by setting the `streamProtocol` option to `text`:

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ messages }=useChat({    streamProtocol:'text',});return<>...</>;}
```

This configuration also works with other backend servers that stream plain text. Check out the [stream protocol guide](/docs/ai-sdk-ui/stream-protocol) for more information.

When using `streamProtocol: 'text'`, tool calls, usage information and finish reasons are not available.


## [Empty Submissions](#empty-submissions)


You can configure the `useChat` hook to allow empty submissions by setting the `allowEmptySubmit` option to `true`.

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit }=useChat();return(<div>{messages.map(m=>(<divkey={m.id}>{m.role}:{m.content}</div>))}<formonSubmit={event=>{handleSubmit(event,{            allowEmptySubmit:true,});}}><inputvalue={input}onChange={handleInputChange}/></form></div>);}
```


## [Reasoning](#reasoning)


Some models such as as DeepSeek `deepseek-reasoner` and Anthropic `claude-3-7-sonnet-20250219` support reasoning tokens. These tokens are typically sent before the message content. You can forward them to the client with the `sendReasoning` option:

app/api/chat/route.ts

```
import{ deepseek }from'@ai-sdk/deepseek';import{ streamText }from'ai';exportasyncfunctionPOST(req:Request){const{ messages }=await req.json();const result =streamText({    model:deepseek('deepseek-reasoner'),    messages,});return result.toDataStreamResponse({    sendReasoning:true,});}
```

On the client side, you can access the reasoning parts of the message object.

They have a `details` property that contains the reasoning and redacted reasoning parts. You can also use `reasoning` to access just the reasoning as a string.

app/page.tsx

```
messages.map(message=>(<divkey={message.id}>{message.role ==='user'?'User: ':'AI: '}{message.parts.map((part, index)=>{// text parts:if(part.type==='text'){return<divkey={index}>{part.text}</div>;}// reasoning parts:if(part.type==='reasoning'){return(<prekey={index}>{part.details.map(detail=>              detail.type==='text'? detail.text :'<redacted>',)}</pre>);}})}</div>));
```


## [Sources](#sources)


Some providers such as [Perplexity](/providers/ai-sdk-providers/perplexity#sources) and [Google Generative AI](/providers/ai-sdk-providers/google-generative-ai#sources) include sources in the response.

Currently sources are limited to web pages that ground the response. You can forward them to the client with the `sendSources` option:

app/api/chat/route.ts

```
import{ perplexity }from'@ai-sdk/perplexity';import{ streamText }from'ai';exportasyncfunctionPOST(req:Request){const{ messages }=await req.json();const result =streamText({    model:perplexity('sonar-pro'),    messages,});return result.toDataStreamResponse({    sendSources:true,});}
```

On the client side, you can access source parts of the message object. Here is an example that renders the sources as links at the bottom of the message:

app/page.tsx

```
messages.map(message=>(<divkey={message.id}>{message.role ==='user'?'User: ':'AI: '}{message.parts.filter(part=> part.type!=='source').map((part, index)=>{if(part.type==='text'){return<divkey={index}>{part.text}</div>;}})}{message.parts.filter(part=> part.type==='source').map(part=>(<spankey={`source-${part.source.id}`}>[<ahref={part.source.url}target="_blank">{part.source.title ??newURL(part.source.url).hostname}</a>]</span>))}</div>));
```


## [Image Generation](#image-generation)


Some models such as Google `gemini-2.0-flash-exp` support image generation. When images are generated, they are exposed as files to the client. On the client side, you can access file parts of the message object and render them as images.

app/page.tsx

```
messages.map(message=>(<divkey={message.id}>{message.role ==='user'?'User: ':'AI: '}{message.parts.map((part, index)=>{if(part.type==='text'){return<divkey={index}>{part.text}</div>;}elseif(part.type==='file'&& part.mimeType.startsWith('image/')){return(<imgkey={index}src={`data:${part.mimeType};base64,${part.data}`}/>);}})}</div>));
```


## [Attachments (Experimental)](#attachments-experimental)


The `useChat` hook supports sending attachments along with a message as well as rendering them on the client. This can be useful for building applications that involve sending images, files, or other media content to the AI provider.

There are two ways to send attachments with a message, either by providing a `FileList` object or a list of URLs to the `handleSubmit` function:


### [FileList](#filelist)


By using `FileList`, you can send multiple files as attachments along with a message using the file input element. The `useChat` hook will automatically convert them into data URLs and send them to the AI provider.

Currently, only `image/*` and `text/*` content types get automatically converted into [multi-modal content parts](/docs/foundations/prompts#multi-modal-messages). You will need to handle other content types manually.

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';import{ useRef, useState }from'react';exportdefaultfunctionPage(){const{ messages, input, handleSubmit, handleInputChange, status }=useChat();const[files, setFiles]=useState<FileList|undefined>(undefined);const fileInputRef =useRef<HTMLInputElement>(null);return(<div><div>{messages.map(message=>(<divkey={message.id}><div>{`${message.role}: `}</div><div>{message.content}<div>{message.experimental_attachments?.filter(attachment=>                    attachment.contentType.startsWith('image/'),).map((attachment, index)=>(<imgkey={`${message.id}-${index}`}src={attachment.url}alt={attachment.name}/>))}</div></div></div>))}</div><formonSubmit={event=>{handleSubmit(event,{            experimental_attachments: files,});setFiles(undefined);if(fileInputRef.current){            fileInputRef.current.value ='';}}}><inputtype="file"onChange={event=>{if(event.target.files){setFiles(event.target.files);}}}multipleref={fileInputRef}/><inputvalue={input}placeholder="Send message..."onChange={handleInputChange}disabled={status !=='ready'}/></form></div>);}
```


### [URLs](#urls)


You can also send URLs as attachments along with a message. This can be useful for sending links to external resources or media content.

> **Note:** The URL can also be a data URL, which is a base64-encoded string that represents the content of a file. Currently, only `image/*` content types get automatically converted into [multi-modal content parts](/docs/foundations/prompts#multi-modal-messages). You will need to handle other content types manually.

app/page.tsx

```
'use client';import{ useChat }from'@ai-sdk/react';import{ useState }from'react';import{Attachment}from'@ai-sdk/ui-utils';exportdefaultfunctionPage(){const{ messages, input, handleSubmit, handleInputChange, status }=useChat();const[attachments]=useState<Attachment[]>([{      name:'earth.png',      contentType:'image/png',      url:'https://example.com/earth.png',},{      name:'moon.png',      contentType:'image/png',      url:'data:image/png;base64,iVBORw0KGgo...',},]);return(<div><div>{messages.map(message=>(<divkey={message.id}><div>{`${message.role}: `}</div><div>{message.content}<div>{message.experimental_attachments?.filter(attachment=>                    attachment.contentType?.startsWith('image/'),).map((attachment, index)=>(<imgkey={`${message.id}-${index}`}src={attachment.url}alt={attachment.name}/>))}</div></div></div>))}</div><formonSubmit={event=>{handleSubmit(event,{            experimental_attachments: attachments,});}}><inputvalue={input}placeholder="Send message..."onChange={handleInputChange}disabled={status !=='ready'}/></form></div>);}
```
