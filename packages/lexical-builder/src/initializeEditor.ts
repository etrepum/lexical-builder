/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {InitialEditorStateType} from './types';

import {$createParagraphNode, $getRoot, type LexicalEditor} from 'lexical';

const HISTORY_MERGE_OPTIONS = {tag: 'history-merge'};

function $defaultInitializer() {
  const root = $getRoot();
  if (root.isEmpty()) {
    root.append($createParagraphNode());
  }
}

export function initializeEditor(
  editor: LexicalEditor,
  $initialEditorState: InitialEditorStateType = $defaultInitializer,
): void {
  switch (typeof $initialEditorState) {
    case 'function': {
      editor.update(() => $initialEditorState(editor), HISTORY_MERGE_OPTIONS);
      break;
    }
    case 'string': {
      const parsedEditorState = editor.parseEditorState($initialEditorState);
      editor.setEditorState(parsedEditorState, HISTORY_MERGE_OPTIONS);
      break;
    }
    case 'object': {
      if ($initialEditorState) {
        editor.setEditorState($initialEditorState, HISTORY_MERGE_OPTIONS);
      }
      break;
    }
  }
}
