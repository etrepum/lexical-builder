import {
  defineExtension,
  RichTextExtension,
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
} from "@etrepum/lexical-builder";
import { LinkExtension } from "@etrepum/lexical-builder-link";
import { describe, it, expect } from "vitest";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  TextNode,
} from "lexical";
import { $isLinkNode, LinkNode } from "@lexical/link";

describe("Link", () => {
  const extension = defineExtension({
    name: "[root]",
    dependencies: [LinkExtension, RichTextExtension],
    $initialEditorState: () => {
      const p = $createParagraphNode();
      p.append($createTextNode("Hello"));
      $getRoot().append(p);
    },
  });
  it("can convert a text node to a link with toggleLink", () => {
    const editor = buildEditorFromExtensions(extension);
    const { toggleLink } = getExtensionDependencyFromEditor(editor, LinkExtension).output;
    editor.update(
      () => {
        const textNode: TextNode = $getRoot().getLastDescendant();
        textNode.select(0);
        expect($isLinkNode(textNode.getParent())).toBe(false);
        toggleLink("https://lexical.dev/");
        expect($isLinkNode(textNode.getParent())).toBe(true);
        let linkNode: LinkNode = textNode.getParent();
        expect(linkNode.getURL()).toBe("https://lexical.dev/");
        expect(linkNode.getTarget()).toBe(null);
        expect($getRoot().getTextContent()).toBe("Hello");
        toggleLink(null);
        expect($getRoot().getTextContent()).toBe("Hello");
        expect($isLinkNode(textNode.getParent())).toBe(false);
        toggleLink({
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
