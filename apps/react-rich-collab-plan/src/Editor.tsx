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
  type EditorChildrenComponentProps,
  ReactPlan,
  RichTextPlan,
  DragonPlan,
} from "@etrepum/lexical-builder";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

function EditorChildrenComponent({
  contentEditable,
  placeholder,
  children,
}: EditorChildrenComponentProps) {
  return (
    <div className="editor-container">
      <ToolbarPlugin />
      <div className="editor-inner">
        {contentEditable}
        {placeholder}
        <TreeViewPlugin />
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
    AutoFocusPlan,
  ],
  name: "@lexical/examples/react-rich-collab-plan/Editor",
});
