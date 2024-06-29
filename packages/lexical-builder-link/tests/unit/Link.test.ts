import {
  definePlan,
  RichTextPlan,
  buildEditorFromPlans,
  getPlanDependencyFromEditor,
} from "@etrepum/lexical-builder";
import { LinkPlan } from "@etrepum/lexical-builder-link";
import { describe, it, expect } from "vitest";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  TextNode,
} from "lexical";
import { $isLinkNode, LinkNode } from "@lexical/link";

describe("Link", () => {
  const plan = definePlan({
    name: "[root]",
    dependencies: [LinkPlan, RichTextPlan],
    $initialEditorState: () => {
      const p = $createParagraphNode();
      p.append($createTextNode("Hello"));
      $getRoot().append(p);
    },
  });
  it("can convert a text node to a link with TOGGLE_LINK_COMMAND", () => {
    const editor = buildEditorFromPlans(plan);
    const dep = getPlanDependencyFromEditor(editor, LinkPlan);
    editor.update(
      () => {
        const textNode: TextNode = $getRoot().getLastDescendant();
        textNode.select(0);
        expect($isLinkNode(textNode.getParent())).toBe(false);
        editor.dispatchCommand(
          dep.output.TOGGLE_LINK_COMMAND,
          "https://lexical.dev/",
        );
        expect($isLinkNode(textNode.getParent())).toBe(true);
        let linkNode: LinkNode = textNode.getParent();
        expect(linkNode.getURL()).toBe("https://lexical.dev/");
        expect(linkNode.getTarget()).toBe(null);
        expect($getRoot().getTextContent()).toBe("Hello");
        editor.dispatchCommand(dep.output.TOGGLE_LINK_COMMAND, null);
        expect($getRoot().getTextContent()).toBe("Hello");
        expect($isLinkNode(textNode.getParent())).toBe(false);
        editor.dispatchCommand(dep.output.TOGGLE_LINK_COMMAND, {
          url: "https://lexical.dev/",
          target: "_blank",
          rel: "noopener",
          title: "title",
        });
        linkNode = textNode.getParent();
        expect(linkNode.getURL()).toBe("https://lexical.dev/");
        expect(linkNode.getTarget()).toBe("_blank");
        expect(linkNode.getRel()).toBe("noopener");
        expect(linkNode.getTitle()).toBe("title");
      },
      { discrete: true },
    );
    editor.dispose();
  });
});
