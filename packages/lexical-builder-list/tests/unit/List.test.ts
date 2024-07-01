import {
  RichTextPlan,
  buildEditorFromPlans,
  definePlan,
} from "@etrepum/lexical-builder";
import { CheckListPlan, ListPlan } from "@etrepum/lexical-builder-list";
import {
  $createListItemNode,
  $createListNode,
  $isListNode,
} from "@lexical/list";
import { $createTextNode, $getRoot } from "lexical";
import { describe, it, expect } from "vitest";

// TODO: write more tests here
describe("ListPlan", () => {
  const plan = definePlan({
    name: "[root]",
    dependencies: [ListPlan, RichTextPlan],
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
    const editor = buildEditorFromPlans(plan);
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
describe("CheckListPlan", () => {
  const plan = definePlan({
    name: "[root]",
    dependencies: [CheckListPlan, RichTextPlan],
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
    const editor = buildEditorFromPlans(plan);
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
