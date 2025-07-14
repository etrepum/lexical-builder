import { defineExtension, provideOutput } from "@etrepum/lexical-builder";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useExtensionDependency } from "./useExtensionComponent";
import { ReactExtension } from "./ReactExtension";

export type TreeViewConfig = Omit<Parameters<typeof TreeView>[0], "editor">;
export function TreeViewExtensionComponent(
  props: Partial<TreeViewConfig>,
): JSX.Element {
  const [editor] = useLexicalComposerContext();
  return (
    <TreeView
      editor={editor}
      {...useExtensionDependency(TreeViewExtension).config}
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

export const TreeViewExtension = defineExtension({
  name: "@etrepum/lexical-builder/TreeView",
  dependencies: [ReactExtension],
  config,
  register: () => provideOutput({ Component: TreeViewExtensionComponent }),
});
