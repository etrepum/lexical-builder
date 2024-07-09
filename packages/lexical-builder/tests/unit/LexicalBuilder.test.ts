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
  buildEditorFromPlans,
  configPlan,
  declarePeerDependency,
  definePlan,
  safeCast,
} from "@etrepum/lexical-builder";

const InitialStatePlanName = "@etrepum/lexical-builder/InitialState";

describe("LexicalBuilder", () => {
  const ConfigPlan = definePlan({
    name: "Config",
    config: safeCast<{ a: 1; b: string | null }>({ a: 1, b: "b" }),
  });
  it("merges plan configs", () => {
    const builder = LexicalBuilder.fromEditor(
      buildEditorFromPlans(ConfigPlan, configPlan(ConfigPlan, { b: null })),
    );
    const reps = builder.sortedPlanReps();
    expect(reps.length).toBe(2);
    const [rep] = reps.slice(-1);
    expect(rep.plan).toBe(ConfigPlan);
    expect(rep.getState().config).toEqual({ a: 1, b: null });
  });
  it("handles circular dependencies", () => {
    const PlanA = definePlan({ name: "A", dependencies: [] });
    const PlanB = definePlan({ name: "B", dependencies: [PlanA] });
    const PlanC = definePlan({ name: "C", dependencies: [PlanB] });
    // This is silly and hard to do but why not prevent it
    PlanA.dependencies?.push(PlanC);
    expect(() => buildEditorFromPlans(PlanA)).toThrowError(
      "LexicalBuilder: Circular dependency detected for Plan A from B",
    );
  });
  describe("handles peer dependency configuration", () => {
    const PlanA = definePlan({
      name: "A",
      peerDependencies: [
        declarePeerDependency<typeof ConfigPlan>("Config", { b: "A" }),
      ],
    });
    it("peer-first", () => {
      const builder = LexicalBuilder.fromEditor(
        buildEditorFromPlans(PlanA, ConfigPlan),
      );
      const reps = builder.sortedPlanReps();
      expect(reps.map((rep) => rep.plan.name)).toEqual([
        InitialStatePlanName,
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
        buildEditorFromPlans(PlanA, ConfigPlan),
      );
      const reps = builder.sortedPlanReps();
      expect(reps.map((rep) => rep.plan.name)).toEqual([
        InitialStatePlanName,
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
