/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CreateEditorArgs, EditorState, LexicalEditor } from "lexical";
import type { LexicalPlanRegistry } from "./";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyLexicalPlan = LexicalPlan<any, string>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyLexicalPlanArgument = LexicalPlanArgument<any, string>;
export type PlanConfigBase = Record<never, never>;

export type NormalizedLexicalPlanArgument<
  Config extends PlanConfigBase,
  Name extends string,
> = [LexicalPlan<Config, Name>, Config, ...Config[]];

export interface RegisterState {
  signal: AbortSignal;
  getPeerConfig<Name extends keyof LexicalPlanRegistry>(
    name: string,
  ): undefined | LexicalPlanConfig<LexicalPlanRegistry[Name]>;
  getDependencyConfig<Dependency extends AnyLexicalPlan>(
    dep: Dependency,
  ): LexicalPlanConfig<Dependency>;
}

export type LexicalPlanArgument<
  Config extends PlanConfigBase,
  Name extends string,
> = LexicalPlan<Config, Name> | NormalizedLexicalPlanArgument<Config, Name>;

export interface LexicalPlan<
  Config extends PlanConfigBase = PlanConfigBase,
  Name extends string = string,
> {
  /** The name of the Plan, must be unique */
  name: Name;
  /** Plan names that must not be loaded with this Plan */
  conflictsWith?: string[];
  /** Other Plans that this Plan depends on, can also be used to configure them */
  dependencies?: AnyLexicalPlanArgument[];
  /**
   * Other Plans, by name, that this Plan can optionally depend on or
   * configure, if they are directly depended on by another Plan
   */
  peerDependencies?: {
    [k in keyof LexicalPlanRegistry]?: LexicalPeerConfig<k>;
  };

  /**
   * @internal Disable root element events (for internal Meta use)
   */
  disableEvents?: CreateEditorArgs["disableEvents"];
  /**
   * Used when this editor is nested inside of another editor
   */
  parentEditor?: CreateEditorArgs["parentEditor"];
  /**
   * The namespace of this Editor. If two editors share the same
   * namespace, JSON will be the clipboard interchange format.
   * Otherwise HTML will be used.
   */
  namespace?: CreateEditorArgs["namespace"];
  /**
   * The nodes that this Plan adds to the Editor configuration, will be merged with other Plans
   */
  nodes?: CreateEditorArgs["nodes"];
  /**
   * EditorThemeClasses that will be deep merged with other Plans
   */
  theme?: CreateEditorArgs["theme"];
  /**
   * Overrides for HTML serialization (exportDOM) and
   * deserialization (importDOM) that does not require subclassing and node
   * replacement
   */
  html?: CreateEditorArgs["html"];
  /**
   * Whether the initial state of the editor is editable or not
   */
  editable?: CreateEditorArgs["editable"];
  /**
   * The editor will catch errors that happen during updates and
   * reconciliation and call this. It defaults to
   * `(error) => console.error(error)`.
   *
   * @param error The Error object
   * @param editor The editor that this error came from
   */
  onError?: (error: Error, editor: LexicalEditor) => void;
  /**
   * The initial EditorState as a JSON string, an EditorState, or a function
   * to update the editor once.
   */
  $initialEditorState?: InitialEditorStateType;
  /**
   * The default configuration specific to this Plan
   */
  config: Config;
  /**
   * By default, Config is shallow merged `{...a, ...b}`, if your Plan
   * requires other strategies (such as concatenating an Array) you can
   * implement it here.
   *
   * @param a The current configuration
   * @param b The partial configuration to merge
   * @returns The merged configuration
   */
  mergeConfig?: (a: Config, b?: Partial<Config>) => Config;
  /**
   * Add behavior to the editor (register transforms, listeners, etc.) after
   * the Editor is created.
   *
   * @param editor The editor this Plan is being registered with
   * @param config The merged configuration specific to this Plan
   * @param state An object containing an AbortSignal that can be
   *   used, and methods for accessing the merged configuration of
   *   dependencies and peerDependencies
   * @returns A clean-up function
   */
  register?: (
    editor: LexicalEditor,
    config: Config,
    state: RegisterState,
  ) => () => void;
}

export type LexicalPeerConfig<Name extends keyof LexicalPlanRegistry | string> =
  [Name] extends [keyof LexicalPlanRegistry]
    ? LexicalPlanRegistry[Name]
    : PlanConfigBase;

export type LexicalPlanConfig<Plan extends AnyLexicalPlan> = Plan["config"];

export type LexicalPlanName<Plan extends AnyLexicalPlan> = Plan["name"];

export interface EditorHandle extends Disposable {
  editor: LexicalEditor;
  dispose: () => void;
}

export type InitialEditorStateType =
  | null
  | string
  | EditorState
  | ((editor: LexicalEditor) => void);
