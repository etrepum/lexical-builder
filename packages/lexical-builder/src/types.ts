/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {CreateEditorArgs, EditorState, LexicalEditor} from 'lexical';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyLexicalPlan = LexicalPlan<any, string>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyLexicalPlanArgument = LexicalPlanArgument<any, string>;
export type PlanConfigBase = Record<never, never>;

export type NormalizedLexicalPlanArgument<
  Config extends PlanConfigBase,
  Name extends string,
> = [LexicalPlan<Config, Name>, Config, ...Config[]];

export interface LexicalPlanRegistry {}

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
  name: Name;
  conflictsWith?: string[];
  dependencies?: AnyLexicalPlanArgument[];
  peerDependencies?: {[k in keyof LexicalPlanRegistry]?: LexicalPeerConfig<k>};

  disableEvents?: CreateEditorArgs['disableEvents'];
  parentEditor?: CreateEditorArgs['parentEditor'];
  namespace?: CreateEditorArgs['namespace'];
  nodes?: CreateEditorArgs['nodes'];
  theme?: CreateEditorArgs['theme'];
  html?: CreateEditorArgs['html'];
  editable?: CreateEditorArgs['editable'];

  onError?: (error: Error, editor: LexicalEditor) => void;
  $initialEditorState?: InitialEditorStateType;
  config: Config;
  mergeConfig?: (a: Config, b?: Partial<Config>) => Config;
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

export type LexicalPlanConfig<Plan extends AnyLexicalPlan> = Plan['config'];

export type LexicalPlanName<Plan extends AnyLexicalPlan> = Plan['name'];

export interface EditorHandle {
  editor: LexicalEditor;
  dispose: () => void;
}

export type InitialEditorStateType =
  | null
  | string
  | EditorState
  | ((editor: LexicalEditor) => void);
