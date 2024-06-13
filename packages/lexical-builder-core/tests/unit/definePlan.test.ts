import {
  LexicalPlan,
  NormalizedPeerDependency,
  PlanConfigBase,
  RootPlan,
  declarePeerDependency,
  definePlan,
  defineRootPlan,
  provideOutput,
} from "@etrepum/lexical-builder-core";
import { describe, it, expect, expectTypeOf, assertType } from "vitest";

describe("definePlan", () => {
  it("does not change identity", () => {
    const planArg: LexicalPlan<PlanConfigBase, "test", undefined> = {
      name: "test",
      config: {},
    };
    const plan = definePlan(planArg);
    expect(plan).toBe(planArg);
    expectTypeOf(plan).toMatchTypeOf(planArg);
  });
  it("infers the expected type (base case)", () => {
    assertType<LexicalPlan<PlanConfigBase, "test", undefined>>(
      definePlan({ name: "test", config: {} }),
    );
  });
  it("infers the expected type (config inference)", () => {
    assertType<LexicalPlan<{ number: 123 }, "test", undefined>>(
      definePlan({ name: "test", config: { number: 123 } }),
    );
  });
  it("infers the expected type (output inference)", () => {
    assertType<LexicalPlan<PlanConfigBase, "test", { output: number }>>(
      definePlan({
        name: "test",
        config: {},
        register() {
          return provideOutput({ output: 321 });
        },
      }),
    );
  });
});

describe("defineRootPlan", () => {
  it("mutates in-place (does not change identity)", () => {
    const plan: Omit<
      LexicalPlan<PlanConfigBase, "[root]", undefined>,
      "name" | "config"
    > = {};
    const rootPlan = defineRootPlan(plan);
    expect(rootPlan).toBe(plan);
    assertType<LexicalPlan<PlanConfigBase, "[root]", undefined>>(rootPlan);
  });
  it("infers the expected type (base case)", () => {
    assertType<LexicalPlan<PlanConfigBase, "[root]", undefined>>(
      defineRootPlan({}),
    );
  });
  it("infers the expected type (output inference)", () => {
    assertType<LexicalPlan<PlanConfigBase, "[root]", { output: number }>>(
      defineRootPlan({
        register() {
          return provideOutput({ output: 321 });
        },
      }),
    );
  });
});

describe("declarePeerDependency", () => {
  it("validates the type argument", () => {
    const other = definePlan({ name: "other", config: { other: true } });
    const dep = declarePeerDependency<typeof other>("other");
    assertType<NormalizedPeerDependency<typeof other>>(dep);
    expect(dep).toEqual(["other", undefined]);
    // @ts-expect-error
    declarePeerDependency<typeof other>("wrong");
  });
});
