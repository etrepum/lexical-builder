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
  declarePeerDependency,
} from "@etrepum/lexical-builder-core";
export {
  LexicalBuilder,
  buildEditorFromPlans,
  coerceToPlanArgument,
} from "./LexicalBuilder";
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
  type RootPlan,
  type RootPlanArgument,
  type NormalizedLexicalPlanArgument,
  type PlanConfigBase,
  type RegisterState,
  type RegisterCleanup,
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
