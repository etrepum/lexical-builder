/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { LexicalNode, SerializedTextNode, Spread } from "lexical";

import { TextNode } from "lexical";

export type SerializedEmojiNode = Spread<
  {
    type: ReturnType<typeof EmojiNode.getType>;
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
 * by EmojiPlan.
 */
export class EmojiNode extends TextNode {
  static getType(): "emoji" {
    return "emoji";
  }

  static clone(node: EmojiNode): EmojiNode {
    return new EmojiNode(node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
    return $createEmojiNode(serializedNode.text);
  }

  exportJSON(): SerializedEmojiNode {
    return {
      ...super.exportJSON(),
      type: "emoji",
    };
  }
}

export function $createEmojiNode(text: string): EmojiNode {
  const node = new EmojiNode(text)
    // In token mode node can be navigated through character-by-character,
    // but are deleted as a single entity (not invdividually by character).
    // This also forces Lexical to create adjacent TextNode on user input instead of
    // modifying Emoji node as it now acts as immutable node.
    .setMode("token");

  return node;
}

export function $isEmojiNode(
  node: LexicalNode | null | undefined
): node is EmojiNode {
  return node instanceof EmojiNode;
}
