/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import "./styles.css";

import {
  buildEditorFromExtensions,
  configExtension,
  HistoryExtension,
  RichTextExtension,
} from "@etrepum/lexical-builder";
import {
  mountReactExtensionComponent,
  mountReactPluginComponent,
  mountReactPluginHost,
  ReactPluginHostExtension,
} from "@etrepum/lexical-react-extension";
import { TreeView } from "@lexical/react/LexicalTreeView";
import { type LexicalEditor } from "lexical";
import { EmojiExtension } from "@etrepum/lexical-emoji-extension";
import { BuilderGraphExtension } from "@etrepum/lexical-builder-devtools-core";
import { $prepopulatedRichText } from "./$prepopulatedRichText";

const vanillaEditor = buildEditorFromExtensions({
  name: "[root]",
  $initialEditorState: $prepopulatedRichText,
  dependencies: [
    RichTextExtension,
    HistoryExtension,
    configExtension(EmojiExtension, {
      emojiClass: "emoji-node",
      emojiLoadedClass: "emoji-node-loaded",
      emojiBaseUrl: "/assets/emoji",
    }),
    ReactPluginHostExtension,
    BuilderGraphExtension,
  ],
  namespace: "Vanilla JS Extension Demo",
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
    mountReactExtensionComponent(editor, {
      extension: BuilderGraphExtension,
      domNode: document.getElementById("lexical-builder-graph"),
      key: "builder",
      props: {},
    });
    return () => {
      el.remove();
    };
  },
});
vanillaEditor.setRootElement(document.getElementById("lexical-editor"));
