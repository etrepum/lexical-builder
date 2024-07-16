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
  children,
}: EditorChildrenComponentProps) {
  return (
    <div className="editor-container">
      <UsePlanComponent lexical:plan={ToolbarPlan} />
      <div className="editor-inner">
        {contentEditable}
        <UsePlanComponent lexical:plan={TreeViewPlan} />
      </div>
      {children}
    </div>
  );
}

const placeholderText = "Enter some rich text...";
const contentEditable = (
  <ContentEditable
    className="editor-input"
    aria-placeholder={placeholderText}
    placeholder={<div className="editor-placeholder">{placeholderText}</div>}
  />
);

export const EditorPlan = definePlan({
  dependencies: [
    RichTextPlan,
    ToolbarPlan,
    configPlan(ReactPlan, {
      EditorChildrenComponent,
      contentEditable,
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
