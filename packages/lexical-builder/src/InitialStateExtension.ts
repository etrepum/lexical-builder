/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { defineExtension, safeCast } from "@etrepum/lexical-builder-core";
import {
  $createParagraphNode,
  $getRoot,
  LineBreakNode,
  ParagraphNode,
  RootNode,
  TabNode,
  TextNode,
  type EditorSetOptions,
  type EditorUpdateOptions,
} from "lexical";

const HISTORY_MERGE_OPTIONS = { tag: "history-merge" };

function $defaultInitializer() {
  const root = $getRoot();
  if (root.isEmpty()) {
    root.append($createParagraphNode());
  }
}

export interface InitialStateConfig {
  updateOptions: EditorUpdateOptions;
  setOptions: EditorSetOptions;
}

export const InitialStateExtension = defineExtension({
  name: "@etrepum/lexical-builder/InitialState",
  // These are automatically added by createEditor, we add them here so they are
  // visible during extensionRep.init so extensions can see all known types before the
  // editor is created.
  // (excluding ArtificialNode__DO_NOT_USE because it isn't really public API
  // and shouldn't change anything)
  nodes: [RootNode, TextNode, LineBreakNode, TabNode, ParagraphNode],
  config: safeCast<InitialStateConfig>({
    updateOptions: HISTORY_MERGE_OPTIONS,
    setOptions: HISTORY_MERGE_OPTIONS,
  }),
  init({ $initialEditorState = $defaultInitializer }) {
    return $initialEditorState;
  },
  afterInitialization(editor, { updateOptions, setOptions }, state) {
    const $initialEditorState = state.getInitResult();
    switch (typeof $initialEditorState) {
      case "function": {
        editor.update(() => {
          $initialEditorState(editor);
        }, updateOptions);
        break;
      }
      case "string": {
        const parsedEditorState = editor.parseEditorState($initialEditorState);
        editor.setEditorState(parsedEditorState, setOptions);
        break;
      }
      case "object": {
        if ($initialEditorState) {
          editor.setEditorState($initialEditorState, setOptions);
        }
        break;
      }
      default: {
        /* noop */
      }
    }
    return () => {
      /* noop */
    };
  },
});
