/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { registerDragonSupport } from "@lexical/dragon";
import {
  definePlan,
  provideOutput,
  safeCast,
} from "@etrepum/lexical-builder-core";
import { disabledToggle } from "./disabledToggle";

export interface DragonConfig {
  disabled: boolean;
}
export interface DragonOutput {
  isDisabled: () => boolean;
  setDisabled: (disabled: boolean) => void;
}

/**
 * Add Dragon speech to text input support to the editor, via the
 * \@lexical/dragon module.
 */
export const DragonPlan = definePlan({
  name: "@lexical/dragon",
  config: safeCast<DragonConfig>({ disabled: false }),
  register: (editor, config) =>
    provideOutput<DragonOutput>(
      ...disabledToggle({
        disabled: config.disabled,
        register: () => registerDragonSupport(editor),
      }),
    ),
});
