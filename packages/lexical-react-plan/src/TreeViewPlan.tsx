import { definePlan, safeCast } from "@etrepum/lexical-builder";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { usePlanConfig } from "./usePlanComponent";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ReactPlan } from "./ReactPlan";

export type TreeViewConfig = Omit<Parameters<typeof TreeView>[0], "editor">;
export function TreeViewPlanComponent(
  props: Partial<TreeViewConfig>,
): JSX.Element {
  const { Component: _Component, ...configProps } = usePlanConfig(TreeViewPlan);
  const [editor] = useLexicalComposerContext();
  return <TreeView editor={editor} {...configProps} {...props} />;
}

export const TreeViewPlan = definePlan({
  name: "@etrepum/lexical-builder/TreeView",
  dependencies: [ReactPlan],
  config: safeCast<
    TreeViewConfig & { Component: typeof TreeViewPlanComponent }
  >({
    Component: TreeViewPlanComponent,
    viewClassName: "tree-view-output",
    treeTypeButtonClassName: "debug-treetype-button",
    timeTravelPanelClassName: "debug-timetravel-panel",
    timeTravelButtonClassName: "debug-timetravel-button",
    timeTravelPanelSliderClassName: "debug-timetravel-panel-slider",
    timeTravelPanelButtonClassName: "debug-timetravel-panel-button",
  }),
});
