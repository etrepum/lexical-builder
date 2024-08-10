/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { JSDOM } from "jsdom";

export function withDOM<T>(f: (window: Window) => T): T {
  const prevWindow = globalThis.window;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- handle recursive case
  if (prevWindow) {
    return f(globalThis.window);
  }
  const prevMutationObserver = globalThis.MutationObserver;
  const prevDocument = globalThis.document;
  const newDom: JSDOM = new JSDOM();
  // @ts-expect-error -- DOMWindow is not exactly Window
  const newWindow: Window & typeof globalThis = newDom.window;
  globalThis.window = newWindow;
  globalThis.document = newWindow.document;
  globalThis.MutationObserver = newWindow.MutationObserver;
  try {
    return f(newWindow);
  } finally {
    globalThis.MutationObserver = prevMutationObserver;
    globalThis.document = prevDocument;
    globalThis.window = prevWindow;
  }
}
