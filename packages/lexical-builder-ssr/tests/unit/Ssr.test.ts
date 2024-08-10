import { describe, it, expect } from "vitest";
import { buildEditorFromPlans } from "@etrepum/lexical-builder";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { withDOM, prerenderEditorHtml } from "@etrepum/lexical-builder-ssr";

describe("withDOM", () => {
  it("passes a window argument", () => {
    expect(withDOM((window) => typeof window === "object")).toBe(true);
  });
});
describe("prerenderEditorHtml", () => {
  it("renders html", () => {
    const editor = buildEditorFromPlans({
      name: "test",
      $initialEditorState() {
        $getRoot().append(
          $createParagraphNode().append($createTextNode("This is only a test")),
        );
      },
    });
    expect(prerenderEditorHtml(editor)).toEqual(
      `<p dir="ltr"><span data-lexical-text="true">This is only a test</span></p>`,
    );
  });
});
