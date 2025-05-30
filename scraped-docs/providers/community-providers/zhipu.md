# Zhipu AI Provider


---
url: https://ai-sdk.dev/providers/community-providers/zhipu
description: Learn how to use the Zhipu provider.
---


# [Zhipu AI Provider](#zhipu-ai-provider)


[Zhipu AI Provider](https://github.com/Xiang-CH/zhipu-ai-provider) is a community provider for the [AI SDK](/). It enables seamless integration with **GLM** and Embedding Models provided on [bigmodel.cn](https://bigmodel.cn/) by [ZhipuAI](https://www.zhipuai.cn/).


## [Setup](#setup)


pnpm

npm

yarn

pnpm add zhipu-ai-provider

Set up your `.env` file / environment with your API key.

```
ZHIPU_API_KEY=<your-api-key>
```


## [Provider Instance](#provider-instance)


You can import the default provider instance `zhipu` from `zhipu-ai-provider` (This automatically reads the API key from the environment variable `ZHIPU_API_KEY`):

```
import{ zhipu }from'zhipu-ai-provider';
```

Alternatively, you can create a provider instance with custom configuration with `createZhipu`:

```
import{ createZhipu }from'zhipu-ai-provider';const zhipu =createZhipu({  baseURL:'https://open.bigmodel.cn/api/paas/v4',  apiKey:'your-api-key',});
```

You can use the following optional settings to customize the Zhipu provider instance:

-   **baseURL**: *string*

    -   Use a different URL prefix for API calls, e.g. to use proxy servers. The default prefix is `https://open.bigmodel.cn/api/paas/v4`.
-   **apiKey**: *string*

    -   Your API key for Zhipu [BigModel Platform](https://bigmodel.cn/). If not provided, the provider will attempt to read the API key from the environment variable `ZHIPU_API_KEY`.
-   **headers**: *Record<string, string>*

    -   Custom headers to include in the requests.


## [Example](#example)


```
import{ zhipu }from'zhipu-ai-provider';const{ text }=awaitgenerateText({  model:zhipu('glm-4-plus'),  prompt:'Why is the sky blue?',});console.log(result);
```


## [Documentation](#documentation)


-   **[Zhipu documentation](https://bigmodel.cn/dev/welcome)**
