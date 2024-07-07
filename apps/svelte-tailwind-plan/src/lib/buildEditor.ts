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
  getPlanDependencyFromEditor,
} from "@etrepum/lexical-builder";
import { AutoLinkPlan, ClickableLinkPlan } from "@etrepum/lexical-builder-link";
import { CheckListPlan } from "@etrepum/lexical-builder-list";
import {
  MarkdownTransformersPlan,
  MarkdownShortcutsPlan,
} from "@etrepum/lexical-builder-markdown";
import { TailwindPlan } from "@etrepum/lexical-tailwind";
import { $getRoot } from "lexical";
import { SlackPastePlan } from "./SlackPastePlan";

const INITIAL_CONTENT = `
# Welcome to the Svelte 5 Tailwind example!

This example uses *markdown*, **markdown shortcuts**, _history_, and the link plan!

> Quotes are supported

CSS is provided by the Tailwind plan which has default styles for most built-in
nodes.

See more:

- [lexical.dev](https://lexical.dev/)
- [lexical-builder.pages.dev](https://lexical-builder.pages.dev/)
- [svelte.dev](https://svelte.dev/)

Checklist:

- [ ] Read the docs
- [ ] Build an app
`.trim();

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
      CheckListPlan,
      SlackPastePlan,
    ],
    $initialEditorState(editor) {
      const { $markdownImport } = getPlanDependencyFromEditor(
        editor,
        MarkdownTransformersPlan,
      ).output;
      $getRoot().append(...$markdownImport(INITIAL_CONTENT));
    },
  });
}
