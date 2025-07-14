/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export const PACKAGE_VERSION: string = import.meta.env.PACKAGE_VERSION;

export {
  configExtension,
  defineExtension,
  provideOutput,
  declarePeerDependency,
} from "./defineExtension";
export {
  type AnyLexicalExtension,
  type AnyLexicalExtensionArgument,
  type AnyNormalizedLexicalExtensionArgument,
  type LexicalEditorWithDispose,
  type InitialEditorConfig,
  type InitialEditorStateType,
  type LexicalExtension,
  type LexicalExtensionArgument,
  type LexicalExtensionConfig,
  type LexicalExtensionInit,
  type LexicalExtensionName,
  type LexicalExtensionOutput,
  type OutputComponentExtension,
  type LexicalExtensionDependency,
  type NormalizedLexicalExtensionArgument,
  type ExtensionConfigBase,
  type ExtensionInitState,
  type ExtensionRegisterState,
  type RegisterCleanup,
  type NormalizedPeerDependency,
} from "./types";
export {
  type LexicalExtensionInternal,
  type initTypeSymbol,
  type configTypeSymbol,
  type outputTypeSymbol,
} from "./internal";
export { safeCast } from "./safeCast";
export { shallowMergeConfig } from "./shallowMergeConfig";
