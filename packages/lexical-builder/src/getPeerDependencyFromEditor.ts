import type { LexicalEditor } from "lexical";
import type {
  AnyLexicalPlan,
  LexicalPlanDependency,
} from "@etrepum/lexical-builder-core";
import { LexicalBuilder } from "./LexicalBuilder";
import invariant from "./shared/invariant";

/**
 * Get the finalized config and output of a Plan that was used to build the
 * editor by name.
 *
 * This can be used from the implementation of a LexicalNode or in other
 * situation where you have an editor reference but it's not easy to pass the
 * config around. Use this version if you do not have a concrete reference to
 * the Plan for some reason (e.g. it is an optional peer dependency, or you
 * are avoiding a circular import).
 *
 * Both the explicit Plan type and the name are required.
 *
 *  @example
 * ```tsx
 * import type { EmojiPlan } from "@etrepum/lexical-emoji-plan";
 * getPeerDependencyFromEditor<typeof EmojiPlan>(editor, "@etrepum/lexical-emoji-plan/Emoji");
 * ```

 * @param editor - The editor that may have been built using plan
 * @param planName - The name of the Plan
 * @returns The config and output of the Plan or undefined
 */
export function getPeerDependencyFromEditor<
  Plan extends AnyLexicalPlan = never,
>(
  editor: LexicalEditor,
  planName: Plan["name"],
): LexicalPlanDependency<Plan> | undefined {
  const builder = LexicalBuilder.fromEditor(editor);
  const peer = builder.planNameMap.get(planName);
  return peer
    ? (peer.getPlanDependency() as LexicalPlanDependency<Plan>)
    : undefined;
}

/**
 * Get the finalized config and output of a Plan that was used to build the
 * editor by name.
 *
 * This can be used from the implementation of a LexicalNode or in other
 * situation where you have an editor reference but it's not easy to pass the
 * config around. Use this version if you do not have a concrete reference to
 * the Plan for some reason (e.g. it is an optional peer dependency, or you
 * are avoiding a circular import).
 *
 * Both the explicit Plan type and the name are required.
 *
 *  @example
 * ```tsx
 * import type { EmojiPlan } from "./EmojiPlan";
 * export class EmojiNode extends TextNode {
 *   // other implementation details not included
 *   createDOM(
 *     config: EditorConfig,
 *     editor?: LexicalEditor | undefined
 *   ): HTMLElement {
 *     const dom = super.createDOM(config, editor);
 *     addClassNamesToElement(
 *       dom,
 *       getPeerDependencyFromEditorOrThrow<typeof EmojiPlan>(
 *         editor || $getEditor(),
 *         "@etrepum/lexical-emoji-plan/Emoji",
 *       ).config.emojiClass,
 *     );
 *     return dom;
 *   }
 * }
 * ```

 * @param editor - The editor that may have been built using plan
 * @param planName - The name of the Plan
 * @returns The config and output of the Plan
 */
export function getPeerDependencyFromEditorOrThrow<
  Plan extends AnyLexicalPlan = never,
>(editor: LexicalEditor, planName: Plan["name"]): LexicalPlanDependency<Plan> {
  const dep = getPeerDependencyFromEditor<Plan>(editor, planName);
  invariant(
    dep !== undefined,
    "getPeerDependencyFromEditorOrThrow: Editor was not build with Plan %s",
    planName,
  );
  return dep;
}
