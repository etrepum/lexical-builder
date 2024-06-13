import { $getEditor, LexicalEditor } from "lexical";
import {
  AnyLexicalPlan,
  LexicalPlanDependency,
} from "@etrepum/lexical-builder-core";
import { LexicalBuilder } from "./LexicalBuilder";
import invariant from "./shared/invariant";
import { PACKAGE_VERSION } from "./PACKAGE_VERSION";

/**
 * Get the finalized config and output of a Plan that was used to build the
 * editor by name.
 *
 * This can be used from the implementation of a LexicalNode or in other
 * situation where you have an editor reference but it's not easy to pass the
 * config around. Use this version if you do not have a concrete reference to
 * the Plan for some reason (e.g. it is an optional peer dependency).
 *
 * Both the explicit Plan type and the name are required.
 *
 *  @example
 * ```tsx
 * getPeerDependencyFromEditor<typeof import("@some/plan").SomePlan>(editor, "@some/plan");
 * ```

 * @param editor The editor that may have been built using plan
 * @param planName The name of the Plan
 * @returns The config and output of the Plan or undefined
 */
export function getPeerDependencyFromEditor<
  Plan extends AnyLexicalPlan = never,
>(
  editor: LexicalEditor,
  planName: Plan["name"],
): LexicalPlanDependency<Plan> | undefined {
  const builder = LexicalBuilder.fromEditor(editor);
  invariant(
    builder !== undefined,
    "getPeerConfigFromEditor: editor was not created with this build of Lexical Builder %s",
    PACKAGE_VERSION,
  );
  const peer = builder.planNameMap.get(planName);
  return peer
    ? (peer.getPlanDependency() as LexicalPlanDependency<Plan>)
    : undefined;
}

/**
 * Get the finalized config and output of a Plan that was used to build the
 * editor by name.
 *
 * Both the explicit Plan type and the name are required.
 *
 * This can be used from the implementation of a LexicalNode or in other
 * situation where you have an editor reference but it's not easy to pass the
 * config around. Use this version if you do not have a concrete reference to
 * the Plan for some reason (e.g. it is an optional peer dependency).
 *
 * @example
 * ```tsx
 * $getPeerDependency<typeof import("@some/plan").SomePlan>("@some/plan")
 * ```
 *
 * @param planName The name of the Plan
 * @returns The config and output of the Plan or undefined
 */
export function $getPeerDependency<Plan extends AnyLexicalPlan = never>(
  planName: Plan["name"],
): LexicalPlanDependency<Plan> | undefined {
  return getPeerDependencyFromEditor($getEditor(), planName);
}
