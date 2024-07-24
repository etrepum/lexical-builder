import { definePlan, RichTextPlan } from "@etrepum/lexical-builder";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { LexicalPlanComposer } from "@etrepum/lexical-react-plan";

describe("LexicalPlanComposer", () => {
  const plan = definePlan({
    name: "[root]",
    dependencies: [RichTextPlan],
  });
  function MyEditor({ children }: { children?: React.ReactNode }) {
    return <LexicalPlanComposer plan={plan}>{children}</LexicalPlanComposer>;
  }
  let container: HTMLElement;
  let reactRoot: Root;

  beforeEach(() => {
    container = document.createElement("div");
    act(() => {
      reactRoot = createRoot(container);
    });
    document.body.appendChild(container);
  });
  afterEach(() => {
    act(() => {
      reactRoot.unmount();
    });
    document.body.removeChild(container);
    container = null;
  });
  it("Renders", () => {
    act(() => {
      reactRoot.render(<MyEditor />);
    });
    expect(container.innerHTML).toEqual(
      `<div contenteditable="true" role="textbox" spellcheck="true" style="user-select: text; white-space: pre-wrap; word-break: break-word;" data-lexical-editor="true"><p><br></p></div>`,
    );
  });
  it("Provides a context", async () => {
    function InitialPlugin() {
      const [editor] = useLexicalComposerContext();
      useEffect(() => {
        editor.update(() => {
          $getRoot()
            .clear()
            .append(
              $createParagraphNode().append($createTextNode("Initial text")),
            );
        });
      }, [editor]);
      return null;
    }
    await act(async () => {
      reactRoot.render(
        <MyEditor>
          <InitialPlugin />
        </MyEditor>,
      );
      await Promise.resolve().then();
    });
    expect(container.innerHTML).toEqual(
      `<div contenteditable="true" role="textbox" spellcheck="true" style="user-select: text; white-space: pre-wrap; word-break: break-word;" data-lexical-editor="true"><p dir="ltr"><span data-lexical-text="true">Initial text</span></p></div>`,
    );
  });
});
