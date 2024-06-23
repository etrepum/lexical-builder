import type { Transformer } from "@lexical/markdown";

export interface MarkdownTransformerOptions {
  shouldPreserveNewlines: boolean;
  listIndentSize: number;
}

type Filter<T, U> = T extends U ? T : never;
type KebabToCamel<S extends string> = S extends `${infer T}-${infer U}`
  ? `${T}${Capitalize<KebabToCamel<U>>}`
  : S;

export type TransformersByType = {
  readonly [K in Transformer["type"] as KebabToCamel<K>]: Filter<
    Transformer,
    { type: K }
  >[];
};
