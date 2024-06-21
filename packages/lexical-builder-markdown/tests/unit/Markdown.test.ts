import {
  RichTextPlan,
  buildEditorFromPlans,
  definePlan,
} from "@etrepum/lexical-builder";
import { MarkdownTransformersPlan } from "@etrepum/lexical-builder-markdown";
import { describe, it, expect } from "vitest";

describe("Markdown", () => {
  it("should have tests", () => {
    const plan = definePlan({
      name: "[root]",
      dependencies: [RichTextPlan, MarkdownTransformersPlan],
    });
    const handle = buildEditorFromPlans(plan);
    handle.dispose();
  });
});
