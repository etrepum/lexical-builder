/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { describe, it, expect } from "vitest";
import {
  LexicalBuilder,
  buildEditorFromExtensions,
  configExtension,
  declarePeerDependency,
  defineExtension,
  safeCast,
} from "@etrepum/lexical-builder";

const InitialStateExtensionName = "@etrepum/lexical-builder/InitialState";

describe("LexicalBuilder", () => {
  const ConfigExtension = defineExtension({
    name: "Config",
    config: safeCast<{ a: 1; b: string | null }>({ a: 1, b: "b" }),
  });
  it("merges extension configs", () => {
    const builder = LexicalBuilder.fromEditor(
      buildEditorFromExtensions(ConfigExtension, configExtension(ConfigExtension, { b: null })),
    );
    const reps = builder.sortedExtensionReps();
    expect(reps.length).toBe(2);
    const [rep] = reps.slice(-1);
    expect(rep.extension).toBe(ConfigExtension);
    expect(rep.getState().config).toEqual({ a: 1, b: null });
  });
  it("handles circular dependencies", () => {
    const ExtensionA = defineExtension({ name: "A", dependencies: [] });
    const ExtensionB = defineExtension({ name: "B", dependencies: [ExtensionA] });
    const ExtensionC = defineExtension({ name: "C", dependencies: [ExtensionB] });
    // This is silly and hard to do but why not prevent it
    ExtensionA.dependencies?.push(ExtensionC);
    expect(() => buildEditorFromExtensions(ExtensionA)).toThrowError(
      "LexicalBuilder: Circular dependency detected for Extension A from B",
    );
  });
  describe("handles peer dependency configuration", () => {
    const ExtensionA = defineExtension({
      name: "A",
      peerDependencies: [
        declarePeerDependency<typeof ConfigExtension>("Config", { b: "A" }),
      ],
    });
    it("peer-first", () => {
      const builder = LexicalBuilder.fromEditor(
        buildEditorFromExtensions(ExtensionA, ConfigExtension),
      );
      const reps = builder.sortedExtensionReps();
      expect(reps.map((rep) => rep.extension.name)).toEqual([
        InitialStateExtensionName,
        "Config",
        "A",
      ]);
      expect(reps[1].getState().config).toEqual({
        a: 1,
        b: "A",
      });
    });
    it("peer-last", () => {
      const builder = LexicalBuilder.fromEditor(
        buildEditorFromExtensions(ExtensionA, ConfigExtension),
      );
      const reps = builder.sortedExtensionReps();
      expect(reps.map((rep) => rep.extension.name)).toEqual([
        InitialStateExtensionName,
        "Config",
        "A",
      ]);
      expect(reps[1].getState().config).toEqual({
        a: 1,
        b: "A",
      });
    });
  });
});
