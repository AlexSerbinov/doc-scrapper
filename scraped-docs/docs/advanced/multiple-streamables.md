# Multiple Streams


---
url: https://ai-sdk.dev/docs/advanced/multiple-streamables
description: Learn to handle multiple streamables in your application.
---


# [Multiple Streams](#multiple-streams)



## [Multiple Streamable UIs](#multiple-streamable-uis)


The AI SDK RSC APIs allow you to compose and return any number of streamable UIs, along with other data, in a single request. This can be useful when you want to decouple the UI into smaller components and stream them separately.

```
'use server';import{ createStreamableUI }from'ai/rsc';exportasyncfunctiongetWeather(){const weatherUI =createStreamableUI();const forecastUI =createStreamableUI();  weatherUI.update(<div>Loading weather...</div>);  forecastUI.update(<div>Loading forecast...</div>);getWeatherData().then(weatherData=>{    weatherUI.done(<div>{weatherData}</div>);});getForecastData().then(forecastData=>{    forecastUI.done(<div>{forecastData}</div>);});// Return both streamable UIs and other data fields.return{    requestedAt:Date.now(),    weather: weatherUI.value,    forecast: forecastUI.value,};}
```

The client side code is similar to the previous example, but the [tool call](/docs/ai-sdk-core/tools-and-tool-calling) will return the new data structure with the weather and forecast UIs. Depending on the speed of getting weather and forecast data, these two components might be updated independently.


## [Nested Streamable UIs](#nested-streamable-uis)


You can stream UI components within other UI components. This allows you to create complex UIs that are built up from smaller, reusable components. In the example below, we pass a `historyChart` streamable as a prop to a `StockCard` component. The StockCard can render the `historyChart` streamable, and it will automatically update as the server responds with new data.

```
asyncfunctiongetStockHistoryChart({ symbol: string }){'use server';const ui =createStreamableUI(<Spinner/>);// We need to wrap this in an async IIFE to avoid blocking.(async()=>{const price =awaitgetStockPrice({symbol});// Show a spinner as the history chart for now.const historyChart =createStreamableUI(<Spinner/>);    ui.done(<StockCardhistoryChart={historyChart.value}price={price}/>);// Getting the history data and then update that part of the UI.const historyData =awaitfetch('https://my-stock-data-api.com');    historyChart.done(<HistoryChartdata={historyData}/>);})();return ui;}
```
