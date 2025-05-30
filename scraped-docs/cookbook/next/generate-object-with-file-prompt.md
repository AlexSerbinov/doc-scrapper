# Generate Object with File Prompt through Form Submission


---
url: https://ai-sdk.dev/cookbook/next/generate-object-with-file-prompt
description: Learn how to generate object with file prompt through form submission using the AI SDK and Next.js
---


# [Generate Object with File Prompt through Form Submission](#generate-object-with-file-prompt-through-form-submission)


This feature is limited to models/providers that support PDF inputs ([Anthropic](/providers/ai-sdk-providers/anthropic#pdf-support), [Google Gemini](/providers/ai-sdk-providers/google-generative-ai#file-inputs), and [Google Vertex](/providers/ai-sdk-providers/google-vertex#file-inputs)).

With select models, you can send PDFs (files) as part of your prompt. Let's create a simple Next.js application that allows a user to upload a PDF send it to an LLM for summarization.


## [Client](#client)


On the frontend, create a form that allows the user to upload a PDF. When the form is submitted, send the PDF to the `/api/analyze` route.

```
'use client';import{ useState }from'react';exportdefaultfunctionPage(){const[description, setDescription]=useState<string>();const[loading, setLoading]=useState(false);return(<div><form        action={asyncformData=>{try{setLoading(true);const response =awaitfetch('/api/analyze',{              method:'POST',              body: formData,});setLoading(false);if(response.ok){setDescription(await response.text());}}catch(error){console.error('Analysis failed:', error);}}}><div><label>UploadImage</label><inputname="pdf"type="file"accept="application/pdf"/></div><buttontype="submit"disabled={loading}>Submit{loading &&'ing...'}</button></form>{description &&<pre>{description}</pre>}</div>);}
```


## [Server](#server)


On the server, create an API route that receives the PDF, sends it to the LLM, and returns the result. This example uses the [`generateObject`](/docs/reference/ai-sdk-core/generate-object) function to generate the summary as part of a structured output.

```
import{ generateObject }from'ai';import{ anthropic }from'@ai-sdk/anthropic';import{ z }from'zod';exportasyncfunctionPOST(request:Request){const formData =await request.formData();const file = formData.get('pdf')asFile;const result =awaitgenerateObject({    model:anthropic('claude-3-5-sonnet-latest'),    messages:[{        role:'user',        content:[{type:'text',            text:'Analyze the following PDF and generate a summary.',},{type:'file',            data:await file.arrayBuffer(),            mimeType:'application/pdf',},],},],    schema: z.object({      summary: z.string().describe('A 50 word summary of the PDF.'),}),});returnnewResponse(result.object.summary);}
```
