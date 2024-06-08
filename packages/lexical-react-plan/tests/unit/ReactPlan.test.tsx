import { buildEditorFromPlans } from "@etrepum/lexical-builder";
import { describe, it, expect } from "vitest";
import { ReactPlan, ReactPluginHostPlan } from "@etrepum/lexical-react-plan";

describe("ReactPlan", () => {
  it("Requires a provider", () => {
    expect(() =>
      buildEditorFromPlans({
        dependencies: [ReactPlan],
      }),
    ).toThrowError(
      "No ReactProviderPlan detected. You must use ReactPluginHostPlan or LexicalPlanComposer to host React plans. The following plans depend on ReactPlan: [root]",
    );
  });
  it("Succeeds with a provider", () => {
    expect(
      buildEditorFromPlans({
        dependencies: [ReactPlan, ReactPluginHostPlan],
      }),
    ).toBeDefined();
  });
});
