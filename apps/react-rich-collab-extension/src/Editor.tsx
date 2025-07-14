/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  AutoFocusExtension,
  configExtension,
  defineExtension,
  RichTextExtension,
} from "@etrepum/lexical-builder";
import {
  type EditorChildrenComponentProps,
  ReactExtension,
  TreeViewExtension,
  UseExtensionComponent,
} from "@etrepum/lexical-react-extension";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { ToolbarExtension } from "./plugins/ToolbarPlugin";

function EditorChildrenComponent({
  contentEditable,
  children,
}: EditorChildrenComponentProps) {
  return (
    <div className="editor-container">
      <UseExtensionComponent lexical:extension={ToolbarExtension} />
      <div className="editor-inner">
        {contentEditable}
        <UseExtensionComponent lexical:extension={TreeViewExtension} />
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

export const EditorExtension = defineExtension({
  dependencies: [
    RichTextExtension,
    ToolbarExtension,
    configExtension(ReactExtension, {
      EditorChildrenComponent,
      contentEditable,
    }),
    configExtension(TreeViewExtension, {
      viewClassName: "tree-view-output",
      treeTypeButtonClassName: "debug-treetype-button",
      timeTravelPanelClassName: "debug-timetravel-panel",
      timeTravelButtonClassName: "debug-timetravel-button",
      timeTravelPanelSliderClassName: "debug-timetravel-panel-slider",
      timeTravelPanelButtonClassName: "debug-timetravel-panel-button",
    }),
    AutoFocusExtension,
  ],
  name: "@lexical/examples/react-rich-collab-extension/Editor",
});
