/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import "./styles.css";

import {
  buildEditorFromPlans,
  configPlan,
  DragonPlan,
  HistoryPlan,
  RichTextPlan,
} from "@etrepum/lexical-builder";
import {
  mountReactPluginComponent,
  mountReactPluginHost,
  ReactPluginHostPlan,
} from "@etrepum/lexical-react-plan";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { LexicalEditor } from "lexical";

import { $prepopulatedRichText } from "./$prepopulatedRichText";
import { EmojiPlan } from "@etrepum/lexical-emoji-plan";

const editorHandle = buildEditorFromPlans({
  $initialEditorState: $prepopulatedRichText,
  dependencies: [
    DragonPlan,
    RichTextPlan,
    HistoryPlan,
    configPlan(EmojiPlan, {
      emojiClass: "emoji-node",
      emojiLoadedClass: "emoji-node-loaded",
      emojiBaseUrl: "/assets/emoji",
    }),
    ReactPluginHostPlan,
  ],
  namespace: "Vanilla JS Plan Demo",
  register: (editor: LexicalEditor) => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    mountReactPluginHost(editor, el);
    mountReactPluginComponent(editor, {
      Component: TreeView,
      domNode: document.getElementById("lexical-state")!,
      key: "tree-view",
      props: {
        editor,
        timeTravelButtonClassName: "debug-timetravel-button",
        timeTravelPanelButtonClassName: "debug-timetravel-panel-button",
        timeTravelPanelClassName: "debug-timetravel-panel",
        timeTravelPanelSliderClassName: "debug-timetravel-panel-slider",
        treeTypeButtonClassName: "debug-treetype-button",
        viewClassName: "tree-view-output",
      },
    });
    return () => {
      el.remove();
    };
  },
});
editorHandle.editor.setRootElement(document.getElementById("lexical-editor"));
