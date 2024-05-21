/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { registerDragonSupport } from "@lexical/dragon";

import { definePlan } from "./definePlan";

export const DragonPlan = definePlan({
  config: {},
  name: "@lexical/dragon",
  register: registerDragonSupport,
});
