import React from "react";

export interface RenderToStringAsyncOptions {
  readonly scheduleFn: (callback: (...args: any[]) => void) => any;
}

export function renderToStringAsync(
  element: React.ReactElement,
  options?: RenderToStringAsyncOptions
): Promise<string>;

export function renderToStaticMarkupAsync(
  element: React.ReactElement,
  options?: RenderToStringAsyncOptions
): Promise<string>;
