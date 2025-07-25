/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-shadow, @typescript-eslint/no-unsafe-return -- tests */
import {
  buildEditorFromExtensions,
  configExtension,
  type LexicalEditorWithDispose,
  HistoryExtension,
  RichTextExtension,
} from "@etrepum/lexical-builder";
import { TreeView } from "@lexical/react/LexicalTreeView";
import {
  $createLineBreakNode,
  type LexicalEditor,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
} from "lexical";
import { act } from "@testing-library/react";
import {
  describe,
  beforeEach,
  it,
  afterEach,
  expect,
  vi,
  type Mock,
} from "vitest";
import {
  mountReactPluginComponent,
  mountReactPluginHost,
  ReactExtension,
  ReactPluginHostExtension,
} from "@etrepum/lexical-react-extension";

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

describe("configExtension", () => {
  it("returns what is expected", () => {
    const arg = configExtension(ReactExtension, { contentEditable: null });
    expect(arg.length).toBe(2);
    expect(arg[0]).toBe(ReactExtension);
    expect(arg[1]).toEqual({ contentEditable: null });
  });
});
describe("ReactPluginHostExtension", () => {
  let editor: LexicalEditorWithDispose;
  let rootDom: HTMLDivElement & { __lexicalEditor?: LexicalEditor | null };
  let treeDom: HTMLDivElement;
  let cleanupFn: Mock;
  let registerFn: Mock;
  let pluginHostDom: HTMLDivElement;

  beforeEach(async () => {
    cleanupFn = vi.fn();
    registerFn = vi.fn().mockReturnValue(cleanupFn);
    expect(document.body.children.length).toBe(0);
    await act(async () => {
      rootDom = document.createElement("div");
      rootDom.id = "lexical-editor";
      treeDom = document.createElement("div");
      treeDom.id = "lexical-state";
      pluginHostDom = document.createElement("div");
      pluginHostDom.id = "react-plugin-host";

      document.body.append(rootDom, pluginHostDom, treeDom);
      editor = buildEditorFromExtensions({
        name: "[root]",
        $initialEditorState: $prepopulatedRichText,
        dependencies: [RichTextExtension, HistoryExtension, ReactPluginHostExtension],
        namespace: "Vanilla JS Extension Demo",
        register: (editor: LexicalEditor) => {
          mountReactPluginHost(editor, pluginHostDom);
          mountReactPluginComponent(editor, {
            Component: TreeView,
            domNode: treeDom,
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
          return registerFn();
        },
      });
      editor.setRootElement(rootDom);
    });
  });
  afterEach(async () => {
    await act(async () => {
      editor.dispose();
    });
  });
  it("creates an editor", async () => {
    const EXPECT_HTML = `<p dir="ltr"><span data-lexical-text="true">Plain Text!</span><br><strong data-lexical-text="true">Bold Text!</strong></p>`;
    expect(editor.getRootElement()).toBe(rootDom);
    expect(rootDom.__lexicalEditor).toBe(editor);
    expect(rootDom.innerHTML).toEqual(EXPECT_HTML);
    expect(treeDom.innerHTML).toMatch(/None dispatched/);
    await act(async () => {
      editor.dispose();
    });
    // All nodes are still in the document after dispose
    expect(rootDom.isConnected).toBe(true);
    expect(treeDom.isConnected).toBe(true);
    expect(pluginHostDom.isConnected).toBe(true);
    // The TreeView and plugin host are removed when the editor is cleaned up
    expect(treeDom.innerHTML).toEqual("");
    expect(pluginHostDom.innerHTML).toEqual("");
    // The editor removes its contents too
    expect(rootDom.__lexicalEditor).toBe(null);
    expect(rootDom.innerHTML).toEqual("");
    // Check the whole body for expectations
    expect(document.body.innerHTML).toEqual(
      `<div id="lexical-editor" style="user-select: text; white-space: pre-wrap; word-break: break-word;" data-lexical-editor="true"></div><div id="react-plugin-host"></div><div id="lexical-state"></div>`,
    );
  });
});
