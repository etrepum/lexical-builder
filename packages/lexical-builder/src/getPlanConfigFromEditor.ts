import { LexicalEditor } from "lexical";
import { LexicalPlan, PlanConfigBase } from "./types";
import { LexicalBuilder } from "./LexicalBuilder";
import invariant from "./shared/invariant";
import { PACKAGE_VERSION } from "./PACKAGE_VERSION";

/**
 * Get the finalized configuration of a Plan that was used to build the editor.
 *
 * This is useful in the implementation of a LexicalNode or in other
 * situations where you have an editor reference but it's not easy to
 * pass the config or {@link RegisterState} around.
 *
 * It will throw if the Editor was not built using this Plan.
 *
 * @param editor The editor that was built using plan
 * @param plan The concrete reference to a Plan used to build this editor
 * @returns The configuration for that Plan
 */
export function getPlanConfigFromEditor<
  Config extends PlanConfigBase,
  Name extends string,
>(editor: LexicalEditor, plan: LexicalPlan<Config, Name>): Config {
  const builder = LexicalBuilder.fromEditor(editor);
  invariant(
    builder !== undefined,
    "getPlanConfigFromEditor: editor was not created with this build of Lexical Builder %s",
    PACKAGE_VERSION,
  );
  const pair = builder.planMap.get(plan);
  invariant(
    pair !== undefined,
    "getPlanConfigFromEditor: Plan %s was not built when creating this editor",
    plan.name,
  );
  return pair[1].getConfig();
}
