/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
} from "lexical";
import { TextNode, $applyNodeReplacement } from "lexical";

export type SerializedEmojiNode = Spread<
  {
    type: ReturnType<typeof EmojiNode.getType>;
    shortcode?: string;
  },
  SerializedTextNode
>;

/**
 * EmojiNode doesn't really need to override any of TextNode's functionality,
 * other than these serialization and type related static methods.
 *
 * The behavior is augmented in $createEmojiNode where we set mode to token
 * so it is treated as an "atomic" unit and not considered for further text
 * transforms.
 *
 * The display behavior is all implemented in the mutation listener set up
 * by EmojiPlan, which makes it a little easier to ensure that clean-up is
 * done properly.
 */
export class EmojiNode extends TextNode {
  __shortcode?: string | undefined;

  constructor(text: string, shortcode?: string | undefined, key?: NodeKey) {
    super(text, key);
    this.__shortcode = shortcode;
  }

  static getType(): "emoji" {
    return "emoji";
  }

  static clone(node: EmojiNode): EmojiNode {
    return new EmojiNode(node.__text, node.__shortcode, node.__key);
  }

  static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
    return $createEmojiNode(serializedNode.text, serializedNode.shortcode);
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const res = super.updateDOM(prevNode, dom, config);
    if (!res && prevNode.__shortcode !== this.__shortcode) {
      if (this.__shortcode) {
        dom.dataset.emojiShortcode = this.__shortcode;
      } else {
        delete dom.dataset.emojiShortcode;
      }
    }
    return res;
  }

  createDOM(
    config: EditorConfig,
    editor?: LexicalEditor | undefined,
  ): HTMLElement {
    const dom = super.createDOM(config, editor);
    if (this.__shortcode) {
      dom.dataset.emojiShortcode = this.__shortcode;
    }
    return dom;
  }

  getShortcode(): string | undefined {
    return this.getLatest().__shortcode;
  }

  setShortcode(shortcode?: string | undefined): this {
    const node = this.getWritable();
    node.__shortcode = shortcode;
    return node;
  }

  exportJSON(): SerializedEmojiNode {
    return {
      ...super.exportJSON(),
      shortcode: this.__shortcode,
      type: "emoji",
    };
  }
}

/**
 * @param text - The emoji string (a decoded unified id)
 * @returns the EmojiNode
 */
export function $createEmojiNode(
  text: string,
  shortcode?: string | undefined,
): EmojiNode {
  // In token mode node can be navigated through character-by-character,
  // but are deleted as a single entity (not individually by character).
  // This also forces Lexical to create adjacent TextNode on user input instead of
  // modifying Emoji node as it now acts as immutable node.
  return $applyNodeReplacement(new EmojiNode(text, shortcode).setMode("token"));
}

export function $isEmojiNode(
  node: LexicalNode | null | undefined,
): node is EmojiNode {
  return node instanceof EmojiNode;
}
