import { describe, it, expect, expectTypeOf, assertType } from "vitest";
import {
  type LexicalExtension,
  type NormalizedPeerDependency,
  type ExtensionConfigBase,
  declarePeerDependency,
  defineExtension,
  provideOutput,
} from "@etrepum/lexical-builder-core";

describe("defineExtension", () => {
  it("does not change identity", () => {
    const extensionArg: LexicalExtension<ExtensionConfigBase, "test", undefined, never> = {
      name: "test",
    };
    const extension = defineExtension(extensionArg);
    expect(extension).toBe(extensionArg);
    expectTypeOf(extension).toMatchTypeOf(extensionArg);
  });
  it("infers the expected type (base case)", () => {
    assertType<LexicalExtension<ExtensionConfigBase, "test", undefined, never>>(
      defineExtension({ name: "test" }),
    );
  });
  it("infers the expected type (config inference)", () => {
    assertType<LexicalExtension<{ number: 123 }, "test", undefined, never>>(
      defineExtension({ name: "test", config: { number: 123 } }),
    );
  });
  it("infers the expected type (output inference)", () => {
    assertType<LexicalExtension<ExtensionConfigBase, "test", { output: number }, never>>(
      defineExtension({
        name: "test",
        register() {
          return provideOutput({ output: 321 });
        },
      }),
    );
  });
  it("can define an extension without config", () => {
    assertType<LexicalExtension<ExtensionConfigBase, "test", undefined, never>>(
      defineExtension({ name: "test" }),
    );
  });
  it("infers the correct init type", () => {
    assertType<LexicalExtension<ExtensionConfigBase, "test", undefined, "string">>(
      defineExtension({
        name: "test",
        init: () => "string",
      }),
    );
  });
});

describe("declarePeerDependency", () => {
  it("validates the type argument", () => {
    const other = defineExtension({ name: "other", config: { other: true } });
    const dep = declarePeerDependency<typeof other>("other");
    assertType<NormalizedPeerDependency<typeof other>>(dep);
    expect(dep).toEqual(["other", undefined]);
    // @ts-expect-error -- name doesn't match
    declarePeerDependency<typeof other>("wrong");
  });
});
