import {
  buildEditorFromPlans,
  definePlan,
  provideOutput,
  RichTextPlan,
  SharedHistoryPlan,
} from "@etrepum/lexical-builder";
import { type LexicalEditor } from "lexical";
import { registerSvelteDecorator } from "../registerSvelteDecorator.svelte";
import { StickyNode } from "./StickyNode";
import StickyComponent from "./StickyComponent.svelte";

export interface StickyOutput {
  $createCaptionEditor: () => LexicalEditor;
}

export const StickyPlan = definePlan({
  name: "Sticky",
  nodes: [StickyNode],
  register: (editor) =>
    provideOutput<StickyOutput>(
      {
        $createCaptionEditor: () =>
          buildEditorFromPlans({
            name: "Sticky/NestedSticky",
            parentEditor: editor,
            dependencies: [RichTextPlan, SharedHistoryPlan],
          }),
      },
      registerSvelteDecorator(editor, StickyNode, StickyComponent),
    ),
});
