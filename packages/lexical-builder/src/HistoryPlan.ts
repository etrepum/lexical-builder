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

import { definePlan } from "./definePlan";
import { safeCast } from "./safeCast";

const NAME = "@etrepum/lexical-builder/HistoryPlan";
declare module "@etrepum/lexical-builder" {
  interface LexicalPlanRegistry {
    [NAME]: HistoryConfig;
  }
}

export interface HistoryConfig {
  delay: number;
  createInitialHistoryState: () => HistoryState;
}

export const HistoryPlan = definePlan({
  config: safeCast<HistoryConfig>({
    createInitialHistoryState: createEmptyHistoryState,
    delay: 300,
  }),
  name: NAME,
  register(editor, { delay, createInitialHistoryState }) {
    return registerHistory(editor, createInitialHistoryState(), delay);
  },
});
