/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect } from "vitest";
import findEmoji from "../src/findEmoji.js";

describe("findEmoji", () => {
  Object.entries({
    "handles :) mid-string": {
      position: "handles ".length,
      shortcode: ":)",
      emoji: "🙂",
    },
    "ignores smileys at the end :)": null,
    "finds emojis at the end :man-facepalming:": {
      position: "finds emojis at the end ".length,
      shortcode: ":man-facepalming:",
      emoji: "🤦‍♂️",
    },
  }).forEach(([k, v]) => {
    it(`${k} -> ${v ? v.shortcode : "not found"}`, () =>
      expect(findEmoji(k)).toEqual(v));
  });
});
