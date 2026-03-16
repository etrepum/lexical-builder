import { defineExtension } from "lexical";
import { Suspense } from "react";
import { ReactExtension } from "@lexical/react/ReactExtension";
import { BuilderGraphComponent } from "./BuilderGraphComponent";

export const BuilderGraphExtension = defineExtension({
  name: "@etrepum/lexical-builder-devtools-core/BuilderGraph",
  dependencies: [ReactExtension],
  build(editor) {
    return {
      Component: () => (
        <Suspense>
          <BuilderGraphComponent editor={editor} />
        </Suspense>
      ),
    };
  },
});
