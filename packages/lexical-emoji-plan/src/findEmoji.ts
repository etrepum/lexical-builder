/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { supportedEmojis } from "./supportedEmojis.data";

/**
 * The location of the emoji match in the given text
 */
export type EmojiMatch = Readonly<{
  /** The start position of the text */
  position: number;
  /** The matching shortcode from the text, such as ":man-facepalming:" or ":)" */
  shortcode: string;
  /** The text of the emoji from the database, such as "🤦‍♂️" or "🙂" */
  emoji: string;
}>;

/**
 * Map where keys are possible replacements while values are emoji
 * in text form
 */
const emojiReplacementMap = supportedEmojis
  .split("\n")
  .reduce<Map<string, string>>((acc, line) => {
    const [emoji, shortName, ...texts] = line.split(" ");
    acc.set(`:${shortName!}:`, emoji!);
    for (const text of texts) {
      acc.set(text, emoji!);
    }
    return acc;
  }, new Map());

/**
 * Finds emoji shortcodes in text, tokenized by spaces. The canonical short
 * names such as ":smiley:" are matched even if they are at the end of the
 * text, but a text such as ":)" is only matched if it is followed by a
 * space.
 *
 * @example Matching canonical short names
 * ```js
 * assert(findEmoji(":man-facepalming:").emoji === "🤦‍♂️");
 * ```
 *
 * @example Matching non-canonical text for an emoji
 * ```js
 * const input = "handles :) mid-string";
 * const result = findEmoji(input);
 * assert(result.position === "handles ".length);
 * assert(result.shortcode === ":)")
 * assert(result.emoji === "🙂");
 * assert([
 *   input.slice(0, result.position),
 *   result.emoji,
 *   input.slice(result.position + result.shortcode.length)
 * ].join("") === "handles 🙂 mid-string");
 * ```
 *
 * @example Non-canonical text does not match at the end
 * ```js
 * assert(findEmoji(":)") === null)
 * ```
 */
export function findEmoji(text: string): EmojiMatch | null {
  const words = text.split(/[ \xa0]/g);
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
