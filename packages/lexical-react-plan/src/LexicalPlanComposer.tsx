import {
  buildEditorFromPlans,
  getPlanConfigFromEditor,
  type AnyLexicalPlanArgument,
} from "@etrepum/lexical-builder";
import { useEffect, useMemo } from "react";
import { scheduleMicrotask } from "./shared/scheduleMicroTask";
import { ReactPlan } from "./ReactPlan";

export interface LexicalPlanComposerProps {
  plan: AnyLexicalPlanArgument;
  children: React.ReactNode;
}

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
