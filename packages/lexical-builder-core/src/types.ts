/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { CreateEditorArgs, EditorState, LexicalEditor } from "lexical";
import type {
  LexicalPlanInternal,
  peerDependencySymbol,
  configTypeSymbol,
  outputTypeSymbol,
  initTypeSymbol,
} from "./internal";

/**
 * Any concrete {@link LexicalPlan}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any
export type AnyLexicalPlan = LexicalPlan<any, string, any, any>;
/**
 * Any {@link LexicalPlan} or {@link NormalizedLexicalPlanArgument}
 */
export type AnyLexicalPlanArgument =
  | AnyLexicalPlan
  | AnyNormalizedLexicalPlanArgument;
/**
 * The default plan configuration of an empty object
 */
export type PlanConfigBase = Record<never, never>;

export type NormalizedPeerDependency<Plan extends AnyLexicalPlan> = [
  Plan["name"],
  Partial<LexicalPlanConfig<Plan>> | undefined,
] & { readonly [peerDependencySymbol]: Plan };

/**
 * Any {@link NormalizedLexicalPlanArgument}
 */
export type NormalizedLexicalPlanArgument<
  in out Config extends PlanConfigBase,
  out Name extends string,
  in out Output,
  in out Init,
> = [LexicalPlan<Config, Name, Output, Init>, ...Partial<Config>[]];

/**
 * A tuple of [plan, ...configOverrides]
 */
export type AnyNormalizedLexicalPlanArgument = NormalizedLexicalPlanArgument<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any
  any,
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any
  any
>;

/**
 * An object that the register method can use to detect unmount and access the
 * configuration for plan dependencies
 */
export interface PlanInitState {
  /** An AbortSignal that is aborted when the LexicalEditor is disposed */
  signal: AbortSignal;
  /**
   * Get the result of a peerDependency by name, if it exists
   * (must be a peerDependency of this plan)
   */
  getPeer: <Dependency extends AnyLexicalPlan = never>(
    name: Dependency["name"],
  ) => undefined | Omit<LexicalPlanDependency<Dependency>, "output">;
  /**
   * Get the configuration of a dependency by plan
   * (must be a direct dependency of this plan)
   */
  getDependency: <Dependency extends AnyLexicalPlan>(
    dep: Dependency,
  ) => Omit<LexicalPlanDependency<Dependency>, "output">;
  /**
   * Get the names of any direct dependents of this
   * Plan, typically only used for error messages.
   */
  getDirectDependentNames: () => ReadonlySet<string>;
  /**
   * Get the names of all peer dependencies of this
   * Plan, even if they do not exist in the builder,
   * typically only used for devtools.
   */
  getPeerNameSet: () => ReadonlySet<string>;
}

/**
 * An object that the register method can use to detect unmount and access the
 * configuration for plan dependencies
 */
export interface PlanRegisterState<Init>
  extends Omit<PlanInitState, "getPeer" | "getDependency"> {
  /**
   * Get the result of a peerDependency by name, if it exists
   * (must be a peerDependency of this plan)
   */
  getPeer: <Dependency extends AnyLexicalPlan = never>(
    name: Dependency["name"],
  ) => undefined | LexicalPlanDependency<Dependency>;
  /**
   * Get the configuration of a dependency by plan
   * (must be a direct dependency of this plan)
   */
  getDependency: <Dependency extends AnyLexicalPlan>(
    dep: Dependency,
  ) => LexicalPlanDependency<Dependency>;
  /**
   * The result of the init function
   */
  getInitResult: () => Init;
}

/**
 * A {@link LexicalPlan} or {@link NormalizedLexicalPlanArgument} (plan with config overrides)
 */
export type LexicalPlanArgument<
  Config extends PlanConfigBase,
  Name extends string,
  Output,
  Init,
> =
  | LexicalPlan<Config, Name, Output, Init>
  | NormalizedLexicalPlanArgument<Config, Name, Output, Init>;

export interface LexicalPlanDependency<out Dependency extends AnyLexicalPlan> {
  config: LexicalPlanConfig<Dependency>;
  output: LexicalPlanOutput<Dependency>;
}

export type RegisterCleanup<Output> = (() => void) &
  (unknown extends Output ? { output?: Output } : { output: Output });

/**
 * A Plan is a composable unit of LexicalEditor configuration
 * (nodes, theme, etc) used to create an editor, plus runtime behavior
 * that is registered after the editor is created.
 *
 * A Plan may depend on other Plans, and provide functionality to other
 * plans through its config.
 */
