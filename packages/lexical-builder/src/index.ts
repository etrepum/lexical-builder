/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export { PACKAGE_VERSION } from "./PACKAGE_VERSION";
export {
  configPlan,
  definePlan,
  defineRootPlan,
  provideOutput,
} from "./definePlan";
export { LexicalBuilder, buildEditorFromPlans } from "./LexicalBuilder";
export {
  type AnyLexicalPlan,
  type AnyLexicalPlanArgument,
  type EditorHandle,
  type InitialEditorStateType,
  type LexicalPlan,
  type LexicalPlanArgument,
  type LexicalPlanConfig,
  type LexicalPlanName,
  type LexicalPlanOutput,
  type LexicalPlanDependency,
  type LexicalPeerConfig,
  type LexicalPeerDependency,
  type LexicalPeerPlan,
  type NormalizedLexicalPlanArgument,
  type PlanConfigBase,
  type RegisterState,
  type RegisterCleanup,
} from "./types";
export { safeCast } from "./safeCast";
export { shallowMergeConfig } from "./shallowMergeConfig";
export {
  $getPlanDependency,
  getPlanDependencyFromEditor,
} from "./getPlanDependencyFromEditor";
export {
  $getPeerDependency,
  getPeerDependencyFromEditor,
} from "./getPeerDependencyFromEditor";
// These plan definitions should all be colocated with their implementations, only here for convenience
export { type AutoFocusConfig, AutoFocusPlan } from "./AutoFocusPlan";
export { DragonPlan } from "./DragonPlan";
export { type HistoryConfig, HistoryPlan } from "./HistoryPlan";
export { PlainTextPlan } from "./PlainTextPlan";
export { RichTextPlan } from "./RichTextPlan";
/**
 * An open interface for Name -> Config mappings. If you are defining a
 * plan with non-empty config and it may be used as a peerDependency then
 * you should extend this as follows:
 *
 * @example Extending LexicalPlanRegistry
 * ```ts
 * export const SomePlan = definePlan({
 *   name: "@some/plan",
 *   config: { className: "default" }
 * });
 * declare module '@etrepum/lexical-builder' {
 *   interface LexicalPlanRegistry {
 *     [SomePlan.name]: typeof SomePlan;
 *   }
 * }
 * ```
 */
export interface LexicalPlanRegistry {}
