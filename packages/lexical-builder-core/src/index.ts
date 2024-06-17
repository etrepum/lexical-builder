/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export const PACKAGE_VERSION: string = import.meta.env.PACKAGE_VERSION;

export {
  configPlan,
  definePlan,
  provideOutput,
  declarePeerDependency,
} from "./definePlan";
export {
  type AnyLexicalPlan,
  type AnyLexicalPlanArgument,
  type EditorHandle,
  type InitialEditorConfig,
  type InitialEditorStateType,
  type LexicalPlan,
  type LexicalPlanArgument,
  type LexicalPlanConfig,
  type LexicalPlanInit,
  type LexicalPlanName,
  type LexicalPlanOutput,
  type OutputComponentPlan,
  type LexicalPlanDependency,
  type NormalizedLexicalPlanArgument,
  type PlanConfigBase,
  type RegisterState,
  type RegisterCleanup,
  type NormalizedPeerDependency,
} from "./types";
export {
  type LexicalPlanInternal,
  type initTypeSymbol,
  type configTypeSymbol,
  type outputTypeSymbol,
} from "./internal";
export { safeCast } from "./safeCast";
export { shallowMergeConfig } from "./shallowMergeConfig";
