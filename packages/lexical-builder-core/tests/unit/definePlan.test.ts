import { describe, it, expect, expectTypeOf, assertType } from "vitest";
import {
  type LexicalPlan,
  type NormalizedPeerDependency,
  type PlanConfigBase,
  declarePeerDependency,
  definePlan,
  provideOutput,
} from "@etrepum/lexical-builder-core";

describe("definePlan", () => {
  it("does not change identity", () => {
    const planArg: LexicalPlan<PlanConfigBase, "test", undefined, never> = {
      name: "test",
    };
    const plan = definePlan(planArg);
    expect(plan).toBe(planArg);
    expectTypeOf(plan).toMatchTypeOf(planArg);
  });
  it("infers the expected type (base case)", () => {
    assertType<LexicalPlan<PlanConfigBase, "test", undefined, never>>(
      definePlan({ name: "test" }),
    );
  });
  it("infers the expected type (config inference)", () => {
    assertType<LexicalPlan<{ number: 123 }, "test", undefined, never>>(
      definePlan({ name: "test", config: { number: 123 } }),
    );
  });
  it("infers the expected type (output inference)", () => {
    assertType<LexicalPlan<PlanConfigBase, "test", { output: number }, never>>(
      definePlan({
        name: "test",
        register() {
          return provideOutput({ output: 321 });
        },
      }),
    );
  });
  it("can define a plan without config", () => {
    assertType<LexicalPlan<PlanConfigBase, "test", undefined, never>>(
      definePlan({ name: "test" }),
    );
  });
  it("infers the correct init type", () => {
    assertType<LexicalPlan<PlanConfigBase, "test", undefined, "string">>(
      definePlan({
        name: "test",
        init: () => "string",
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
    // @ts-expect-error -- name doesn't match
    declarePeerDependency<typeof other>("wrong");
  });
});
