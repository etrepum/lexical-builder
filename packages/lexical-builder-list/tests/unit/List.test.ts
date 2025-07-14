import {
  RichTextExtension,
  buildEditorFromExtensions,
  defineExtension,
} from "@etrepum/lexical-builder";
import { CheckListExtension, ListExtension } from "@etrepum/lexical-builder-list";
import {
  $createListItemNode,
  $createListNode,
  $isListNode,
} from "@lexical/list";
import { $createTextNode, $getRoot } from "lexical";
import { describe, it, expect } from "vitest";

// TODO: write more tests here
describe("ListExtension", () => {
  const extension = defineExtension({
    name: "[root]",
    dependencies: [ListExtension, RichTextExtension],
    $initialEditorState: () => {
      $getRoot().append(
        $createListNode("number").append(
          $createListItemNode().append($createTextNode("item 1")),
          $createListItemNode().append($createTextNode("item 2")),
        ),
      );
    },
  });
  it("Creates the list", () => {
    const editor = buildEditorFromExtensions(extension);
    editor.update(
      () => {
        const ol = $getRoot().getFirstChildOrThrow();
        expect($isListNode(ol)).toBe(true);
      },
      { discrete: true },
    );
    editor.dispose();
  });
});
describe("CheckListExtension", () => {
  const extension = defineExtension({
    name: "[root]",
    dependencies: [CheckListExtension, RichTextExtension],
    $initialEditorState: () => {
      $getRoot().append(
        $createListNode("check").append(
          $createListItemNode(true).append($createTextNode("checked")),
          $createListItemNode(false).append($createTextNode("unchecked")),
        ),
      );
    },
  });
  it("Creates the list", () => {
    const editor = buildEditorFromExtensions(extension);
    editor.update(
      () => {
        const ul = $getRoot().getFirstChildOrThrow();
        expect($isListNode(ul)).toBe(true);
      },
      { discrete: true },
    );
    editor.dispose();
  });
});
