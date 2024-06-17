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
  provideOutput,
  declarePeerDependency,
} from "@etrepum/lexical-builder-core";
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
  type LexicalPlanInit,
  type OutputComponentPlan,
  type LexicalPlanDependency,
  type NormalizedLexicalPlanArgument,
  type PlanConfigBase,
  type RegisterState,
  type NormalizedPeerDependency,
} from "@etrepum/lexical-builder-core";
export { safeCast } from "@etrepum/lexical-builder-core";
export { shallowMergeConfig } from "@etrepum/lexical-builder-core";
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
