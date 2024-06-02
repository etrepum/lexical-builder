/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect } from "vitest";
import { textFromUnifiedID, unifiedIDFromText } from "../unifiedID";

const TEST_MAP = {
  "1F926-200D-2642-FE0F": "🤦‍♂️",
  "1F60A": "😊",
  "1F415-200D-1F9BA": "🐕‍🦺",
};
describe("unifiedIDFromText", () => {
  Object.entries(TEST_MAP).forEach(([k, v]) =>
    it(`${v} -> ${k}`, () =>
      expect(unifiedIDFromText(v).toUpperCase()).toEqual(k))
  );
});
describe("unifiedIDFromText", () => {
  Object.entries(TEST_MAP).forEach(([k, v]) =>
    it(`${v} -> ${k}`, () => expect(textFromUnifiedID(k)).toEqual(v))
  );
});
