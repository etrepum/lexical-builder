import { definePlan, provideOutput } from "@etrepum/lexical-builder";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { usePlanDependency } from "./usePlanComponent";
import { ReactPlan } from "./ReactPlan";

export type TreeViewConfig = Omit<Parameters<typeof TreeView>[0], "editor">;
export function TreeViewPlanComponent(
  props: Partial<TreeViewConfig>,
): JSX.Element {
  const [editor] = useLexicalComposerContext();
  return (
    <TreeView
      editor={editor}
      {...usePlanDependency(TreeViewPlan).config}
      {...props}
    />
  );
}

const config: TreeViewConfig = {
  viewClassName: "tree-view-output",
  treeTypeButtonClassName: "debug-treetype-button",
  timeTravelPanelClassName: "debug-timetravel-panel",
  timeTravelButtonClassName: "debug-timetravel-button",
  timeTravelPanelSliderClassName: "debug-timetravel-panel-slider",
  timeTravelPanelButtonClassName: "debug-timetravel-panel-button",
};

export const TreeViewPlan = definePlan({
  name: "@etrepum/lexical-builder/TreeView",
  dependencies: [ReactPlan],
  config,
  register: () => provideOutput({ Component: TreeViewPlanComponent }),
});
