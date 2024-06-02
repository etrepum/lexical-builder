/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export { type AutoFocusConfig, AutoFocusPlan } from "./AutoFocusPlan";
export { configPlan, definePlan, defineRootPlan } from "./definePlan";
export { DragonPlan } from "./DragonPlan";
export { type HistoryConfig, HistoryPlan } from "./HistoryPlan";
export { LexicalBuilder, buildEditorFromPlans } from "./LexicalBuilder";
export { PlainTextPlan } from "./PlainTextPlan";
export {
  type DecoratorComponentProps,
  type DecoratorComponentType,
  type EditorChildrenComponentProps,
  type EditorChildrenComponentType,
  type EditorComponentProps,
  type EditorComponentType,
  LexicalPlanComposer,
  type LexicalPlanComposerProps,
  type ReactConfig,
  ReactPlan,
} from "./ReactPlan";
export {
  type HostMountCommandArg,
  type MountPluginCommandArg,
  type Container,
  mountReactPluginComponent,
  mountReactPluginElement,
  mountReactPluginHost,
  REACT_MOUNT_PLUGIN_COMMAND,
  REACT_PLUGIN_HOST_MOUNT_COMMAND,
  ReactPluginHostPlan,
} from "./ReactPluginHostPlan";
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
  type LexicalPlanRegistry,
  type NormalizedLexicalPlanArgument,
  type PlanConfigBase,
  type RegisterState,
} from "./types";
export {
  type ErrorBoundaryType,
  type ErrorBoundaryProps,
} from "./useReactDecorators";
