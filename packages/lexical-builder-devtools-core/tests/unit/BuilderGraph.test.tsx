import {
  DragonPlan,
  RichTextPlan,
  buildEditorFromPlans,
} from "@etrepum/lexical-builder";
import { describe, it, expect } from "vitest";
import { buildGraph } from "@etrepum/lexical-builder-devtools-core";

describe("BuilderGraph", () => {
  it("can build a graph", () => {
    const editorHandle = buildEditorFromPlans({
      name: "[root]",
      dependencies: [DragonPlan, RichTextPlan],
    });
    expect(buildGraph(editorHandle.editor)).toEqual(`flowchart TB
  P0["dragon"]
  P1["rich-text"]
  P2["[root]"]
  P2 --> P0
  P2 --> P1
`);
  });
});
