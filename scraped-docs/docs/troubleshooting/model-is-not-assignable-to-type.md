# Model is not assignable to type "LanguageModelV1"


---
url: https://ai-sdk.dev/docs/troubleshooting/model-is-not-assignable-to-type
description: Troubleshooting errors related to incompatible models.
---


# [Model is not assignable to type "LanguageModelV1"](#model-is-not-assignable-to-type-languagemodelv1)



## [Issue](#issue)


I have updated the AI SDK and now I get the following error: `Type 'SomeModel' is not assignable to type 'LanguageModelV1'.`

Similar errors can occur with `EmbeddingModelV1` as well.


## [Background](#background)


Sometimes new features are being added to the model specification. This can cause incompatibilities with older provider versions.


## [Solution](#solution)


Update your provider packages and the AI SDK to the latest version.
