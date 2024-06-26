import type { Transformer } from "@lexical/markdown";

export interface MarkdownTransformerOptions {
  shouldPreserveNewlines: boolean;
}

export type Filter<T, U> = T extends U ? T : never;

export type KebabToCamel<S extends string> = S extends `${infer T}-${infer U}`
  ? `${T}${Capitalize<KebabToCamel<U>>}`
  : S;

/** Transformers by type (element, textFormat, textMatch) */
export type TransformersByType = {
  readonly [K in Transformer["type"] as KebabToCamel<K>]: Filter<
    Transformer,
    { type: K }
  >[];
};
