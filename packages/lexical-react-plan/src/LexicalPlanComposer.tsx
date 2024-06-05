import {
  definePlan,
  buildEditorFromPlans,
  AnyLexicalPlanArgument,
} from "@etrepum/lexical-builder";
import { useEffect, useMemo, useRef } from "react";
import { scheduleMicrotask } from "./shared/scheduleMicroTask";
import { EditorComponentType } from "./types";
import { ReactPlan } from "./ReactPlan";

export interface LexicalPlanComposerProps {
  plan: AnyLexicalPlanArgument;
  children: React.ReactNode;
}

export function LexicalPlanComposer({
  plan,
  children,
}: LexicalPlanComposerProps) {
  const componentRef = useRef<EditorComponentType | undefined>(undefined);
  const handle = useMemo(() => {
    return buildEditorFromPlans(
      definePlan({
        name: "@lexical/builder/LexicalPlanComposer",
        config: {},
        dependencies: [ReactPlan],
        register(_editor, _config, state) {
          componentRef.current = state.getDependencyConfig(ReactPlan).Component;
          return () => {
            componentRef.current = undefined;
          };
        },
      }),
      plan,
    );
  }, [plan]);
  useEffect(() => {
    // This is an awful trick to detect StrictMode
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
  const EditorComponent = componentRef.current;
  return EditorComponent ? <EditorComponent>{children}</EditorComponent> : null;
}
