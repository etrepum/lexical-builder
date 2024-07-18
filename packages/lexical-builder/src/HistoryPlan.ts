/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  createEmptyHistoryState,
  type HistoryState,
  registerHistory,
} from "@lexical/history";
import {
  definePlan,
  provideOutput,
  safeCast,
} from "@etrepum/lexical-builder-core";
import { disabledToggle } from "./disabledToggle";

export interface HistoryConfig {
  /**
   * The time (in milliseconds) the editor should delay generating a new history stack,
   * instead of merging the current changes with the current stack. The default is 300ms.
   */
  delay: number;
  /**
   * The initial history state, the default is {@link createEmptyHistoryState}.
   */
  createInitialHistoryState: () => HistoryState;
  /**
   * Whether history is disabled or not
   */
  disabled: boolean;
}

export interface HistoryOutput {
  isDisabled: () => boolean;
  setDisabled: (disabled: boolean) => void;
}

/**
 * Registers necessary listeners to manage undo/redo history stack and related
 * editor commands, via the \@lexical/history module.
 */
export const HistoryPlan = definePlan({
  config: safeCast<HistoryConfig>({
    createInitialHistoryState: createEmptyHistoryState,
    delay: 300,
    disabled: false,
  }),
  name: "@etrepum/lexical-builder/History",
  register: (editor, { delay, createInitialHistoryState, disabled }) =>
    provideOutput<HistoryOutput>(
      ...disabledToggle({
        disabled,
        register: () =>
          registerHistory(editor, createInitialHistoryState(), delay),
      }),
    ),
});
