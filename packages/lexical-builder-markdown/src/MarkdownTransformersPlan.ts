import {
  RichTextPlan,
  definePlan,
  getKnownTypesAndNodes,
  provideOutput,
  safeCast,
  type KnownTypesAndNodes,
} from "@etrepum/lexical-builder";
import {
  ELEMENT_TRANSFORMERS,
  type ElementTransformer,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  type TextMatchTransformer,
} from "@lexical/markdown";
import { createMarkdownImport } from "./MarkdownImport";
import type { MarkdownTransformerOptions, TransformersByType } from "./types";
import { createMarkdownExport } from "./MarkdownExport";
import { $wrapWithIgnoreSelection } from "./utils";

export type MarkdownTransformersConfig = MarkdownTransformerOptions & {
  [K in keyof TransformersByType as `${K}Transformers`]: TransformersByType[K];
};
function filterDependencies<
  T extends ElementTransformer | TextMatchTransformer,
>({ nodes }: KnownTypesAndNodes, transforms: T[]) {
  // Remove transforms that depend on nodes that are not in this config
  const hasNode = nodes.has.bind(nodes);
  return transforms.filter((t) => t.dependencies.every(hasNode));
}

export interface MarkdownTransformersOutput {
  readonly transformerOptions: MarkdownTransformerOptions;
  readonly transformersByType: TransformersByType;
  readonly $markdownImport: ReturnType<typeof createMarkdownImport>;
  readonly $markdownExport: ReturnType<typeof createMarkdownExport>;
}

export const MarkdownTransformersPlan = definePlan({
  name: "@etrepum/lexical-builder-markdown/MarkdownTransformers",
  dependencies: [RichTextPlan],
  config: safeCast<MarkdownTransformersConfig>({
    elementTransformers: ELEMENT_TRANSFORMERS,
    textFormatTransformers: TEXT_FORMAT_TRANSFORMERS,
    textMatchTransformers: TEXT_MATCH_TRANSFORMERS,
    shouldPreserveNewlines: false,
  }),
  // For now we replace the transformer arrays with the default
  // shallowMergeConfig. I think ideally these should be additive
  init(editorConfig, config, _state): MarkdownTransformersOutput {
    const known = getKnownTypesAndNodes(editorConfig);
    const transformerOptions: MarkdownTransformerOptions = {
      shouldPreserveNewlines: config.shouldPreserveNewlines,
    };
    const transformersByType: TransformersByType = {
      // Only register transforms for nodes that are configured
      element: filterDependencies(known, config.elementTransformers),
      textMatch: filterDependencies(known, config.textMatchTransformers),
      textFormat: config.textFormatTransformers,
    };
    const $markdownImport = $wrapWithIgnoreSelection(
      createMarkdownImport(transformersByType, transformerOptions),
    );
    const $markdownExport = createMarkdownExport(
      transformersByType,
      transformerOptions,
    );
    return {
      transformerOptions,
      transformersByType,
      $markdownExport,
      $markdownImport,
    };
  },
  register: (_editor, _config, state) => {
    return provideOutput(state.getInitResult());
  },
});
