# NaN token counts when using streamText with OpenAI models


---
url: https://ai-sdk.dev/docs/troubleshooting/nan-token-counts-openai-streaming
description: Troubleshooting errors related to NaN token counts in OpenAI streaming.
---


# [`NaN` token counts when using `streamText` with OpenAI models](#nan-token-counts-when-using-streamtext-with-openai-models)



## [Issue](#issue)


I am using `streamText` with the [OpenAI provider for the AI SDK](/providers/ai-sdk-providers/openai) and OpenAI models. I use [`createOpenAI`](/providers/ai-sdk-providers/openai#provider-instance) to create the provider instance. When I try to get the token counts, I get `NaN` values.


## [Background](#background)


OpenAI introduced `streamOptions` parameters to enable token counts in the stream. However, this was a breaking change for OpenAI-compatible providers, and we therefore made it opt-in.


## [Solution](#solution)


When you use [`createOpenAI`](/providers/ai-sdk-providers/openai#provider-instance), you can enable a `strict` compatibility model:

```
import{ createOpenAI }from'@ai-sdk/openai';const openai =createOpenAI({  compatibility:'strict',});
```

This will enable the token counts in the stream. When you use the default `openai` provider instance, the setting is enabled by default.
