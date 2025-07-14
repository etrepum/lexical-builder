import {
  buildEditorFromExtensions,
  defineExtension,
  provideOutput,
  RichTextExtension,
  SharedHistoryExtension,
} from "@etrepum/lexical-builder";
import { type LexicalEditor } from "lexical";
import { registerSvelteDecorator } from "../registerSvelteDecorator.svelte";
import { StickyNode } from "./StickyNode";
import StickyComponent from "./StickyComponent.svelte";

export interface StickyOutput {
  $createCaptionEditor: () => LexicalEditor;
}

export const StickyExtension = defineExtension({
  name: "Sticky",
  nodes: [StickyNode],
  register: (editor) =>
    provideOutput<StickyOutput>(
      {
        $createCaptionEditor: () =>
          buildEditorFromExtensions({
            name: "Sticky/NestedSticky",
            parentEditor: editor,
            dependencies: [RichTextExtension, SharedHistoryExtension],
          }),
      },
      registerSvelteDecorator(editor, StickyNode, StickyComponent),
    ),
});
