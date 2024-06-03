/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export const PACKAGE_VERSION = import.meta.env.PACKAGE_VERSION;

export { configPlan, definePlan, defineRootPlan } from "./definePlan";
export { LexicalBuilder, buildEditorFromPlans } from "./LexicalBuilder";
export {
  type AnyLexicalPlan,
  type AnyLexicalPlanArgument,
  type EditorHandle,
  type InitialEditorStateType,
  type LexicalPeerConfig,
  type LexicalPlan,
  type LexicalPlanArgument,
  type LexicalPlanConfig,
  type LexicalPlanName,
  type NormalizedLexicalPlanArgument,
  type PlanConfigBase,
  type RegisterState,
} from "./types";
export { safeCast } from "./safeCast";
export { shallowMergeConfig } from "./shallowMergeConfig";
// These plan definitions should all be colocated with their implementations, only here for convenience
export { type AutoFocusConfig, AutoFocusPlan } from "./AutoFocusPlan";
export { DragonPlan } from "./DragonPlan";
export { type HistoryConfig, HistoryPlan } from "./HistoryPlan";
export { PlainTextPlan } from "./PlainTextPlan";
export { RichTextPlan } from "./RichTextPlan";
