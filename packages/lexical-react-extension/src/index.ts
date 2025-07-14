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
  type ReactConfig,
  type ErrorBoundaryType,
  type ErrorBoundaryProps,
  type ReactOutputs,
} from "./types";
export { ReactExtension } from "./ReactExtension";
export {
  type LexicalExtensionComposerProps,
  LexicalExtensionComposer,
} from "./LexicalExtensionComposer";
export {
  type HostMountCommandArg,
  type MountPluginCommandArg,
  mountReactPluginComponent,
  mountReactPluginElement,
  mountReactPluginHost,
  mountReactExtensionComponent,
  REACT_PLUGIN_HOST_MOUNT_ROOT_COMMAND,
  REACT_PLUGIN_HOST_MOUNT_PLUGIN_COMMAND,
  ReactPluginHostExtension,
} from "./ReactPluginHostExtension";
export { DefaultEditorChildrenComponent } from "./DefaultEditorChildrenComponent";
export {
  useExtensionDependency,
  useExtensionComponent,
  UseExtensionComponent,
  type UseExtensionComponentProps,
} from "./useExtensionComponent";
export {
  type TreeViewConfig,
  TreeViewExtensionComponent,
  TreeViewExtension,
} from "./TreeViewExtension";
