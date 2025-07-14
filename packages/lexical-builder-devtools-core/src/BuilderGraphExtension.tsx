import { defineExtension, provideOutput } from "@etrepum/lexical-builder";
import { ReactExtension } from "@etrepum/lexical-react-extension";
import { Suspense } from "react";
import { BuilderGraphComponent } from "./BuilderGraphComponent";

export const BuilderGraphExtension = defineExtension({
  name: "@etrepum/lexical-builder-devtools-core/BuilderGraph",
  dependencies: [ReactExtension],
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
