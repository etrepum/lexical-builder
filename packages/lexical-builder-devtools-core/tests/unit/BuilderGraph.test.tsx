import {
  DragonPlan,
  RichTextPlan,
  buildEditorFromPlans,
} from "@etrepum/lexical-builder";
import { describe, it, expect } from "vitest";
import { buildGraph } from "@etrepum/lexical-builder-devtools-core";

describe("BuilderGraph", () => {
  it("can build a graph", () => {
    const editor = buildEditorFromPlans({
      name: "[root]",
      dependencies: [DragonPlan, RichTextPlan],
    });
    expect(buildGraph(editor)).toEqual(`flowchart TB
  P0["InitialState"]
  P1["dragon"]
  P2["rich-text"]
  P3["[root]"]
  P3 --> P1
  P3 --> P2
`);
  });
});
