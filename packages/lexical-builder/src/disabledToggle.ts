import { mergeRegister } from "@lexical/utils";
import { Store, type WritableStore, type ReadableStore } from "./Store";

export interface DisabledToggleOptions {
  disabled?: boolean;
  register: () => () => void;
}
export interface DisabledToggleOutput {
  disabled: WritableStore<boolean>;
}
export function disabledToggle(
  opts: DisabledToggleOptions,
): [DisabledToggleOutput, () => void] {
  const disabled = new Store(Boolean(opts.disabled));
  return [{ disabled }, registerDisabled(disabled, opts.register)];
}

export function registerDisabled(
  disabledStore: ReadableStore<boolean>,
  register: () => () => void,
): () => void {
  let cleanup: null | (() => void) = null;
  return mergeRegister(
    () => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    },
    disabledStore.subscribe((isDisabled) => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
      if (!isDisabled) {
        cleanup = register();
      }
    }),
  );
}
