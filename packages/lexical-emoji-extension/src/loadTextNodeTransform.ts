import type { $textNodeTransform } from "./$textNodeTransform";

type MaybePromise<T> = T | Promise<T>;
let cache: ReturnType<typeof loadTextNodeTransform> | undefined;
export function loadTextNodeTransform(): MaybePromise<
  typeof $textNodeTransform
> {
  if (!cache) {
    cache = import("./$textNodeTransform").then((mod) => {
      cache = mod.$textNodeTransform;
      return cache;
    });
  }
  return cache;
}
