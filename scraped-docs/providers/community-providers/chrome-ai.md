# ChromeAI


---
url: https://ai-sdk.dev/providers/community-providers/chrome-ai
description: Learn how to use the Chrome AI provider for the AI SDK.
---


# [ChromeAI](#chromeai)


[jeasonstudio/chrome-ai](https://github.com/jeasonstudio/chrome-ai) is a community provider that uses [Chrome Built-in AI](https://developer.chrome.com/docs/ai/built-in) to provide language model support for the AI SDK.

This module is under development and may contain errors and frequent incompatible changes.


## [Setup](#setup)


The ChromeAI provider is available in the `chrome-ai` module. You can install it with:

pnpm

npm

yarn

pnpm add chrome-ai


### [Enabling AI in Chrome](#enabling-ai-in-chrome)


Chrome's implementation of [built-in AI with Gemini Nano](https://developer.chrome.com/docs/ai/built-in) is experimental and will change as they test and address feedback.

Chrome built-in AI is a preview feature, you need to use chrome version 127 or greater, now in [dev](https://www.google.com/chrome/dev/?extra=devchannel) or [canary](https://www.google.com/chrome/canary/) channel, [may release on stable chanel at Jul 17, 2024](https://chromestatus.com/roadmap).

After then, you should turn on these flags:

-   [chrome://flags/#prompt-api-for-gemini-nano](chrome://flags/#prompt-api-for-gemini-nano): `Enabled`
-   [chrome://flags/#optimization-guide-on-device-model](chrome://flags/#optimization-guide-on-device-model): `Enabled BypassPrefRequirement`
-   [chrome://components/](chrome://components/): Click `Optimization Guide On Device Model` to download the model.


## [Language Models](#language-models)


The `chromeai` provider instance is a function that you can invoke to create a language model:

```
import{ chromeai }from'chrome-ai';const model =chromeai();
```

It automatically selects the correct model id. You can also pass additional settings in the second argument:

```
import{ chromeai }from'chrome-ai';const model =chromeai('generic',{// additional settings  temperature:0.5,  topK:5,});
```

You can use the following optional settings to customize:

-   **modelId** *'text' | 'generic'*

    Used to distinguish models of Gemini Nano, there is no difference in the current version.

-   **temperature** *number*

    The value is passed through to the provider. The range depends on the provider and model. For most providers, `0` means almost deterministic results, and higher values mean more randomness.

-   **topK** *number*

    Only sample from the top K options for each subsequent token.

    Used to remove "long tail" low probability responses. Recommended for advanced use cases only. You usually only need to use temperature.



## [Examples](#examples)


You can use Chrome built-in language models to generate text with the `generateText` or `streamText` function:

```
import{ generateText }from'ai';import{ chromeai }from'chrome-ai';const{ text }=awaitgenerateText({  model:chromeai(),  prompt:'Who are you?',});console.log(text);//  I am a large language model, trained by Google.
```

```
import{ streamText }from'ai';import{ chromeai }from'chrome-ai';const{ textStream }=streamText({  model:chromeai(),  prompt:'Who are you?',});let result ='';forawait(const textPart of textStream){  result = textPart;}console.log(result);//  I am a large language model, trained by Google.
```

Chrome built-in language models can also be used in the `generateObject` function:

```
import{ generateObject }from'ai';import{ chromeai }from'chrome-ai';import{ z }from'zod';const{ object }=awaitgenerateObject({  model:chromeai('text'),  schema: z.object({    recipe: z.object({      name: z.string(),      ingredients: z.array(        z.object({          name: z.string(),          amount: z.string(),}),),      steps: z.array(z.string()),}),}),  prompt:'Generate a lasagna recipe.',});console.log(object);// { recipe: {...} }
```

Due to model reasons, `toolCall` and `streamObject` are not supported. We are making an effort to implement these functions by prompt engineering.
