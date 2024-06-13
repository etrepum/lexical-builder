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

import { definePlan } from "@etrepum/lexical-builder-core";
import { safeCast } from "@etrepum/lexical-builder-core";

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
}

/**
 * Registers necessary listeners to manage undo/redo history stack and related
 * editor commands, via the @lexical/history module.
 */
export const HistoryPlan = definePlan({
  config: safeCast<HistoryConfig>({
    createInitialHistoryState: createEmptyHistoryState,
    delay: 300,
  }),
  name: "@etrepum/lexical-builder/HistoryPlan",
  register(editor, { delay, createInitialHistoryState }) {
    return registerHistory(editor, createInitialHistoryState(), delay);
  },
});
