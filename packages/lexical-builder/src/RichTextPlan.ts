/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";

import { definePlan } from "./definePlan";

export const RichTextPlan = definePlan({
  config: {},
  conflictsWith: ["@lexical/plain-text"],
  name: "@lexical/rich-text",
  nodes: [HeadingNode, QuoteNode],
  register: registerRichText,
});
