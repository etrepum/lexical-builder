/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CreateEditorArgs, EditorState, LexicalEditor } from "lexical";
import type { LexicalPlanRegistry } from "@etrepum/lexical-builder";

/**
 * Any concrete {@link LexicalPlan}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyLexicalPlan = LexicalPlan<any, string>;
/**
 * Any {@link LexicalPlan} or {@link NormalizedLexicalPlanArgument}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyLexicalPlanArgument = LexicalPlanArgument<any, string>;
/**
 * The default plan configuration of an empty object
 */
export type PlanConfigBase = Record<never, never>;

/**
 * A tuple of [plan, configOverride, ...configOverrides]
 */
export type NormalizedLexicalPlanArgument<
  Config extends PlanConfigBase,
  Name extends string,
> = [LexicalPlan<Config, Name>, Partial<Config>, ...Partial<Config>[]];

/**
 * An object that the register method can use to detect unmount and access the
 * configuration for plan dependencies
 */
export interface RegisterState {
  /** An AbortSignal that is aborted when the EditorHandle is disposed */
  signal: AbortSignal;
  /**
   * Get the configuration of a peerDependency by name, if it exists
   * (must be a peerDependency of this plan)
   */
  getPeerConfig<Name extends keyof LexicalPlanRegistry>(
    name: string,
  ): undefined | LexicalPlanConfig<LexicalPlanRegistry[Name]>;
  /**
   * Get the configuration of a dependency by plan
   * (must be a direct dependency of this plan)
   */
  getDependencyConfig<Dependency extends AnyLexicalPlan>(
    dep: Dependency,
  ): LexicalPlanConfig<Dependency>;
}

/**
 * A {@link LexicalPlan} or {@link NormalizedLexicalPlanArgument} (plan with config overrides)
 */
export type LexicalPlanArgument<
  Config extends PlanConfigBase,
  Name extends string,
> = LexicalPlan<Config, Name> | NormalizedLexicalPlanArgument<Config, Name>;

/**
 * A Plan is a composable unit of LexicalEditor configuration
 * (nodes, theme, etc) used to create an editor, plus runtime behavior
 * that is registered after the editor is created.
 *
 * A Plan may depend on other Plans, and provide functionality to other
 * plans through its config.
 */
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
    [k in keyof LexicalPlanRegistry]?: Partial<LexicalPeerConfig<k>>;
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
   * `(error) => { throw error }`.
   *
   * @param error The Error object
   * @param editor The editor that this error came from
   */
  onError?: (error: Error, editor: LexicalEditor) => void;
  /**
   * The initial EditorState as a JSON string, an EditorState, or a function
   * to update the editor (once).
   */
  $initialEditorState?: InitialEditorStateType;
  /**
   * The default configuration specific to this Plan. This Config may be
   * seen by this Plan, or any Plan that uses it as a dependency.
   *
   * The config may be mutated on register, this is particularly useful
   * for vending functionality to other Plans that depend on this Plan.
   */
  config: Config;
  /**
   * By default, Config is shallow merged `{...a, ...b}` with
   * {@link shallowMergeConfig}, if your Plan requires other strategies
   * (such as concatenating an Array) you can implement it here.
   *
   * @example Merging an array
   * ```js
   * const plan = definePlan({
   *   // ...
   *   mergeConfig(config, overrides) {
   *     const merged = shallowMergeConfig(config, overrides);
   *     if (Array.isArray(overrides.decorators)) {
   *       merged.decorators = [...config.decorators, ...overrides.decorators];
   *     }
   *     return merged;
   *   }
   * });
   * ```
   *
   * @param config The current configuration
   * @param overrides The partial configuration to merge
   * @returns The merged configuration
   */
  mergeConfig?: (config: Config, overrides: Partial<Config>) => Config;
  /**
   * Add behavior to the editor (register transforms, listeners, etc.) after
   * the Editor is created. The register function may also mutate the config
   * in-place to expose data to other plans that use it as a dependency.
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

/**
 * Get the Config type of a peer Plan from {@link LexicalPlanRegistry} by
 * name, or the empty {@link PlanConfigBase} if it is not globally registered.
 */
export type LexicalPeerConfig<Name extends keyof LexicalPlanRegistry | string> =
  [Name] extends [keyof LexicalPlanRegistry]
    ? LexicalPlanRegistry[Name]["config"]
    : PlanConfigBase;

/**
 * Extract the Config type from a Plan
 */
export type LexicalPlanConfig<Plan extends AnyLexicalPlan> = Plan["config"];
/**
 * Extract the Name type from a Plan
 */
export type LexicalPlanName<Plan extends AnyLexicalPlan> = Plan["name"];

/**
 * A handle to the editor and its dispose function
 */
export interface EditorHandle extends Disposable {
  /** The created editor */
  editor: LexicalEditor;
  /**
   * Dispose the editor and perform all clean-up
   * (also available as Symbol.dispose via Disposable)
   */
  dispose: () => void;
}

/**
 * All of the possible ways to initialize $initialEditorState:
 * - `null` an empty state, the default
 * - `string` an EditorState serialized to JSON
 * - `EditorState` an EditorState that has been deserialized already (not just parsed JSON)
 * - `((editor: LexicalEditor) => void)` A function that is called with the editor for you to mutate it
 */
export type InitialEditorStateType =
  | null
  | string
  | EditorState
  | ((editor: LexicalEditor) => void);
