/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  AnyLexicalPlan,
  LexicalPlan,
  LexicalPlanConfig,
  NormalizedLexicalPlanArgument,
  NormalizedPeerDependency,
  PlanConfigBase,
  RegisterCleanup,
  RootPlan,
  RootPlanArgument,
} from "./types";

/**
 * Define a LexicalPlan from the given object literal. TypeScript will
 * infer Config and Name in most cases, but you may want to use
 * {@link safeCast} for config if there are default fields or varying types.
 *
 * @param plan The LexicalPlan
 * @returns The unmodified plan argument (this is only an inference helper)
 *
 * @example Basic example
 * ```ts
 * export const MyPlan = definePlan({
 *   // Plan names must be unique in an editor
 *   name: "my",
 *   // Config must be an object, but an empty object is fine
 *   config: {},
 *   nodes: [MyNode],
 * });
 * ```
 *
 * @example Plan with optional configuration
 * ```ts
 * export interface ConfigurableConfig {
 *   optional?: string;
 *   required: number;
 * }
 * export const ConfigurablePlan = definePlan({
 *   name: "configurable",
 *   // The Plan's config must satisfy the full config type,
 *   // but using the Plan as a dependency never requires
 *   // configuration and any partial of the config can be specified
 *   config: safeCast<ConfigurableConfig>({ required: 1 }),
 * });
 * ```
 */
export function definePlan<
  Config extends PlanConfigBase,
  Name extends string,
  Output,
>(plan: LexicalPlan<Config, Name, Output>): LexicalPlan<Config, Name, Output> {
  return plan;
}

/**
 * Define a LexicalPlan from the given object literal, assigning an
 * empty config and the name "[root]". This plan must only be used
 * at most once per editor, usually as the first argument to
 * {@link buildEditorFromPlans} or the plan argument to
 * {@link LexicalPlanComposer}.
 *
 * @param rootPlan A plan without the config or name properties
 * @returns The given plan argument, after in-place assignment of config and name
 *
 * @example
 * ```ts
 * const editorHandle = buildEditorFromPlans(
 *   defineRootPlan({
 *     dependencies: [DragonPlan, RichTextPlan, HistoryPlan],
 *   }),
 * );
 * ```
 */
export function defineRootPlan<Output>(
  rootPlan: RootPlanArgument<Output>,
): RootPlan<Output> {
  return Object.assign(rootPlan, { name: "[root]", config: {} } as const);
}

/**
 * Override a partial of the configuration of a Plan, to be used
 * in the dependencies array of another plan, or as
 * an argument to {@link buildEditorFromPlans}.
 *
 * Before building the editor, configurations will be merged using
 * plan.mergeConfig(plan, config) or {@link shallowMergeConfig} if
 * this is not directly implemented by the Plan.
 *
 * @param args A plan followed by one or more config partials for that plan
 * @returns [plan, config, ...configs]
 *
 * @example
 * ```ts
 * export const ReactDecoratorPlan = definePlan({
 *   name: "react-decorator",
 *   dependencies: [
 *     configPlan(ReactPlan, {
 *       decorators: [<ReactDecorator />]
 *     }),
 *   ],
 * });
 * ```
 */
export function configPlan<
  Config extends PlanConfigBase,
  Name extends string,
  Output,
>(
  ...args: NormalizedLexicalPlanArgument<Config, Name, Output>
): NormalizedLexicalPlanArgument<Config, Name, Output> {
  return args;
}

/**
 * Provide output from the register function of a Plan
 *
 * @returns A cleanup function
 *
 * @example Provide output with no other cleanup
 * ```ts
 * // This is entirely optional and would be inferred correctly, but
 * // it can be useful for documentation!
 * export interface RegisteredAtOutput {
 *   registered_at: number;
 * }
 * export const RegisteredAtPlan = definePlan({
 *   name: "RegisteredAt",
 *   config: {},
 *   register(editor) {
 *     return provideOutput<RegisteredAtOutput>({ registered_at: Date.now() });
 *   },
 * });
 * ```
 *
 * @example Provide output with other cleanup
 * ```ts
 * export interface UniqueCommandOutput {
 *   command: LexicalCommand<unknown>;
 * }
 * export const UniqueCommandPlan = definePlan({
 *   name: 'UniqueCommand',
 *   config: {},
 *   register(editor) {
 *     const output: UniqueCommnadOutput = {command: createCommand('UNIQUE_COMMAND')};
 *     const cleanup = registerCommand(
 *       command,
 *       (_payload) => {
 *         console.log('Unique command received!');
 *         return true;
 *       }
 *       COMMAND_PRIORITY_EDITOR
 *     );
 *     return provideOutput(output, cleanup);
 *   },
 * });
 * ```
 *
 */
export function provideOutput<Output>(
  output: Output,
  cleanup?: () => void,
): RegisterCleanup<Output> {
  return Object.assign(() => cleanup && cleanup(), { output } as const);
}

/** @internal */
export const PeerDependencyBrand: unique symbol = Symbol.for(
  "@etrepum/lexical-builder/PeerDependency",
);

/**
 * Used to declare a peer dependency of a plan in a type-safe way,
 * requires the type parameter. The most common use case for peer dependencies
 * is to avoid a direct import dependency, so you would want to use a
 * type import or the import type (shown in below examples).
 *
 * @param name The plan's name
 * @param config An optional config override
 * @returns NormalizedPeerDependency
 *
 * @example
 * ```ts
 * export const PeerPlan = definePlan({
 *   name: 'PeerPlan',
 *   config: {},
 *   peerDependencies: [
 *     declarePeerDependency<typeof import("foo").FooPlan>("foo"),
 *     declarePeerDependency<typeof import("bar").BarPlan>("bar", {config: "bar"}),
 *   ],
 * });
 */
export function declarePeerDependency<Plan extends AnyLexicalPlan = never>(
  name: Plan["name"],
  config?: Partial<LexicalPlanConfig<Plan>>,
): NormalizedPeerDependency<Plan> {
  return [name, config] as NormalizedPeerDependency<Plan>;
}
