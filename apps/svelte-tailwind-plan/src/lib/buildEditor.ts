/**
 * We set up the editor outside of .svelte files to avoid the
 * svelte/dollar_prefix_invalid compiler error because svelte
 * assigns special meaning that prefix and Lexical also has its
 * conventions around it.
 */

import {
  buildEditorFromPlans,
  RichTextPlan,
  HistoryPlan,
  type LexicalEditorWithDispose,
} from "@etrepum/lexical-builder";
import { AutoLinkPlan, ClickableLinkPlan } from "@etrepum/lexical-builder-link";
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
      RichTextPlan,
      MarkdownTransformersPlan,
      MarkdownShortcutsPlan,
      TailwindPlan,
      HistoryPlan,
      AutoLinkPlan,
      ClickableLinkPlan,
    ],
    $initialEditorState: $prepopulatedRichText,
  });
}
