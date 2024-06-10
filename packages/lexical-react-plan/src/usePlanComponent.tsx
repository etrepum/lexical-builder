import {
  getPlanDependencyFromEditor,
  type AnyLexicalPlan,
  type LexicalPlanDependency,
} from "@etrepum/lexical-builder";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ComponentProps } from "react";

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
export function usePlanComponent<Plan extends AnyLexicalPlan>(
  plan: Plan,
): LexicalPlanDependency<Plan>["output"]["Component"] {
  return usePlanDependency(plan).output.Component;
}

/**
 * The lexical:plan prop combined with the props of the given Plan's
 * output Component.
 */
export type UsePlanComponentProps<Plan extends AnyLexicalPlan> = {
  /** The Plan */
  "lexical:plan": Plan;
} & /** The Props from the Plan output Component */ Omit<
  ComponentProps<LexicalPlanDependency<Plan>["output"]["Component"]>,
  "lexical:plan"
>;

/**
 * A convenient way to get a Plan's output Component with {@link usePlanComponent}
 * and construct it in one step.
 *
 * @example Usage
 * ```tsx
 * return (
 *   <UsePlanComponent
 *     lexical:plan={TreeViewPlan}
 *     viewClassName="tree-view-output" />
 * );
 * ```
 *
 * @example Alternative without UsePlanComponent
 * ```tsx
 * const TreeViewComponent = usePlanComponent(TreeViewPlan);
 * return (<TreeViewComponent viewClassName="tree-view-output" />);
 * ```
 */
export function UsePlanComponent<Plan extends AnyLexicalPlan>({
  ["lexical:plan"]: plan,
  ...props
}: UsePlanComponentProps<Plan>): JSX.Element {
  const Component = usePlanComponent(plan);
  return <Component {...props} />;
}
