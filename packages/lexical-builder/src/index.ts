/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export { PACKAGE_VERSION } from "./PACKAGE_VERSION";
export {
  configExtension,
  defineExtension,
  provideOutput,
  declarePeerDependency,
  safeCast,
  shallowMergeConfig,
  type AnyLexicalExtension,
  type AnyLexicalExtensionArgument,
  type LexicalEditorWithDispose,
  type InitialEditorStateType,
  type LexicalExtension,
  type LexicalExtensionArgument,
  type LexicalExtensionConfig,
  type LexicalExtensionName,
  type LexicalExtensionOutput,
  type LexicalExtensionInit,
  type OutputComponentExtension,
  type LexicalExtensionDependency,
  type NormalizedLexicalExtensionArgument,
  type ExtensionConfigBase,
  type ExtensionRegisterState,
  type NormalizedPeerDependency,
} from "@etrepum/lexical-builder-core";
export { LexicalBuilder, buildEditorFromExtensions } from "./LexicalBuilder";
export { getExtensionDependencyFromEditor } from "./getExtensionDependencyFromEditor";
export {
  getPeerDependencyFromEditor,
  getPeerDependencyFromEditorOrThrow,
} from "./getPeerDependencyFromEditor";
export { getKnownTypesAndNodes, type KnownTypesAndNodes } from "./config";
export { InitialStateExtension, type InitialStateConfig } from "./InitialStateExtension";
// These extension definitions should all be colocated with their implementations, only here for convenience
export { type AutoFocusConfig, AutoFocusExtension } from "./AutoFocusExtension";
export { type DragonConfig, type DragonOutput, DragonExtension } from "./DragonExtension";
export {
  type HistoryConfig,
  type HistoryOutput,
  HistoryExtension,
  SharedHistoryExtension,
} from "./HistoryExtension";
export { PlainTextExtension } from "./PlainTextExtension";
export { RichTextExtension } from "./RichTextExtension";
export {
  disabledToggle,
  type DisabledToggleOutput,
  type DisabledToggleOptions,
} from "./disabledToggle";
export { registerStoreToggle } from "./registerStoreToggle";
export {
  type WritableStore,
  type ReadableStore,
  type StoreSubscriber,
  Store,
} from "./Store";
