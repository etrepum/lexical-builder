/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  AutoFocusPlan,
  configPlan,
  definePlan,
  RichTextPlan,
  DragonPlan,
} from "@etrepum/lexical-builder";
import {
  type EditorChildrenComponentProps,
  ReactPlan,
  TreeViewPlan,
  usePlanComponent,
} from "@etrepum/lexical-react-plan";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

import ToolbarPlugin from "./plugins/ToolbarPlugin";

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

function EditorChildrenComponent({
  contentEditable,
  placeholder,
  children,
}: EditorChildrenComponentProps) {
  const TreeView = usePlanComponent(TreeViewPlan);
  return (
    <div className="editor-container">
      <ToolbarPlugin />
      <div className="editor-inner">
        {contentEditable}
        {placeholder}
        <TreeView />
      </div>
      {children}
    </div>
  );
}

export const EditorPlan = definePlan({
  config: {},
  dependencies: [
    DragonPlan,
    RichTextPlan,
    configPlan(ReactPlan, {
      EditorChildrenComponent,
      contentEditable: <ContentEditable className="editor-input" />,
      placeholder: <Placeholder />,
    }),
    configPlan(TreeViewPlan, {
      viewClassName: "tree-view-output",
      treeTypeButtonClassName: "debug-treetype-button",
      timeTravelPanelClassName: "debug-timetravel-panel",
      timeTravelButtonClassName: "debug-timetravel-button",
      timeTravelPanelSliderClassName: "debug-timetravel-panel-slider",
      timeTravelPanelButtonClassName: "debug-timetravel-panel-button",
    }),
    AutoFocusPlan,
  ],
  name: "@lexical/examples/react-rich-collab-plan/Editor",
});
