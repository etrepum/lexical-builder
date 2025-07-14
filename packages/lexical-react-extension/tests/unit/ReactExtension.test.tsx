import { buildEditorFromExtensions } from "@etrepum/lexical-builder";
import { describe, it, expect } from "vitest";
import { ReactExtension, ReactPluginHostExtension } from "@etrepum/lexical-react-extension";

describe("ReactExtension", () => {
  it("Requires a provider", () => {
    expect(() =>
      buildEditorFromExtensions({
        name: "[root]",
        dependencies: [ReactExtension],
      }),
    ).toThrowError(
      "No ReactProviderExtension detected. You must use ReactPluginHostExtension or LexicalExtensionComposer to host React extensions. The following extensions depend on ReactExtension: [root]",
    );
  });
  it("Succeeds with a provider", () => {
    expect(
      buildEditorFromExtensions({
        name: "[root]",
        dependencies: [ReactExtension, ReactPluginHostExtension],
      }),
    ).toBeDefined();
  });
});
