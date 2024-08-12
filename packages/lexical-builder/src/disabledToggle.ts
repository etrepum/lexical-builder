import { Store, type WritableStore } from "./Store";
import { registerStoreToggle } from "./registerStoreToggle";

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
  return [
    { disabled },
    registerStoreToggle(disabled, (v) => !v, opts.register),
  ];
}
