/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { registerPlainText } from "@lexical/plain-text";
import { defineExtension } from "@etrepum/lexical-builder-core";
import { DragonExtension } from "./DragonExtension";

/**
 * A extension to register \@lexical/plain-text behavior
 */
export const PlainTextExtension = defineExtension({
  conflictsWith: ["@lexical/rich-text"],
  name: "@lexical/plain-text",
  dependencies: [DragonExtension],
  register: registerPlainText,
});
