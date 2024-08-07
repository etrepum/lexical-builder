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
  type LexicalEditorWithDispose,
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
  type PlanRegisterState,
  type NormalizedPeerDependency,
} from "@etrepum/lexical-builder-core";
export { safeCast } from "@etrepum/lexical-builder-core";
export { shallowMergeConfig } from "@etrepum/lexical-builder-core";
export { getPlanDependencyFromEditor } from "./getPlanDependencyFromEditor";
export {
  getPeerDependencyFromEditor,
  getPeerDependencyFromEditorOrThrow,
} from "./getPeerDependencyFromEditor";
export { getKnownTypesAndNodes, type KnownTypesAndNodes } from "./config";
export { InitialStatePlan, type InitialStateConfig } from "./InitialStatePlan";
// These plan definitions should all be colocated with their implementations, only here for convenience
export { type AutoFocusConfig, AutoFocusPlan } from "./AutoFocusPlan";
export { type DragonConfig, type DragonOutput, DragonPlan } from "./DragonPlan";
export {
  type HistoryConfig,
  type HistoryOutput,
  HistoryPlan,
  SharedHistoryPlan,
} from "./HistoryPlan";
export { PlainTextPlan } from "./PlainTextPlan";
export { RichTextPlan } from "./RichTextPlan";
export {
  disabledToggle,
  registerDisabled,
  type DisabledToggleOutput,
  type DisabledToggleOptions,
} from "./disabledToggle";
export {
  type WritableStore,
  type ReadableStore,
  type StoreSubscriber,
  Store,
} from "./Store";
