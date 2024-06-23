/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { definePlan, safeCast } from "@etrepum/lexical-builder-core";

import {
  $createParagraphNode,
  $getRoot,
  LineBreakNode,
  ParagraphNode,
  RootNode,
  TabNode,
  TextNode,
  type LexicalEditor,
  type EditorSetOptions,
  // TODO https://github.com/facebook/lexical/pull/6332
  // type EditorUpdateOptions
} from "lexical";

// TODO https://github.com/facebook/lexical/pull/6332
type EditorUpdateOptions = NonNullable<Parameters<LexicalEditor["update"]>[1]>;
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

export const InitialStatePlan = definePlan({
  name: "@etrepum/lexical-builder/InitialState",
  // These are automatically added by createEditor, we add them here so they are
  // visible during planRep.init so plans can see all known types before the
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
        editor.update(() => $initialEditorState(editor), updateOptions);
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
    }
    return () => {};
  },
});
