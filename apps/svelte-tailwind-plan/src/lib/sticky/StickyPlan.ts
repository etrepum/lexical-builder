import {
  declarePeerDependency,
  definePlan,
  type HistoryPlan,
} from "@etrepum/lexical-builder";
import "./StickyNode.css";
import { registerSvelteDecorator } from "../registerSvelteDecorator.svelte";
import { StickyNode } from "./StickyNode";
import StickyComponent from "./StickyComponent.svelte";

export const StickyPlan = definePlan({
  name: "Sticky",
  nodes: [StickyNode],
  peerDependencies: [
    declarePeerDependency<typeof HistoryPlan>(
      "@etrepum/lexical-builder/History",
    ),
  ],
  register: (editor) =>
    registerSvelteDecorator(editor, StickyNode, StickyComponent),
});
