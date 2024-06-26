/**
 * We set up the editor outside of .svelte files to avoid the
 * svelte/dollar_prefix_invalid compiler error because svelte
 * assigns special meaning that prefix and Lexical also has its
 * conventions around it.
 */

import {
  buildEditorFromPlans,
  DragonPlan,
  RichTextPlan,
  HistoryPlan,
  type LexicalEditorWithDispose,
} from "@etrepum/lexical-builder";
import {
  MarkdownTransformersPlan,
  MarkdownShortcutsPlan,
} from "@etrepum/lexical-builder-markdown";
import { TailwindPlan } from "@etrepum/lexical-tailwind";
import $prepopulatedRichText from "./$prepopulatedRichText";

export function buildEditor(): LexicalEditorWithDispose {
  return buildEditorFromPlans({
    name: "[root]",
    dependencies: [
      DragonPlan,
      RichTextPlan,
      MarkdownTransformersPlan,
      MarkdownShortcutsPlan,
      TailwindPlan,
      HistoryPlan,
    ],
    $initialEditorState: $prepopulatedRichText,
  });
}
