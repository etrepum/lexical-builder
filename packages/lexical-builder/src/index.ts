/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * An open interface for Name -> Config mappings. If you are defining a
 * plan with non-empty config and it may be used as a peerDependency then
 * you should extend this as follows:
 *
 * @example Extending LexicalPlanRegistry
 * ```ts
 * const SOME_PLAN_NAME = "@some/plan";
 * interface SomePlanConfig {
 *   // …
 * }
 * declare module '@etrepum/lexical-builder' {
 *   interface LexicalPlanRegistry {
 *     [SOME_PLAN_NAME]: SomePlanConfig;
 *   }
 * }
 * ```
 */
export interface LexicalPlanRegistry {}
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
