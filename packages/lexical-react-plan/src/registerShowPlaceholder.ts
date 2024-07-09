/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { LexicalEditor } from "lexical";
import { $canShowPlaceholderCurry } from "@lexical/text";
import { mergeRegister } from "@lexical/utils";
import {
  type RegisterLexicalSubscription,
  registerLexicalSubscription,
} from "./registerSubscription";

function canShowPlaceholderFromCurrentEditorState(
  editor: LexicalEditor,
): boolean {
  const currentCanShowPlaceholder = editor
    .getEditorState()
    .read($canShowPlaceholderCurry(editor.isComposing()));

  return currentCanShowPlaceholder;
}

function subscribe(
  editor: LexicalEditor,
  onChange: (canShow: boolean) => void,
) {
  const resetCanShowPlaceholder = () => {
    onChange(canShowPlaceholderFromCurrentEditorState(editor));
  };
  return mergeRegister(
    editor.registerUpdateListener(resetCanShowPlaceholder),
    editor.registerEditableListener(resetCanShowPlaceholder),
  );
}

export const canShowPlaceholder: RegisterLexicalSubscription<boolean> = {
  initialValueFn: canShowPlaceholderFromCurrentEditorState,
  subscribe,
};

export function registerCanShowPlaceholder(
  editor: LexicalEditor,
  onChange: (canShow: boolean) => void,
): () => void {
  return registerLexicalSubscription(editor, canShowPlaceholder, onChange);
}
