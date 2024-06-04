/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { registerDragonSupport } from "@lexical/dragon";

import { definePlan } from "./definePlan";

/**
 * Add Dragon speech to text input support to the editor, via the
 * @lexical/dragon module.
 */
export const DragonPlan = definePlan({
  config: {},
  name: "@lexical/dragon",
  register: registerDragonSupport,
});
