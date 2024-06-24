import { definePlan, provideOutput } from "@etrepum/lexical-builder";
import { ReactPlan } from "@etrepum/lexical-react-plan";
import { Suspense, lazy } from "react";

export const BuilderGraphComponent = lazy(
  () => import("./BuilderGraphComponent"),
);

export const BuilderGraphPlan = definePlan({
  name: "@etrepum/lexical-builder-devtools-core/BuilderGraphPlan",
  dependencies: [ReactPlan],
  register(editor) {
    return provideOutput({
      Component: () => (
        <Suspense>
          <BuilderGraphComponent editor={editor} />
        </Suspense>
      ),
    });
  },
});
