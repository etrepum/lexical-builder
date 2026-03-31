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
    const [emoji, shortNames, texts] = line.split("\t");
    if (emoji) {
      for (const shortName of (shortNames ?? "").split(" ")) {
        if (shortName) {
          acc.set(`:${shortName}:`, emoji);
        }
      }
      for (const text of (texts ?? "").split(" ")) {
        if (text) {
          acc.set(text, emoji);
        }
      }
    }
    return acc;
  }, new Map());

const EMOJI_DELIMITER = /[ \xa0:]/g;

/**
 * Finds emoji shortcodes in text by scanning for potential start positions. The
 * canonical short names such as ":smiley:" are matched even if they are at
 * the end of the text, but a text such as ":)" is only matched if it is
 * followed by a space or non-letter character.
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
  let lastWordBreak = 0;
  let lastColon: number | null = text[0] === ":" ? 0 : null;
  // eslint-disable-next-line no-useless-assignment -- false positive
  let match: RegExpExecArray | null = null;
  EMOJI_DELIMITER.lastIndex = 1;
  while ((match = EMOJI_DELIMITER.exec(text))) {
    if (match[0] === ":") {
      if (lastColon !== null) {
        const shortcode = text.slice(lastColon, match.index + 1);
        const emoji = emojiReplacementMap.get(shortcode);
        if (emoji) {
          return { position: lastColon, emoji, shortcode };
        }
      }
      lastColon = match.index;
    } else {
      const shortcode = text.slice(lastWordBreak, match.index);
      if (shortcode) {
        const emoji = emojiReplacementMap.get(shortcode);
        if (emoji) {
          return { position: lastWordBreak, emoji, shortcode };
        }
      }
      lastColon = null;
      lastWordBreak = match.index + 1;
    }
  }
  return null;
}
