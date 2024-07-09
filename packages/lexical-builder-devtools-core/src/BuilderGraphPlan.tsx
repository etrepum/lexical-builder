import { definePlan, provideOutput } from "@etrepum/lexical-builder";
import { ReactPlan } from "@etrepum/lexical-react-plan";
import { Suspense } from "react";
import { BuilderGraphComponent } from "./BuilderGraphComponent";

export const BuilderGraphPlan = definePlan({
  name: "@etrepum/lexical-builder-devtools-core/BuilderGraph",
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
