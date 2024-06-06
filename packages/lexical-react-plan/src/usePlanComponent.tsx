import {
  type LexicalPlan,
  type PlanConfigBase,
  getPlanConfigFromEditor,
} from "@etrepum/lexical-builder";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { type ReactNode, type ComponentType } from "react";

export function usePlanConfig<
  Config extends PlanConfigBase,
  Name extends string,
>(plan: LexicalPlan<Config, Name>): Config {
  const [editor] = useLexicalComposerContext();
  return getPlanConfigFromEditor(editor, plan);
}

/**
 * Use a Component from the given Plan that uses the ReactPlan convention
 * of exposing a Component property in its config.
 *
 * @param plan A plan with a Component property in the config
 * @returns `getPlanConfigFromEditor(useLexicalComposerContext()[0], plan).Component`
 */
export function usePlanComponent<
  Config extends PlanConfigBase & { Component: Component },
  Name extends string,
  Component extends ComponentType,
>(plan: LexicalPlan<Config, Name>): Config["Component"] {
  return usePlanConfig(plan).Component;
}
