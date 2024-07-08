/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { type TextNode } from "lexical";
import { $createEmojiNode } from "./EmojiNode";
import { findEmoji } from "./findEmoji";

export function $textNodeTransform(node: TextNode): void {
  if (!node.isSimpleText() || node.hasFormat("code")) {
    return;
  }

  const text = node.getTextContent();

  // Find only 1st occurrence as transform will be re-run anyway for the rest
  // because newly inserted nodes are considered to be dirty
  const emojiMatch = findEmoji(text);
  if (emojiMatch === null) {
    return;
  }

  let targetNode;
  if (emojiMatch.position === 0) {
    // First text chunk within string, splitting into 2 parts
    [targetNode] = node.splitText(
      emojiMatch.position + emojiMatch.shortcode.length,
    );
  } else {
    // In the middle of a string
    [, targetNode] = node.splitText(
      emojiMatch.position,
      emojiMatch.position + emojiMatch.shortcode.length,
    );
  }
  if (targetNode !== undefined) {
    const emojiNode = $createEmojiNode(emojiMatch.emoji, emojiMatch.shortcode);
    targetNode.replace(emojiNode);
  }
}