export interface LexicalPlan<
  in out Config extends PlanConfigBase,
  out Name extends string,
  in out Output,
  in out Init,
> extends InitialEditorConfig,
    LexicalPlanInternal<Config, Output, Init> {
  /** The name of the Plan, must be unique */
  readonly name: Name;
  /** Plan names that must not be loaded with this Plan */
  conflictsWith?: string[];
  /** Other Plans that this Plan depends on, can also be used to configure them */
  dependencies?: AnyLexicalPlanArgument[];
  /**
   * Other Plans, by name, that this Plan can optionally depend on or
   * configure, if they are directly depended on by another Plan
   */
  peerDependencies?: NormalizedPeerDependency<AnyLexicalPlan>[];

  /**
   * The default configuration specific to this Plan. This Config may be
   * seen by this Plan, or any Plan that uses it as a dependency.
   *
   * The config may be mutated on register, this is particularly useful
   * for vending functionality to other Plans that depend on this Plan.
   */
  config?: Config;

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
   * @param config - The current configuration
   * @param overrides - The partial configuration to merge
   * @returns The merged configuration
   */
  mergeConfig?: (config: Config, overrides: Partial<Config>) => Config;
  /**
   * Perform any necessary initialization before the editor is created,
   * this runs after all configuration overrides for both the editor this
   * this plan have been merged. May be used validate the editor
   * configuration.
   *
   * @param editorConfig - The in-progress editor configuration (mutable)
   * @param config - The merged configuration specific to this plan (mutable)
   * @param state - An object containing an AbortSignal that can be
   *   used, and methods for accessing the merged configuration of
   *   dependencies and peerDependencies
   */
  init?: (
    editorConfig: InitialEditorConfig,
    config: Config,
    state: PlanInitState,
  ) => Init;
  /**
   * Add behavior to the editor (register transforms, listeners, etc.) after
   * the Editor is created, but before its initial state is set.
   * The register function may also mutate the config
   * in-place to expose data to other plans that use it as a dependency.
   *
   * @param editor - The editor this Plan is being registered with
   * @param config - The merged configuration specific to this Plan
   * @param state - An object containing an AbortSignal that can be
   *   used, and methods for accessing the merged configuration of
   *   dependencies and peerDependencies
   * @returns A clean-up function
   */
  register?: (
    editor: LexicalEditor,
    config: Config,
    state: PlanRegisterState<Init>,
  ) => RegisterCleanup<Output>;

  /**
   * Run any code that must happen after initialization of the
   * editor state (which happens after all register calls).
   *
   * @param editor - The editor this Plan is being registered with
   * @param config - The merged configuration specific to this Plan
   * @param state - An object containing an AbortSignal that can be
   *   used, and methods for accessing the merged configuration of
   *   dependencies and peerDependencies
   * @returns A clean-up function
   */
  afterInitialization?: (
    editor: LexicalEditor,
    config: Config,
    state: PlanRegisterState<Init>,
  ) => () => void;
}

/**
 * Extract the Config type from a Plan
 */
export type LexicalPlanConfig<Plan extends AnyLexicalPlan> = NonNullable<
  Plan[configTypeSymbol]
>;

/**
 * Extract the Name type from a Plan
 */
export type LexicalPlanName<Plan extends AnyLexicalPlan> = Plan["name"];

/**
 * Extract the Output type from a Plan
 */
export type LexicalPlanOutput<Plan extends AnyLexicalPlan> = NonNullable<
  Plan[outputTypeSymbol]
>;

/**
 * Extract the Init type from a Plan
 */
export type LexicalPlanInit<Plan extends AnyLexicalPlan> = NonNullable<
  Plan[initTypeSymbol]
>;

/**
 * A Plan that has an OutputComponent of the given type (e.g. React.ComponentType)
 */
export type OutputComponentPlan<ComponentType> = LexicalPlan<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any config
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any name
  any,
  { Component: ComponentType },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any init
  any
>;

/**
 * A handle to the editor with an attached dispose function
 */
export interface LexicalEditorWithDispose extends LexicalEditor, Disposable {
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

export interface InitialEditorConfig {
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
   * @param error - The Error object
   * @param editor - The editor that this error came from
   */
  onError?: (error: Error, editor: LexicalEditor) => void;
  /**
   * The initial EditorState as a JSON string, an EditorState, or a function
   * to update the editor (once).
   */
  $initialEditorState?: InitialEditorStateType;
}
