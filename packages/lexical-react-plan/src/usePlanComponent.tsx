import {
  type LexicalPlan,
  type PlanConfigBase,
  getPlanDependencyFromEditor,
  type AnyLexicalPlan,
  type LexicalPlanDependency,
} from "@etrepum/lexical-builder";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { ComponentType } from "react";

export function usePlanDependency<Plan extends AnyLexicalPlan>(
  plan: Plan,
): LexicalPlanDependency<Plan> {
  return getPlanDependencyFromEditor(useLexicalComposerContext()[0], plan);
}

/**
 * Use a Component from the given Plan that uses the ReactPlan convention
 * of exposing a Component property in its output.
 *
 * @param plan A plan with a Component property in the output
 * @returns `getPlanConfigFromEditor(useLexicalComposerContext()[0], plan).Component`
 */
export function usePlanComponent<
  Config extends PlanConfigBase,
  Name extends string,
  Output extends { Component: Component },
  Component extends ComponentType,
>(plan: LexicalPlan<Config, Name, Output>): Component {
  return usePlanDependency(plan).output.Component;
}
