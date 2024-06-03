/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { LexicalBuilder } from "@etrepum/lexical-builder";
import { describe, it, expect } from "vitest";

describe("LexicalBuilder", () => {
  it("can be constructed", () => {
    expect(() => new LexicalBuilder()).not.toThrow();
  });
});
