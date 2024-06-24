/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $isParagraphNode,
  $isTextNode,
  type ParagraphNode,
  type Spread,
  type LexicalNode,
  $getSelection,
  $setSelection,
} from "lexical";

export function indexBy<T>(
  list: Array<T>,
  callback: (arg0: T) => string,
): Readonly<Record<string, Array<T>>> {
  const index: Record<string, Array<T>> = {};

  for (const item of list) {
    const key = callback(item);

    if (index[key]) {
      index[key]!.push(item);
    } else {
      index[key] = [item];
    }
  }

  return index;
}

export const PUNCTUATION_OR_SPACE = /[!-/:-@[-`{-~\s]/;

const MARKDOWN_EMPTY_LINE_REG_EXP = /^\s{0,3}$/;

const EmptyParagraphNodeBrand: unique symbol = Symbol.for(
  "@lexical/NestedListNodeBrand",
);

export function $isEmptyParagraph(
  node: LexicalNode | undefined | null,
): node is Spread<{ [EmptyParagraphNodeBrand]: never }, ParagraphNode> {
  if (!$isParagraphNode(node)) {
    return false;
  }

  const firstChild = node.getFirstChild();
  return (
    firstChild == null ||
    (node.getChildrenSize() === 1 &&
      $isTextNode(firstChild) &&
      MARKDOWN_EMPTY_LINE_REG_EXP.test(firstChild.getTextContent()))
  );
}

/**
 * Run a update function but make sure it does not change the selection.
 * This is useful for when you know that the selection should not change,
 * the update will not change any content under the selection, but the
 * update you're running includes selection modifications that you do not
 * want.
 *
 * This is useful because the existing @lexical/markdown importers
 * mangle the selection because of legacy mistakes.
 */
export function $wrapWithIgnoreSelection<Parameters extends any[], Returns>(
  $update: (...args: Parameters) => Returns,
): (...args: Parameters) => Returns {
  return function wrappedWithIgnoreSelection(...args) {
    const prevSelection = $getSelection();
    // We clone the selection because it could be mutated in-place
    const savedSelection = prevSelection ? prevSelection.clone() : null;
    const rval = $update(...args);
    const nextSelection = $getSelection();
    // If it was not mutated in-place we restore it. If we had access to
    // getActiveEditorState we could avoid using the clone and marking it
    // as dirty
    const restoredSelection =
      savedSelection &&
      savedSelection.is(prevSelection) &&
      !Object.isFrozen(prevSelection)
        ? prevSelection
        : savedSelection;
    if (nextSelection !== restoredSelection) {
      $setSelection(restoredSelection);
    }
    return rval;
  };
}
