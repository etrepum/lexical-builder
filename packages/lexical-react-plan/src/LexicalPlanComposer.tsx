import {
  buildEditorFromPlans,
  getPlanConfigFromEditor,
  type AnyLexicalPlanArgument,
} from "@etrepum/lexical-builder";
import { useEffect, useMemo } from "react";
import { scheduleMicrotask } from "./shared/scheduleMicroTask";
import { ReactPlan } from "./ReactPlan";

export interface LexicalPlanComposerProps {
  /**
   * Your root plan, typically defined with {@link defineRootPlan} or {@link definePlan}
   */
  plan: AnyLexicalPlanArgument;
  /**
   * Any children will have access to useLexicalComposerContext (e.g. for React plug-ins or UX)
   */
  children: React.ReactNode;
}

/**
 * The equivalent of LexicalComposer for a plan. Make sure that your plan
 * argument is stable (e.g. using module scope or useMemo) so
 * that you are not re-creating the editor on every render!
 *
 * @example Module scoped plan
 * ```tsx
 * const plan = defineRootPlan({
 *   dependencies: [DragonPlan, RichTextPlan, HistoryPlan, EmojiPlan]
 * });
 * function MyEditor({ children }) {
 *   return (<LexicalPlanComposer plan={plan}>{children}</LexicalPlanComposer>);
 * }
 * ```
 *
 * @example useMemo plan
 * ```tsx
 * function MyEditor({ emojiBaseUrl, children }) {
 *   const plan = useMemo(() => {
 *     return defineRootPlan({
 *       dependencies: [
 *         DragonPlan,
 *         RichTextPlan,
 *         HistoryPlan,
 *         configPlan(EmojiPlan, { emojiBaseUrl }),
 *       ],
 *     });
 *   }, [emojiBaseUrl]);
 *   return (<LexicalPlanComposer plan={plan}>{children}</LexicalPlanComposer>);
 * }
 * ```
 *
 * @example Incorrect usage with unstable plan
 * ```tsx
 * function MyBrokenEditor({ emojiBaseUrl }) {
 *   // This argument is not stable, the editor is re-created every render and
 *   // all state is lost!
 *   const plan = defineRootPlan({
 *     dependencies: [DragonPlan, RichTextPlan, HistoryPlan, EmojiPlan]
 *   });
 *   return (<LexicalPlanComposer plan={plan}>{children}</LexicalPlanComposer>);
 * }
 * ```
 */
export function LexicalPlanComposer({
  plan,
  children,
}: LexicalPlanComposerProps) {
  const handle = useMemo(() => buildEditorFromPlans(ReactPlan, plan), [plan]);
  useEffect(() => {
    // This is an awful trick to detect StrictMode so we don't dispose the
    // editor that we just created
    let didMount = false;
    scheduleMicrotask(() => {
      didMount = true;
    });
    return () => {
      if (didMount) {
        handle.dispose();
      }
    };
  }, [handle]);
  const { Component } = getPlanConfigFromEditor(handle.editor, ReactPlan);
  return <Component>{children}</Component>;
}
