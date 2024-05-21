/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalEditor} from 'lexical';

export interface RegisterLexicalSubscription<T> {
  initialValueFn: (editor: LexicalEditor) => T;
  subscribe: (
    editor: LexicalEditor,
    onChange: (value: T) => void,
  ) => () => void;
}

/**
 * Shortcut to Lexical subscriptions when values are used for render.
 */
export function registerLexicalSubscription<T>(
  editor: LexicalEditor,
  subscription: RegisterLexicalSubscription<T>,
  onChange: (value: T) => void,
): () => void {
  let initialized = false;
  const cleanup = subscription.subscribe(editor, (v) => {
    initialized = true;
    onChange(v);
  });
  if (!initialized) {
    onChange(subscription.initialValueFn(editor));
  }
  return cleanup;
}
