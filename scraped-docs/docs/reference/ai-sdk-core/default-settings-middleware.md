# defaultSettingsMiddleware()


---
url: https://ai-sdk.dev/docs/reference/ai-sdk-core/default-settings-middleware
description: Middleware that applies default settings for language models
---


# [`defaultSettingsMiddleware()`](#defaultsettingsmiddleware)


`defaultSettingsMiddleware` is a middleware function that applies default settings to language model calls. This is useful when you want to establish consistent default parameters across multiple model invocations.

```
import{ defaultSettingsMiddleware }from'ai';const middleware =defaultSettingsMiddleware({  settings:{    temperature:0.7,    maxTokens:1000,// other settings...},});
```


## [Import](#import)


import { defaultSettingsMiddleware } from "ai"


## [API Signature](#api-signature)



### [Parameters](#parameters)


The middleware accepts a configuration object with the following properties:

-   `settings`: An object containing default parameter values to apply to language model calls. These can include any valid `LanguageModelV1CallOptions` properties and optional provider metadata.


### [Returns](#returns)


Returns a middleware object that:

-   Merges the default settings with the parameters provided in each model call
-   Ensures that explicitly provided parameters take precedence over defaults
-   Merges provider metadata objects


### [Usage Example](#usage-example)


```
import{ streamText }from'ai';import{ wrapLanguageModel }from'ai';import{ defaultSettingsMiddleware }from'ai';import{ openai }from'ai';// Create a model with default settingsconst modelWithDefaults =wrapLanguageModel({  model: openai.ChatTextGenerator({ model:'gpt-4'}),  middleware:defaultSettingsMiddleware({    settings:{      temperature:0.5,      maxTokens:800,      providerMetadata:{        openai:{          tags:['production'],},},},}),});// Use the model - default settings will be appliedconst result =awaitstreamText({  model: modelWithDefaults,  prompt:'Your prompt here',// These parameters will override the defaults  temperature:0.8,});
```


## [How It Works](#how-it-works)


The middleware:

1.  Takes a set of default settings as configuration
2.  Merges these defaults with the parameters provided in each model call
3.  Ensures that explicitly provided parameters take precedence over defaults
4.  Merges provider metadata objects from both sources
