# Error Handling


---
url: https://ai-sdk.dev/docs/ai-sdk-ui/error-handling
description: Learn how to handle errors in the AI SDK UI
---


# [Error Handling](#error-handling)



### [Error Helper Object](#error-helper-object)


Each AI SDK UI hook also returns an [error](/docs/reference/ai-sdk-ui/use-chat#error) object that you can use to render the error in your UI. You can use the error object to show an error message, disable the submit button, or show a retry button.

We recommend showing a generic error message to the user, such as "Something went wrong." This is a good practice to avoid leaking information from the server.

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionChat(){const{ messages, input, handleInputChange, handleSubmit, error, reload }=useChat({});return(<div>{messages.map(m=>(<divkey={m.id}>{m.role}:{m.content}</div>))}{error &&(<><div>An error occurred.</div><buttontype="button"onClick={()=>reload()}>Retry</button></>)}<formonSubmit={handleSubmit}><inputvalue={input}onChange={handleInputChange}disabled={error !=null}/></form></div>);}
```


#### [Alternative: replace last message](#alternative-replace-last-message)


Alternatively you can write a custom submit handler that replaces the last message when an error is present.

```
'use client';import{ useChat }from'@ai-sdk/react';exportdefaultfunctionChat(){const{    handleInputChange,    handleSubmit,    error,    input,    messages,    setMessages,}=useChat({});functioncustomSubmit(event: React.FormEvent<HTMLFormElement>){if(error !=null){setMessages(messages.slice(0,-1));// remove last message}handleSubmit(event);}return(<div>{messages.map(m=>(<divkey={m.id}>{m.role}:{m.content}</div>))}{error &&<div>An error occurred.</div>}<formonSubmit={customSubmit}><inputvalue={input}onChange={handleInputChange}/></form></div>);}
```


### [Error Handling Callback](#error-handling-callback)


Errors can be processed by passing an [`onError`](/docs/reference/ai-sdk-ui/use-chat#on-error) callback function as an option to the [`useChat`](/docs/reference/ai-sdk-ui/use-chat), [`useCompletion`](/docs/reference/ai-sdk-ui/use-completion) or [`useAssistant`](/docs/reference/ai-sdk-ui/use-assistant) hooks. The callback function receives an error object as an argument.

```
import{ useChat }from'@ai-sdk/react';exportdefaultfunctionPage(){const{/* ... */}=useChat({// handle error:onError:error=>{console.error(error);},});}
```


### [Injecting Errors for Testing](#injecting-errors-for-testing)


You might want to create errors for testing. You can easily do so by throwing an error in your route handler:

```
exportasyncfunctionPOST(req:Request){thrownewError('This is a test error');}
```
