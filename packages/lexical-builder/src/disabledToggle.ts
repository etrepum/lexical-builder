export interface DisabledToggleOptions {
  disabled?: boolean;
  register: () => () => void;
}
export interface DisabledToggleOutput {
  isDisabled: () => boolean;
  setDisabled: (disabled: boolean) => void;
}
export function disabledToggle(
  opts: DisabledToggleOptions,
): [DisabledToggleOutput, () => void] {
  let cleanup: null | (() => void) = null;
  function isDisabled(): boolean {
    return cleanup !== null;
  }
  function setDisabled(disabled: boolean): void {
    if (!disabled && cleanup === null) {
      cleanup = opts.register();
    } else if (disabled && cleanup !== null) {
      cleanup();
      cleanup = null;
    }
  }
  setDisabled(Boolean(opts.disabled));
  return [
    { isDisabled, setDisabled },
    () => {
      setDisabled(false);
    },
  ];
}
