/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { registerPlainText } from "@lexical/plain-text";

import { definePlan } from "@etrepum/lexical-builder-core";

/**
 * A plan to register @lexical/plain-text behavior
 */
export const PlainTextPlan = definePlan({
  config: {},
  conflictsWith: ["@lexical/rich-text"],
  name: "@lexical/plain-text",
  register: registerPlainText,
});
