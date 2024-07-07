import type { InitialEditorConfig } from "@etrepum/lexical-builder-core";
import type { KlassConstructor, LexicalNode } from "lexical";

export interface KnownTypesAndNodes {
  types: Set<string>;
  nodes: Set<KlassConstructor<typeof LexicalNode>>;
}
export function getKnownTypesAndNodes(config: InitialEditorConfig) {
  const types: KnownTypesAndNodes["types"] = new Set();
  const nodes: KnownTypesAndNodes["nodes"] = new Set();
  for (const klassOrReplacement of config.nodes ?? []) {
    const klass =
      typeof klassOrReplacement === "function"
        ? klassOrReplacement
        : klassOrReplacement.replace;
    types.add(klass.getType());
    nodes.add(klass);
  }
  return { types, nodes };
}
