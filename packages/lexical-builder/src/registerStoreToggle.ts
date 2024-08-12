import { mergeRegister } from "@lexical/utils";
import type { ReadableStore } from "./Store";

export function registerStoreToggle<T>(
  store: ReadableStore<T>,
  isEnabled: (value: T) => boolean,
  register: () => () => void,
): () => void {
  let cleanup: null | (() => void) = null;
  const performCleanup = () => {
    cleanup?.();
    cleanup = null;
  };
  return mergeRegister(
    performCleanup,
    store.subscribe((value) => {
      performCleanup();
      if (isEnabled(value)) {
        cleanup = register();
      }
    }),
  );
}
