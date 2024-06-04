/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export const PACKAGE_VERSION: string = import.meta.env.PACKAGE_VERSION;

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
export {
  type ErrorBoundaryType,
  type ErrorBoundaryProps,
} from "./useReactDecorators";
