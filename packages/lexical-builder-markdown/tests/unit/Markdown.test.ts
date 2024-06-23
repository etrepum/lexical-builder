import {
  InitialStatePlan,
  RichTextPlan,
  buildEditorFromPlans,
  configPlan,
  definePlan,
  getPlanDependencyFromEditor,
} from "@etrepum/lexical-builder";
import { MarkdownTransformersPlan } from "@etrepum/lexical-builder-markdown";
import { $getRoot, $isParagraphNode, $isTextNode } from "lexical";
import { describe, it, expect, assertType } from "vitest";

describe("Markdown", () => {
  it("should have tests", () => {
    const plan = definePlan({
      name: "[root]",
      dependencies: [
        RichTextPlan,
        MarkdownTransformersPlan,
        configPlan(InitialStatePlan, { updateOptions: { discrete: true } }),
      ],
      $initialEditorState(editor) {
        const {
          output: { $markdownImport },
        } = getPlanDependencyFromEditor(editor, MarkdownTransformersPlan);
        $getRoot().append(...$markdownImport(`This is a markdown document!`));
      },
    });
    const editor = buildEditorFromPlans(plan);
    editor.getEditorState().read(() => {
      const rootChildren = $getRoot().getChildren();
      expect(rootChildren).toHaveLength(1);
      const paragraphs = rootChildren.filter($isParagraphNode);
      expect(paragraphs).toHaveLength(1);
      const pChildren = paragraphs[0].getChildren();
      expect(pChildren).toHaveLength(1);
      const textNodes = pChildren.filter($isTextNode);
      expect(textNodes).toHaveLength(1);
      expect(textNodes[0].getTextContent()).toEqual(
        "This is a markdown document!",
      );
    });
    editor.dispose();
  });
});
