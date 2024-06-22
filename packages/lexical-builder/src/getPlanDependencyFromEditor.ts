import { LexicalEditor } from "lexical";
import {
  AnyLexicalPlan,
  LexicalPlanDependency,
} from "@etrepum/lexical-builder-core";
import { LexicalBuilder } from "./LexicalBuilder";
import invariant from "./shared/invariant";

/**
 * Get the finalized config and output of a Plan that was used to build the editor.
 *
 * This is useful in the implementation of a LexicalNode or in other
 * situations where you have an editor reference but it's not easy to
 * pass the config or {@link RegisterState} around.
 *
 * It will throw if the Editor was not built using this Plan.
 *
 * @param editor The editor that was built using plan
 * @param plan The concrete reference to a Plan used to build this editor
 * @returns The config and output for that Plan
 */
export function getPlanDependencyFromEditor<Plan extends AnyLexicalPlan>(
  editor: LexicalEditor,
  plan: Plan,
): LexicalPlanDependency<Plan> {
  const builder = LexicalBuilder.fromEditor(editor);
  const rep = builder.getPlanRep(plan);
  invariant(
    rep !== undefined,
    "getPlanFromEditor: Plan %s was not built when creating this editor",
    plan.name,
  );
  return rep.getPlanDependency();
}
