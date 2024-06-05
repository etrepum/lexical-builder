export const scheduleMicrotask =
  "queueMicrotask" in globalThis
    ? queueMicrotask
    : (fn: () => void) => Promise.resolve().then(fn);
