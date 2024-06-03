/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/** An open interface for Name -> Config mappings */
export interface LexicalPlanRegistry {}
export const PACKAGE_VERSION = import.meta.env.PACKAGE_VERSION;

export { type AutoFocusConfig, AutoFocusPlan } from "./AutoFocusPlan";
export { configPlan, definePlan, defineRootPlan } from "./definePlan";
export { DragonPlan } from "./DragonPlan";
export { type HistoryConfig, HistoryPlan } from "./HistoryPlan";
export { LexicalBuilder, buildEditorFromPlans } from "./LexicalBuilder";
export { PlainTextPlan } from "./PlainTextPlan";
export { RichTextPlan } from "./RichTextPlan";
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
