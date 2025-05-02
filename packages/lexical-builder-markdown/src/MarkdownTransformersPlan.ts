import {
  RichTextPlan,
  declarePeerDependency,
  definePlan,
  getKnownTypesAndNodes,
  provideOutput,
  safeCast,
  type KnownTypesAndNodes,
} from "@etrepum/lexical-builder";
import {
  ELEMENT_TRANSFORMERS,
  type ElementTransformer,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  type TextMatchTransformer,
  CHECK_LIST,
  UNORDERED_LIST,
  type MultilineElementTransformer,
} from "@lexical/markdown";
import { type CheckListPlan } from "@etrepum/lexical-builder-list";
import { createMarkdownImport } from "./MarkdownImport";
import type { MarkdownTransformerOptions, TransformersByType } from "./types";
import { createMarkdownExport } from "./MarkdownExport";
import { $wrapWithIgnoreSelection } from "./utils";

export type MarkdownTransformersConfig = MarkdownTransformerOptions & {
  [K in keyof TransformersByType as `${K}Transformers`]: TransformersByType[K];
};
function filterDependencies<
  T extends
    | ElementTransformer
    | TextMatchTransformer
    | MultilineElementTransformer,
>({ nodes }: KnownTypesAndNodes, transforms: T[]) {
  // Remove transforms that depend on nodes that are not in this config
  const hasNode = nodes.has.bind(nodes);
  return transforms.filter((t) => t.dependencies.every(hasNode));
}

const CHECK_LIST_PLAN_NAME: (typeof CheckListPlan)["name"] =
  "@etrepum/lexical-builder-list/CheckList";

export interface MarkdownTransformersOutput {
  readonly transformerOptions: MarkdownTransformerOptions;
  readonly transformersByType: TransformersByType;
  readonly $markdownImport: ReturnType<typeof createMarkdownImport>;
  readonly $markdownExport: ReturnType<typeof createMarkdownExport>;
}

export const MarkdownTransformersPlan = definePlan({
  name: "@etrepum/lexical-builder-markdown/MarkdownTransformers",
  dependencies: [RichTextPlan],
  peerDependencies: [
    declarePeerDependency<typeof CheckListPlan>(CHECK_LIST_PLAN_NAME),
  ],
  config: safeCast<MarkdownTransformersConfig>({
    elementTransformers: ELEMENT_TRANSFORMERS,
    textFormatTransformers: TEXT_FORMAT_TRANSFORMERS,
    textMatchTransformers: TEXT_MATCH_TRANSFORMERS,
    multilineElementTransformers: MULTILINE_ELEMENT_TRANSFORMERS,
    shouldPreserveNewlines: false,
  }),
  // For now we replace the transformer arrays with the default
  // shallowMergeConfig. I think ideally these should be additive
  init(editorConfig, config, state): MarkdownTransformersOutput {
    const known = getKnownTypesAndNodes(editorConfig);
    const transformerOptions: MarkdownTransformerOptions = {
      shouldPreserveNewlines: config.shouldPreserveNewlines,
    };
    const elementTransformers = filterDependencies(
      known,
      config.elementTransformers,
    );
    // TODO: Awkward because CheckList is a separate plan from List
    //       but not a different node type!
    if (state.getPeer<typeof CheckListPlan>(CHECK_LIST_PLAN_NAME)) {
      const idx = elementTransformers.indexOf(UNORDERED_LIST);
      if (idx >= 0) {
        elementTransformers.splice(idx, 0, CHECK_LIST);
      }
    }
    const transformersByType: TransformersByType = {
      // Only register transforms for nodes that are configured
      element: elementTransformers,
      textMatch: filterDependencies(known, config.textMatchTransformers),
      multilineElement: filterDependencies(
        known,
        config.multilineElementTransformers,
      ),
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
