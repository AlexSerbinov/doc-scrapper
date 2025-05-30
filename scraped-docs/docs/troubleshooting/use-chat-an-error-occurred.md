# useChat "An error occurred"


---
url: https://ai-sdk.dev/docs/troubleshooting/use-chat-an-error-occurred
description: Troubleshooting errors related to the "An error occurred" error in useChat.
---


# [`useChat` "An error occurred"](#usechat-an-error-occurred)



## [Issue](#issue)


I am using [`useChat`](/docs/reference/ai-sdk-ui/use-chat) and I get the error "An error occurred".


## [Background](#background)


Error messages from `streamText` are masked by default when using `toDataStreamResponse` for security reasons (secure-by-default). This prevents leaking sensitive information to the client.


## [Solution](#solution)


To forward error details to the client or to log errors, use the `getErrorMessage` function when calling `toDataStreamResponse`.

```
exportfunctionerrorHandler(error: unknown){if(error ==null){return'unknown error';}if(typeof error ==='string'){return error;}if(error instanceofError){return error.message;}returnJSON.stringify(error);}
```

```
const result =streamText({// ...});return result.toDataStreamResponse({  getErrorMessage: errorHandler,});
```

In case you are using `createDataStreamResponse`, you can use the `onError` function when calling `toDataStreamResponse`:

```
const response =createDataStreamResponse({// ...asyncexecute(dataStream){// ...},  onError: errorHandler,});
```
