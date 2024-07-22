import { Store, type WritableStore } from "./Store";

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
  let cleanup: null | (() => void) = null;
  disabled.subscribe((isDisabled) => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    if (!isDisabled) {
      cleanup = opts.register();
    }
  });
  return [
    { disabled },
    () => {
      disabled.set(true);
    },
  ];
}
