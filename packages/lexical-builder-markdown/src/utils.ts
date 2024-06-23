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
