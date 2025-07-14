/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { registerDragonSupport } from "@lexical/dragon";
import {
  defineExtension,
  provideOutput,
  safeCast,
} from "@etrepum/lexical-builder-core";
import { disabledToggle, type DisabledToggleOutput } from "./disabledToggle";

export interface DragonConfig {
  disabled: boolean;
}
export type DragonOutput = DisabledToggleOutput;

/**
 * Add Dragon speech to text input support to the editor, via the
 * \@lexical/dragon module.
 */
export const DragonExtension = defineExtension({
  name: "@lexical/dragon",
  config: safeCast<DragonConfig>({ disabled: typeof window === "undefined" }),
  register: (editor, config) =>
    provideOutput<DragonOutput>(
      ...disabledToggle({
        disabled: config.disabled,
        register: () => registerDragonSupport(editor),
      }),
    ),
});
