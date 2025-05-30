# TypeScript error "Cannot find namespace 'JSX'"


---
url: https://ai-sdk.dev/docs/troubleshooting/typescript-cannot-find-namespace-jsx
description: Troubleshooting errors related to TypeScript and JSX.
---


# [TypeScript error "Cannot find namespace 'JSX'"](#typescript-error-cannot-find-namespace-jsx)



## [Issue](#issue)


I am using the AI SDK in a project without React, e.g. an Hono server, and I get the following error: `error TS2503: Cannot find namespace 'JSX'.`


## [Background](#background)


The AI SDK has a dependency on `@types/react` which defines the `JSX` namespace. It will be removed in the next major version of the AI SDK.


## [Solution](#solution)


You can install the `@types/react` package as a dependency to fix the error.

```
npminstall @types/react
```
