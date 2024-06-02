/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { supportedEmojis } from "./supportedEmojis.data";

export type EmojiMatch = Readonly<{
  position: number;
  shortcode: string;
  emoji: string;
}>;

/**
 * Map where keys are possible replacements while values are emoji
 * in text form
 */
const emojiReplacementMap = supportedEmojis
  .split("\n")
  .reduce<Map<string, string>>((acc, line) => {
    const [emoji, short_name, ...texts] = line.split(" ");
    acc.set(`:${short_name}:`, emoji!);
    for (const text of texts) {
      acc.set(text, emoji!);
    }
    return acc;
  }, new Map());

/**
 * Finds emoji shortcodes in text and if found - returns its position in text, matched shortcode and unified ID
 */
export default function findEmoji(text: string): EmojiMatch | null {
  const words = text.split(" ");
  for (let i = 0, position = 0; i < words.length; i++) {
    const word = words[i]!;
    const emoji = emojiReplacementMap.get(word);
    if (
      emoji &&
      // only consider matches for the unique :shortname: unless it's not at the
      // end of the text. This avoids having smileys taking precedence over
      // emoji with longer names (e.g. :b vs. :bear: or :p vs. :pig:)
      (text.length > position + word.length || word.endsWith(":"))
    ) {
      return {
        position,
        shortcode: word,
        emoji,
      };
    }
    position += word.length + 1;
  }
  return null;
}
