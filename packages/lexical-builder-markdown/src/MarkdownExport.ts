/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
/* eslint-disable no-labels -- meta style */

import type {
  ElementTransformer,
  TextFormatTransformer,
  TextMatchTransformer,
} from "@lexical/markdown";
import type {
  ElementNode,
  LexicalNode,
  TextFormatType,
  TextNode,
} from "lexical";
import {
  $getRoot,
  $isDecoratorNode,
  $isElementNode,
  $isLineBreakNode,
  $isRootOrShadowRoot,
  $isTextNode,
} from "lexical";
import { $isEmptyParagraph } from "./utils";
import invariant from "./shared/invariant";
import type { MarkdownTransformerOptions, TransformersByType } from "./types";

/**
 * Renders string from markdown. The selection is moved to the start after the operation.
 */
export function createMarkdownExport(
  byType: TransformersByType,
  { shouldPreserveNewlines }: MarkdownTransformerOptions,
): (node?: ElementNode) => string {
  const isNewlineDelimited = !shouldPreserveNewlines;

  // Export only uses text formats that are responsible for single format
  // e.g. it will filter out *** (bold, italic) and instead use separate ** and *
  const textFormatTransformers = byType.textFormat.filter(
    (transformer) => transformer.format.length === 1,
  );

  return function $markdownExport(node = $getRoot()) {
    const output = [];
    const children = $isRootOrShadowRoot(node) ? node.getChildren() : [node];

    for (let i = 0; i < children.length; i++) {
      const child = children[i]!;
      const result = exportTopLevelElements(
        child,
        byType.element,
        textFormatTransformers,
        byType.textMatch,
      );

      if (result != null) {
        output.push(
          // separate consecutive group of texts with a line break: eg. ["hello", "world"] -> ["hello", "\nworld"]
          isNewlineDelimited &&
            i > 0 &&
            !$isEmptyParagraph(child) &&
            !$isEmptyParagraph(children[i - 1])
            ? "\n".concat(result)
            : result,
        );
      }
    }
    // Ensure consecutive groups of texts are at least \n\n apart while each empty paragraph renders as a newline.
    // Eg. ["hello", "", "", "hi", "\nworld"] -> "hello\n\n\nhi\n\nworld"
    return output.join("\n");
  };
}

function exportTopLevelElements(
  node: LexicalNode,
  elementTransformers: ElementTransformer[],
  textTransformersIndex: TextFormatTransformer[],
  textMatchTransformers: TextMatchTransformer[],
): string | null {
  for (const transformer of elementTransformers) {
    const result = transformer.export(node, (_node) =>
      exportChildren(_node, textTransformersIndex, textMatchTransformers),
    );

    if (result != null) {
      return result;
    }
  }

  if ($isElementNode(node)) {
    return exportChildren(node, textTransformersIndex, textMatchTransformers);
  } else if ($isDecoratorNode(node)) {
    return node.getTextContent();
  }
  return null;
}

function exportChildren(
  node: ElementNode,
  textTransformersIndex: TextFormatTransformer[],
  textMatchTransformers: TextMatchTransformer[],
): string {
  const output = [];
  const children = node.getChildren();

  mainLoop: for (const child of children) {
    for (const transformer of textMatchTransformers) {
      const result = transformer.export?.(
        child,
        (parentNode) =>
          exportChildren(
            parentNode,
            textTransformersIndex,
            textMatchTransformers,
          ),
        (textNode, textContent) =>
          exportTextFormat(textNode, textContent, textTransformersIndex),
      );

      if (result != null) {
        output.push(result);
        continue mainLoop;
      }
    }

    if ($isLineBreakNode(child)) {
      output.push("\n");
    } else if ($isTextNode(child)) {
      output.push(
        exportTextFormat(child, child.getTextContent(), textTransformersIndex),
      );
    } else if ($isElementNode(child)) {
      // empty paragraph returns ""
      output.push(
        exportChildren(child, textTransformersIndex, textMatchTransformers),
      );
    } else if ($isDecoratorNode(child)) {
      output.push(child.getTextContent());
    }
  }

  return output.join("");
}

function exportTextFormat(
  node: TextNode,
  textContent: string,
  textTransformers: TextFormatTransformer[],
): string {
  // This function handles the case of a string looking like this: "   foo   "
  // Where it would be invalid markdown to generate: "**   foo   **"
  // We instead want to trim the whitespace out, apply formatting, and then
  // bring the whitespace back. So our returned string looks like this: "   **foo**   "
  const frozenString = textContent.trim();
  let output = frozenString;

  const applied = new Set();

  for (const transformer of textTransformers) {
    const format = transformer.format[0];
    const tag = transformer.tag;
    invariant(
      format !== undefined,
      "TextFormatTransformer for tag %s has empty format array",
      tag,
    );

    if (hasFormat(node, format) && !applied.has(format)) {
      // Multiple tags might be used for the same format (*, _)
      applied.add(format);
      // Prevent adding opening tag is already opened by the previous sibling
      const previousNode = getTextSibling(node, true);

      if (!hasFormat(previousNode, format)) {
        output = tag + output;
      }

      // Prevent adding closing tag if next sibling will do it
      const nextNode = getTextSibling(node, false);

      if (!hasFormat(nextNode, format)) {
        output += tag;
      }
    }
  }

  // Replace trimmed version of textContent ensuring surrounding whitespace is not modified
  return textContent.replace(frozenString, () => output);
}

// Get next or previous text sibling a text node, including cases
// when it's a child of inline element (e.g. link)
function getTextSibling(node: TextNode, backward: boolean): TextNode | null {
  let sibling = backward ? node.getPreviousSibling() : node.getNextSibling();

  if (!sibling) {
    const parent = node.getParentOrThrow();

    if (parent.isInline()) {
      sibling = backward
        ? parent.getPreviousSibling()
        : parent.getNextSibling();
    }
  }

  while (sibling) {
    if ($isElementNode(sibling)) {
      if (!sibling.isInline()) {
        break;
      }

      const descendant = backward
        ? sibling.getLastDescendant()
        : sibling.getFirstDescendant();

      if ($isTextNode(descendant)) {
        return descendant;
      }
      sibling = backward
        ? sibling.getPreviousSibling()
        : sibling.getNextSibling();
    }

    if ($isTextNode(sibling)) {
      return sibling;
    }

    if (!$isElementNode(sibling)) {
      return null;
    }
  }

  return null;
}

function hasFormat(
  node: LexicalNode | null | undefined,
  format: TextFormatType,
): boolean {
  return $isTextNode(node) && node.hasFormat(format);
}
