# Error Handling


---
url: https://ai-sdk.dev/docs/ai-sdk-core/error-handling
description: Learn how to handle errors in the AI SDK Core
---


# [Error Handling](#error-handling)



## [Handling regular errors](#handling-regular-errors)


Regular errors are thrown and can be handled using the `try/catch` block.

```
import{ generateText }from'ai';try{const{ text }=awaitgenerateText({    model: yourModel,    prompt:'Write a vegetarian lasagna recipe for 4 people.',});}catch(error){// handle error}
```

See [Error Types](/docs/reference/ai-sdk-errors) for more information on the different types of errors that may be thrown.


## [Handling streaming errors (simple streams)](#handling-streaming-errors-simple-streams)


When errors occur during streams that do not support error chunks, the error is thrown as a regular error. You can handle these errors using the `try/catch` block.

```
import{ generateText }from'ai';try{const{ textStream }=streamText({    model: yourModel,    prompt:'Write a vegetarian lasagna recipe for 4 people.',});forawait(const textPart of textStream){    process.stdout.write(textPart);}}catch(error){// handle error}
```


## [Handling streaming errors (streaming with `error` support)](#handling-streaming-errors-streaming-with-error-support)


Full streams support error parts. You can handle those parts similar to other parts. It is recommended to also add a try-catch block for errors that happen outside of the streaming.

```
import{ generateText }from'ai';try{const{ fullStream }=streamText({    model: yourModel,    prompt:'Write a vegetarian lasagna recipe for 4 people.',});forawait(const part of fullStream){switch(part.type){// ... handle other part typescase'error':{const error = part.error;// handle errorbreak;}}}}catch(error){// handle error}
```
