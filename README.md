# React Render To String Async

Non-blocking asynchronous alternative to `React.renderToString` and `React.renderToStaticMarkup`.

```js
import React from "react";
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import {
  renderToStringAsync,
  renderToStaticMarkupAsync,
} from "react-render-to-string-async";

const root = React.createElement("div");

const syncStr = renderToString(root);
const asyncStr = await renderToStringAsync(root);

console.log(syncStr === asyncStr); // true

const syncStaticMarkup = renderToStaticMarkup(root);
const asyncStaticMarkup = await renderToStaticMarkupAsync(root);

console.log(syncStaticMarkup === asyncStaticMarkup); // true
```

## Why?

`React.renderToString` (and `React.renderToStaticMarkup`) can be very slow on large component trees and worse still it's blocking, meaning tasks waiting in the event queue won't be executed until it's fully complete.

`React.renderToStringAsync` (and `React.renderToStaticMarkupAsync`) will perform work in chunks, yielding to the event loop, allowing rendering to be interleaved with other tasks.

> NOTE: React also offers `React.renderToNodeStream` (and `React.renderToStaticNodeStream`) which allows you to send individual chunks, one at a time and potentially yield to the event loop, however often this isn't suitable when server side rendering, as you need to finish the render before you can determine the appropriate response code, e.g. sending a 404 if the render eventually says the page is not found.

## How?

Nothing clever is going on here, we're merely wrapping `React.renderToNodeStream` (and `React.renderToStaticNodeStream`) in a promise API.

This means, just like `React.renderToString`, backpressure is not handled so you should expect the entire html string in memory at once.

## API

```ts
type renderToStringAsync = (
  element: React.ReactElement,
  options?: Options
) => Promise<string>;

type renderToStaticMarkupAsync = (
  element: React.ReactElement,
  options?: Options
) => Promise<string>;

interface Options {
  scheduleFn?: (fn) => any; // defaults to `setImmediate`
}
```

## Performance

> DISCLAIMER: This is purely an experiment and has not yet been proven in a production environment.

### Hypothesis

By sharing the CPU time more evenly among requests, we should see a lower standard deviation in response times. Cheaper requests should benefit
the most, as they have an opportunity to finish without waiting for more expensive requests to complete.

However, the median response time is expected to increase, as a particular request does not have unrestricted access to the CPU.

### Synthetic Benchmarks

Very surprisingly, `renderToStringAsync (setImmediate)` appears to be faster than `React.renderToString` when given a large tree. It's slower however on smaller trees. See [Benchmarks](benchmark).

Additionally, it appears `renderToStringAsync (process.nextTick)` and `renderToStringAsync ((fn) => fn())` are faster still, however they do not yield to the event loop; perhaps a nice alternative if yielding in fact results in poorer overall performance.
