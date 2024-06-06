/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  LexicalPlan,
  NormalizedLexicalPlanArgument,
  PlanConfigBase,
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
export function definePlan<Config extends PlanConfigBase, Name extends string>(
  plan: LexicalPlan<Config, Name>,
): LexicalPlan<Config, Name> {
  return plan;
}

/**
 * Define a LexicalPlan from the given object literal, assigning an
 * empty config and the name "[root]". This plan must only be used
 * at most once per editor, usually as the first argument to
 * {@link buildEditorFromPlans}
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
export function defineRootPlan(
  rootPlan: Omit<LexicalPlan<PlanConfigBase, "[root]">, "config" | "name">,
): LexicalPlan<PlanConfigBase, "[root]"> {
  // @ts-ignore
  return Object.assign(rootPlan, { name: "[root]", config: {} }) as any;
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
export function configPlan<Config extends PlanConfigBase, Name extends string>(
  ...args: NormalizedLexicalPlanArgument<Config, Name>
): NormalizedLexicalPlanArgument<Config, Name> {
  return args;
}
