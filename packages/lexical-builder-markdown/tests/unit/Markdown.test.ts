import {
  InitialStatePlan,
  RichTextPlan,
  buildEditorFromPlans,
  configPlan,
  definePlan,
  getPlanDependencyFromEditor,
} from "@etrepum/lexical-builder";
import {
  MarkdownTransformersOutput,
  MarkdownTransformersPlan,
} from "@etrepum/lexical-builder-markdown";
import { $getRoot, LexicalEditor } from "lexical";
import { $isHeadingNode } from "@lexical/rich-text";
import { describe, it, expect } from "vitest";

interface MarkdownSpec {
  readonly name: string;
  readonly markdownDoc: string;
  readonly plainText: string[];
  readonly $readTest?: (
    output: MarkdownTransformersOutput,
    editor: LexicalEditor,
  ) => void;
  readonly runTest?: (
    output: MarkdownTransformersOutput,
    editor: LexicalEditor,
  ) => void;
}

describe("Markdown", () => {
  const specs: MarkdownSpec[] = [
    {
      name: "with no formatting",
      markdownDoc: "This is a markdown document!",
      plainText: ["This is a markdown document!"],
    },
    {
      name: "with *bold** formatting",
      markdownDoc: "This is a **markdown** document!",
      plainText: ["This is a ", "markdown", " document!"],
      $readTest() {
        const textNodes = $getRoot().getAllTextNodes();
        expect(textNodes.map((node) => node.hasFormat("bold"))).toEqual([
          false,
          true,
          false,
        ]);
      },
    },
    {
      name: "with # heading",
      markdownDoc: ["# Heading", "", "Body"].join("\n"),
      plainText: ["Heading", "Body"],
      $readTest() {
        const rootChildren = $getRoot().getChildren();
        expect(rootChildren).toHaveLength(2);
        expect(rootChildren.map($isHeadingNode)).toEqual([true, false]);
      },
    },
  ];
  specs.forEach(({ name, markdownDoc, plainText, runTest, $readTest }) => {
    it(name, () => {
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
          $getRoot().append(...$markdownImport(markdownDoc));
        },
      });
      const editor = buildEditorFromPlans(plan);
      const { output } = getPlanDependencyFromEditor(
        editor,
        MarkdownTransformersPlan,
      );
      editor.getEditorState().read(() => {
        expect(
          $getRoot()
            .getAllTextNodes()
            .map((node) => node.getTextContent()),
        ).toEqual(plainText);
        expect(output.$markdownExport()).toEqual(markdownDoc);
        $readTest?.(output, editor);
      });
      runTest?.(output, editor);
      editor.dispose();
    });
  });
});
