/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
/* eslint-disable prefer-named-capture-group -- meta style */
/* eslint-disable no-labels -- meta style */

import type { CodeNode } from "@lexical/code";
import type {
  ElementTransformer,
  TextFormatTransformer,
  TextMatchTransformer,
} from "@lexical/markdown";
import {
  type TextNode,
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $isElementNode,
  $isParagraphNode,
  type ElementNode,
} from "lexical";
import { $createCodeNode } from "@lexical/code";
import { $isListItemNode, $isListNode, type ListItemNode } from "@lexical/list";
import { $isQuoteNode } from "@lexical/rich-text";
import {
  $findMatchingParent,
  IS_APPLE_WEBKIT,
  IS_IOS,
  IS_SAFARI,
} from "@lexical/utils";
import { $isEmptyParagraph, PUNCTUATION_OR_SPACE } from "./utils";
import invariant from "./shared/invariant";
import {
  type MarkdownTransformerOptions,
  type TransformersByType,
} from "./types";

const CODE_BLOCK_REG_EXP = /^[ \t]*```(\w{1,10})?\s?$/;
type TextFormatTransformersIndex = Readonly<{
  fullMatchRegExpByTag: Readonly<Record<string, RegExp>>;
  openTagsRegExp: RegExp;
  transformersByTag: Readonly<Record<string, TextFormatTransformer>>;
}>;

/**
 * Creates an array of ElementNode from the given markdown string
 */
export function createMarkdownImport(
  byType: TransformersByType,
  defaultOptions: MarkdownTransformerOptions,
): (
  markdownString: string,
  options?: MarkdownTransformerOptions,
) => ElementNode[] {
  const textFormatTransformersIndex = createTextFormatTransformersIndex(
    byType.textFormat,
  );

  return function $markdownImport(
    markdownString,
    { shouldPreserveNewlines } = defaultOptions,
  ) {
    const lines = markdownString.split("\n");
    const linesLength = lines.length;
    // This node is never attached to the document
    const root = $createParagraphNode();

    for (let i = 0; i < linesLength; i++) {
      const lineText = lines[i]!;
      // Codeblocks are processed first as anything inside such block
      // is ignored for further processing
      // TODO:
      // Abstract it to be dynamic as other transformers (add multiline match option)
      const [codeBlockNode, shiftedIndex] = $importCodeBlock(lines, i, root);

      if (codeBlockNode != null) {
        i = shiftedIndex;
        continue;
      }

      $importBlocks(
        lineText,
        root,
        byType.element,
        textFormatTransformersIndex,
        byType.textMatch,
      );
    }

    // By default, removing empty paragraphs as md does not really
    // allow empty lines and uses them as delimiter.
    // If you need empty lines set shouldPreserveNewlines = true.
    const blocks: ElementNode[] = [];
    for (
      let child = root.getFirstChild();
      child;
      child = child.getNextSibling()
    ) {
      invariant(
        $isElementNode(child),
        "markdownImport: Expected child of type %s to be an ElementNode",
        child.getType(),
      );
      if (shouldPreserveNewlines || !$isEmptyParagraph(child)) {
        blocks.push(child);
      }
    }
    // make GC a bit easier
    root.clear();
    return blocks;
  };
}

function $importBlocks(
  lineText: string,
  rootNode: ElementNode,
  elementTransformers: ElementTransformer[],
  textFormatTransformersIndex: TextFormatTransformersIndex,
  textMatchTransformers: TextMatchTransformer[],
) {
  const lineTextTrimmed = lineText.trim();
  const textNode = $createTextNode(lineTextTrimmed);
  const elementNode = $createParagraphNode();
  elementNode.append(textNode);
  rootNode.append(elementNode);

  for (const { regExp, replace } of elementTransformers) {
    const match = lineText.match(regExp);

    if (match) {
      textNode.setTextContent(lineText.slice(match[0].length));
      replace(elementNode, [textNode], match, true);
      break;
    }
  }

  importTextFormatTransformers(
    textNode,
    textFormatTransformersIndex,
    textMatchTransformers,
  );

  // If no transformer was found and we are left with the original paragraph node
  // we can check if its content can be appended to the previous node
  // if it's a paragraph, quote or list
  if (elementNode.isAttached() && lineTextTrimmed.length > 0) {
    const previousNode = elementNode.getPreviousSibling();
    if (
      $isParagraphNode(previousNode) ||
      $isQuoteNode(previousNode) ||
      $isListNode(previousNode)
    ) {
      let targetNode: typeof previousNode | ListItemNode | null = previousNode;

      if ($isListNode(previousNode)) {
        const lastDescendant = previousNode.getLastDescendant();
        if (lastDescendant == null) {
          targetNode = null;
        } else {
          targetNode = $findMatchingParent(lastDescendant, $isListItemNode);
        }
      }

      if (targetNode != null && targetNode.getTextContentSize() > 0) {
        targetNode.splice(targetNode.getChildrenSize(), 0, [
          $createLineBreakNode(),
          ...elementNode.getChildren(),
        ]);
        elementNode.remove();
      }
    }
  }
}

function $importCodeBlock(
  lines: string[],
  startLineIndex: number,
  rootNode: ElementNode,
): [CodeNode | null, number] {
  const openMatch = CODE_BLOCK_REG_EXP.exec(lines[startLineIndex]!);

  if (openMatch) {
    let endLineIndex = startLineIndex;
    const linesLength = lines.length;

    while (++endLineIndex < linesLength) {
      const closeMatch = CODE_BLOCK_REG_EXP.exec(lines[endLineIndex]!);

      if (closeMatch) {
        const codeBlockNode = $createCodeNode(openMatch[1]);
        const textNode = $createTextNode(
          lines.slice(startLineIndex + 1, endLineIndex).join("\n"),
        );
        codeBlockNode.append(textNode);
        rootNode.append(codeBlockNode);
        return [codeBlockNode, endLineIndex];
      }
    }
  }

  return [null, startLineIndex];
}

// Processing text content and replaces text format tags.
// It takes outermost tag match and its content, creates text node with
// format based on tag and then recursively executed over node's content
//
// E.g. for "*Hello **world**!*" string it will create text node with
// "Hello **world**!" content and italic format and run recursively over
// its content to transform "**world**" part
function importTextFormatTransformers(
  textNode: TextNode,
  textFormatTransformersIndex: TextFormatTransformersIndex,
  textMatchTransformers: TextMatchTransformer[],
) {
  const textContent = textNode.getTextContent();
  const match = findOutermostMatch(textContent, textFormatTransformersIndex);

  if (!match) {
    // Once text format processing is done run text match transformers, as it
    // only can span within single text node (unline formats that can cover multiple nodes)
    importTextMatchTransformers(textNode, textMatchTransformers);
    return;
  }
  invariant(
    match[1] !== undefined && match[2] !== undefined,
    "importTextMatchTransformers: expecting match with two groups",
  );

  let currentNode, remainderNode, leadingNode;

  // If matching full content there's no need to run splitText and can reuse existing textNode
  // to update its content and apply format. E.g. for **_Hello_** string after applying bold
  // format (**) it will reuse the same text node to apply italic (_)
  if (match[0] === textContent) {
    currentNode = textNode;
  } else {
    const startIndex = match.index || 0;
    const endIndex = startIndex + match[0].length;

    if (startIndex === 0) {
      [currentNode, remainderNode] = textNode.splitText(endIndex);
    } else {
      [leadingNode, currentNode, remainderNode] = textNode.splitText(
        startIndex,
        endIndex,
      );
    }
  }

  invariant(
    currentNode !== undefined,
    "importTextMatchTransformers: currentNode must be defined",
  );
  currentNode.setTextContent(match[2]);
  const transformer = textFormatTransformersIndex.transformersByTag[match[1]];

  if (transformer) {
    for (const format of transformer.format) {
      if (!currentNode.hasFormat(format)) {
        currentNode.toggleFormat(format);
      }
    }
  }

  // Recursively run over inner text if it's not inline code
  if (!currentNode.hasFormat("code")) {
    importTextFormatTransformers(
      currentNode,
      textFormatTransformersIndex,
      textMatchTransformers,
    );
  }

  // Run over leading/remaining text if any
  if (leadingNode) {
    importTextFormatTransformers(
      leadingNode,
      textFormatTransformersIndex,
      textMatchTransformers,
    );
  }

  if (remainderNode) {
    importTextFormatTransformers(
      remainderNode,
      textFormatTransformersIndex,
      textMatchTransformers,
    );
  }
}

function importTextMatchTransformers(
  textNode_: TextNode,
  textMatchTransformers: TextMatchTransformer[],
) {
  let textNode: TextNode | undefined = textNode_;

  mainLoop: while (textNode) {
    const textContent = textNode.getTextContent();
    for (const transformer of textMatchTransformers) {
      const match =
        transformer.importRegExp && textContent.match(transformer.importRegExp);

      if (!match) {
        continue;
      }

      const startIndex = match.index || 0;
      const endIndex = startIndex + match[0].length;
      let replaceNode: TextNode, newTextNode: TextNode | undefined;
      if (startIndex === 0) {
        const splitText = textNode.splitText(endIndex);
        invariant(
          splitText[0] !== undefined,
          "importTextMatchTransformers: splitText expected at least one node",
        );
        [replaceNode, textNode] = splitText;
      } else {
        const splitText = textNode.splitText(startIndex, endIndex);
        invariant(
          splitText[1] !== undefined,
          "importTextMatchTransformers: splitText expected at least two nodes",
        );
        [, replaceNode, newTextNode] = splitText;
        if (newTextNode) {
          importTextMatchTransformers(newTextNode, textMatchTransformers);
        }
      }

      transformer.replace?.(replaceNode, match);
      continue mainLoop;
    }

    break;
  }
}

// Finds first "<tag>content<tag>" match that is not nested into another tag
function findOutermostMatch(
  textContent: string,
  textTransformersIndex: TextFormatTransformersIndex,
): RegExpMatchArray | null {
  const openTagsMatch = textContent.match(textTransformersIndex.openTagsRegExp);

  if (openTagsMatch == null) {
    return null;
  }

  for (const match of openTagsMatch) {
    // Open tags reg exp might capture leading space so removing it
    // before using match to find transformer
    const tag = match.replace(/^\s/, "");
    const fullMatchRegExp = textTransformersIndex.fullMatchRegExpByTag[tag];
    if (fullMatchRegExp == null) {
      continue;
    }

    const fullMatch = textContent.match(fullMatchRegExp);
    const transformer = textTransformersIndex.transformersByTag[tag];
    if (fullMatch != null && transformer != null) {
      if (transformer.intraword !== false) {
        return fullMatch;
      }

      // For non-intraword transformers checking if it's within a word
      // or surrounded with space/punctuation/newline
      const { index = 0 } = fullMatch;
      const beforeChar = textContent[index - 1];
      const afterChar = textContent[index + fullMatch[0].length];

      if (
        (!beforeChar || PUNCTUATION_OR_SPACE.test(beforeChar)) &&
        (!afterChar || PUNCTUATION_OR_SPACE.test(afterChar))
      ) {
        return fullMatch;
      }
    }
  }

  return null;
}

function createTextFormatTransformersIndex(
  textTransformers: TextFormatTransformer[],
): TextFormatTransformersIndex {
  const transformersByTag: Record<string, TextFormatTransformer> = {};
  const fullMatchRegExpByTag: Record<string, RegExp> = {};
  const openTagsRegExp = [];
  const escapeRegExp = `(?<![\\\\])`;

  for (const transformer of textTransformers) {
    const { tag } = transformer;
    transformersByTag[tag] = transformer;
    const tagRegExp = tag.replace(/(\*|\^|\+)/g, "\\$1");
    openTagsRegExp.push(tagRegExp);

    if (IS_SAFARI || IS_IOS || IS_APPLE_WEBKIT) {
      fullMatchRegExpByTag[tag] = new RegExp(
        `(${tagRegExp})(?![${tagRegExp}\\s])(.*?[^${tagRegExp}\\s])${tagRegExp}(?!${tagRegExp})`,
      );
    } else {
      fullMatchRegExpByTag[tag] = new RegExp(
        `(?<![\\\\${tagRegExp}])(${tagRegExp})((\\\\${tagRegExp})?.*?[^${tagRegExp}\\s](\\\\${tagRegExp})?)((?<!\\\\)|(?<=\\\\\\\\))(${tagRegExp})(?![\\\\${tagRegExp}])`,
      );
    }
  }

  return {
    // Reg exp to find open tag + content + close tag
    fullMatchRegExpByTag,
    // Reg exp to find opening tags
    openTagsRegExp: new RegExp(
      `${
        IS_SAFARI || IS_IOS || IS_APPLE_WEBKIT ? "" : escapeRegExp
      }(${openTagsRegExp.join("|")})`,
      "g",
    ),
    transformersByTag,
  };
}
