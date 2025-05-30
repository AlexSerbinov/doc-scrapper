# Stream Text


---
url: https://ai-sdk.dev/cookbook/node/stream-text
description: Learn how to stream text using the AI SDK and Node
---


# [Stream Text](#stream-text)


Text generation can sometimes take a long time to complete, especially when you're generating a couple of paragraphs. In such cases, it is useful to stream the text to the client in real-time. This allows the client to display the generated text as it is being generated, rather than have users wait for it to complete before displaying the result.

```
Introducing "Joyful Hearts Day" - a holiday dedicated to spreading love, joy, and kindness to others.On Joyful Hearts Day, people exchange handmade cards, gifts, and acts of kindness to show appreciation and love for their friends, family, and community members. It is a day to focus on positivity and gratitude, spreading happiness and warmth to those around us.Traditions include decorating homes and public spaces with hearts and bright colors, hosting community events such as charity drives, volunteer projects, and festive gatherings. People also participate in random acts of kindness, such as paying for someone's coffee, leaving encouraging notes for strangers, or simply offering a helping hand to those in need.One of the main traditions of Joyful Hearts Day is the "Heart Exchange" where people write heartfelt messages to loved ones and exchange them in person or through mail. These messages can be words of encouragement, expressions of gratitude, or simply a reminder of how much they are loved.Overall, Joyful Hearts Day is a day to celebrate love, kindness, and positivity, and to spread joy and happiness to all those around us. It is a reminder to appreciate the people in our lives and to make the world a brighter and more loving place.
```


## [Without reader](#without-reader)


```
import{ streamText }from'ai';import{ openai }from'@ai-sdk/openai';const result =streamText({  model:openai('gpt-3.5-turbo'),  maxTokens:512,  temperature:0.3,  maxRetries:5,  prompt:'Invent a new holiday and describe its traditions.',});forawait(const textPart of result.textStream){console.log(textPart);}
```


## [With reader](#with-reader)


```
import{ streamText }from'ai';import{ openai }from'@ai-sdk/openai';const result =streamText({  model:openai('gpt-3.5-turbo'),  maxTokens:512,  temperature:0.3,  maxRetries:5,  prompt:'Invent a new holiday and describe its traditions.',});const reader = result.textStream.getReader();while(true){const{ done, value }=await reader.read();if(done){break;}console.log(value);}
```
