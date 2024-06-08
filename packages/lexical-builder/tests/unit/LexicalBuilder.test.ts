/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  LexicalBuilder,
  configPlan,
  definePlan,
  safeCast,
} from "@etrepum/lexical-builder";
import { describe, it, expect } from "vitest";

describe("LexicalBuilder", () => {
  const ConfigPlan = definePlan({
    name: "configPlan",
    config: safeCast<{ a: 1; b: string | null }>({ a: 1, b: "b" }),
  });
  it("can be constructed", () => {
    expect(() => new LexicalBuilder()).not.toThrow();
  });
  it("merges plan configs", () => {
    const builder = new LexicalBuilder();
    builder.addPlan(ConfigPlan);
    const repPair = builder.planMap.get(ConfigPlan);
    expect(repPair?.[1]?.plan).toBe(ConfigPlan);
    const planRep = repPair![1];
    expect(planRep.configs.size).toBe(0);
    builder.addPlan(configPlan(ConfigPlan, { b: null }));
    expect(planRep.configs.size).toBe(1);
    expect(planRep.getConfig()).toEqual({ a: 1, b: null });
  });
  it("handles circular dependencies", () => {
    const PlanA = definePlan({ name: "A", config: {}, dependencies: [] });
    const PlanB = definePlan({ name: "B", config: {}, dependencies: [PlanA] });
    const PlanC = definePlan({ name: "C", config: {}, dependencies: [PlanB] });
    // This is silly and hard to do but why not prevent it
    PlanA.dependencies?.push(PlanC);
    const builder = new LexicalBuilder();
    expect(() => builder.addPlan(PlanA)).toThrowError(
      "LexicalBuilder: Circular dependency detected for Plan A from B",
    );
  });
});
