/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
import { definePlan } from "@etrepum/lexical-builder-core";
import { DragonPlan } from "./DragonPlan";

/**
 * A plan to register \@lexical/rich-text behavior and nodes
 * ({@link HeadingNode}, {@link QuoteNode})
 */
export const RichTextPlan = definePlan({
  conflictsWith: ["@lexical/plain-text"],
  name: "@lexical/rich-text",
  nodes: [HeadingNode, QuoteNode],
  dependencies: [DragonPlan],
  register: registerRichText,
});
