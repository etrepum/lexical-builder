/**
 * We set up the editor (mostly) outside of .svelte files to avoid the
 * svelte/dollar_prefix_invalid compiler error because svelte
 * assigns special meaning that prefix and Lexical also has its
 * conventions around it.
 */

import {
  buildEditorFromExtensions,
  RichTextExtension,
  HistoryExtension,
  type LexicalEditorWithDispose,
  configExtension,
} from "@etrepum/lexical-builder";
import { AutoLinkExtension, ClickableLinkExtension } from "@etrepum/lexical-builder-link";
import { CheckListExtension } from "@etrepum/lexical-builder-list";
import {
  MarkdownTransformersExtension,
  MarkdownShortcutsExtension,
} from "@etrepum/lexical-builder-markdown";
import { TailwindExtension } from "@etrepum/lexical-tailwind";
import {
  $isEmojiNode,
  EmojiNode,
  EmojiExtension,
} from "@etrepum/lexical-emoji-extension";
import type { TextMatchTransformer } from "@lexical/markdown";
import { TableExtension } from "@etrepum/lexical-builder-table";
import { SlackPasteExtension } from "./SlackPasteExtension";
import { StickyExtension } from "./sticky/StickyExtension";

export const INITIAL_CONTENT = `
# Welcome to the Svelte 5 Tailwind example!

This example uses *markdown*, **markdown shortcuts**, _history_, emoji and
the link extension! SSR is used for the editor.

It also has a basic sticky note implementation that demonstrates the use of
nested editors.

> Quotes are supported

CSS is provided by the Tailwind extension which has default styles for most built-in
nodes.

:bear:

See more:

- [lexical.dev](https://lexical.dev/)
- [lexical-builder.pages.dev](https://lexical-builder.pages.dev/)
- [svelte.dev](https://svelte.dev/)

Checklist:

- [ ] Read the docs
- [ ] Build an app
`.trim();

// TODO - The markdown transformers are not a very good abstraction for this
const NO_MATCH_REGEX = /^(?!)/;
const EmojiShortcodeTransformer: TextMatchTransformer = {
  dependencies: [EmojiNode],
  export: (node) => ($isEmojiNode(node) ? (node.getShortcode() ?? null) : null),
  importRegExp: NO_MATCH_REGEX,
  regExp: NO_MATCH_REGEX,
  replace: () => {
    throw Error("should never be called");
  },
  trigger: "",
  type: "text-match",
};

export function buildEditor(): LexicalEditorWithDispose {
  return buildEditorFromExtensions({
    name: "[root]",
    // We are doing this elsewhere for SSR reasons
    $initialEditorState: null,
    dependencies: [
      RichTextExtension,
      configExtension(MarkdownTransformersExtension, {
        textMatchTransformers: [
          ...(MarkdownTransformersExtension.config?.textMatchTransformers ?? []),
          EmojiShortcodeTransformer,
        ],
      }),
      MarkdownShortcutsExtension,
      TailwindExtension,
      HistoryExtension,
      AutoLinkExtension,
      ClickableLinkExtension,
      CheckListExtension,
      SlackPasteExtension,
      EmojiExtension,
      StickyExtension,
      TableExtension,
    ],
  });
}
