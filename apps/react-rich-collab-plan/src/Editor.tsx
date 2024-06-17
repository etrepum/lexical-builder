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
  UsePlanComponent,
} from "@etrepum/lexical-react-plan";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

import { ToolbarPlan } from "./plugins/ToolbarPlugin";

function EditorChildrenComponent({
  contentEditable,
  placeholder,
  children,
}: EditorChildrenComponentProps) {
  return (
    <div className="editor-container">
      <UsePlanComponent lexical:plan={ToolbarPlan} />
      <div className="editor-inner">
        {contentEditable}
        {placeholder}
        <UsePlanComponent lexical:plan={TreeViewPlan} />
      </div>
      {children}
    </div>
  );
}

export const EditorPlan = definePlan({
  dependencies: [
    DragonPlan,
    RichTextPlan,
    ToolbarPlan,
    configPlan(ReactPlan, {
      EditorChildrenComponent,
      contentEditable: <ContentEditable className="editor-input" />,
      placeholder: (
        <div className="editor-placeholder">Enter some rich text...</div>
      ),
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
