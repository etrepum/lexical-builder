import { describe, expect, it } from "vitest";
import { deepThemeMergeInPlace } from "../../src/deepThemeMergeInPlace";

describe("deepThemeMergeInPlace", () => {
  it("merges recursively", () => {
    const a = { a: "a", nested: { a: 1 } };
    const b = { b: "b", nested: { b: 2 } };
    const rval = deepThemeMergeInPlace(a, b);
    expect(a).toBe(rval);
    expect(a).toEqual({ a: "a", b: "b", nested: { a: 1, b: 2 } });
  });
});
