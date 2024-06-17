import {
  LexicalBuilder,
  definePlan,
  provideOutput,
} from "@etrepum/lexical-builder";
import { ReactPlan } from "@etrepum/lexical-react-plan";
import invariant from "./shared/invariant";
import { Suspense, lazy } from "react";

export const BuilderGraphComponent = lazy(
  () => import("./BuilderGraphComponent"),
);

export const BuilderGraphPlan = definePlan({
  name: "@etrepum/lexical-builder-devtools-core/BuilderGraphPlan",
  dependencies: [ReactPlan],
  register(editor) {
    const builder = LexicalBuilder.fromEditor(editor);
    invariant(
      builder !== undefined,
      "BuilderGraphPlan: Could not get a LexicalBuilder reference",
    );
    return provideOutput({
      Component: () => (
        <Suspense>
          <BuilderGraphComponent editor={editor} />
        </Suspense>
      ),
    });
  },
});
