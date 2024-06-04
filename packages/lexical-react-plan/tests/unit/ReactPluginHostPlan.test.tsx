import {
  buildEditorFromPlans,
  defineRootPlan,
  DragonPlan,
  EditorHandle,
  HistoryPlan,
  RichTextPlan,
} from "@etrepum/lexical-builder";
import {
  mountReactPluginComponent,
  mountReactPluginHost,
  ReactPluginHostPlan,
} from "@etrepum/lexical-react-plan";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { $createLineBreakNode, LexicalEditor } from "lexical";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { act } from "@testing-library/react";

import { describe, beforeEach, it, afterEach, expect } from "vitest";

function $prepopulatedRichText() {
  const root = $getRoot();
  if (root.getFirstChild() !== null) {
    return;
  }

  const paragraph = $createParagraphNode();
  paragraph.append(
    $createTextNode("Plain Text!"),
    $createLineBreakNode(),
    $createTextNode("Bold Text!").toggleFormat("bold"),
  );
  root.append(paragraph);
}

describe("ReactPluginHostPlan", () => {
  let editorHandle: EditorHandle;
  let rootDom: HTMLDivElement;
  let treeDom: HTMLDivElement;
  beforeEach(async () => {
    await act(async () => {
      rootDom = document.createElement("div");
      rootDom.id = "lexical-editor";
      treeDom = document.createElement("div");
      treeDom.id = "lexical-state";
      document.body.append(rootDom, treeDom);
      editorHandle = buildEditorFromPlans(
        defineRootPlan({
          $initialEditorState: $prepopulatedRichText,
          dependencies: [
            DragonPlan,
            RichTextPlan,
            HistoryPlan,
            ReactPluginHostPlan,
          ],
          namespace: "Vanilla JS Plan Demo",
          register: (editor: LexicalEditor) => {
            const el = document.createElement("div");
            document.body.appendChild(el);
            mountReactPluginHost(editor, el);
            mountReactPluginComponent(editor, {
              Component: TreeView,
              domNode: document.getElementById("lexical-state")!,
              key: "tree-view",
              props: {
                editor,
                timeTravelButtonClassName: "debug-timetravel-button",
                timeTravelPanelButtonClassName: "debug-timetravel-panel-button",
                timeTravelPanelClassName: "debug-timetravel-panel",
                timeTravelPanelSliderClassName: "debug-timetravel-panel-slider",
                treeTypeButtonClassName: "debug-treetype-button",
                viewClassName: "tree-view-output",
              },
            });
            return () => {
              el.remove();
            };
          },
        }),
      );
      editorHandle.editor.setRootElement(
        document.getElementById("lexical-editor"),
      );
    });
  });
  afterEach(async () => {
    await act(async () => {
      editorHandle.dispose();
    });
  });
  it("creates an editor", async () => {
    const EXPECT_HTML = `<p dir="ltr"><span data-lexical-text="true">Plain Text!</span><br><strong data-lexical-text="true">Bold Text!</strong></p>`;
    expect(editorHandle.editor.getRootElement()).toBe(rootDom);
    expect((rootDom as any).__lexicalEditor).toBe(editorHandle.editor);
    expect(rootDom.innerHTML).toEqual(EXPECT_HTML);
    expect(treeDom.innerHTML).toMatch(/None dispatched/);
    await act(async () => {
      editorHandle.dispose();
    });
    // The TreeView is removed when the editor is cleaned up
    expect(treeDom.innerHTML).toEqual("");
    // The editor removes its contents too
    expect((rootDom as any).__lexicalEditor).toBe(null);
    expect(rootDom.innerHTML).toEqual("");
    // Check the whole body for expectations
    expect(document.body.innerHTML).toEqual(
      `<div id="lexical-editor" style="user-select: text; white-space: pre-wrap; word-break: break-word;" data-lexical-editor="true"></div><div id="lexical-state"></div>`,
    );
  });
});
