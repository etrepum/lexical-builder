/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { AutoLinkAttributes } from "@lexical/link";
import type { ElementNode, LexicalNode } from "lexical";
import {
  $createAutoLinkNode,
  $isAutoLinkNode,
  $isLinkNode,
  AutoLinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";
import { mergeRegister } from "@lexical/utils";
import {
  $createTextNode,
  $getSelection,
  $isElementNode,
  $isLineBreakNode,
  $isNodeSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  TextNode,
} from "lexical";
import {
  defineExtension,
  disabledToggle,
  type DisabledToggleOutput,
  provideOutput,
  safeCast,
} from "@etrepum/lexical-builder";
import invariant from "./shared/invariant";
import { LinkExtension } from "./LinkExtension";

type ChangeHandler = (url: string | null, prevUrl: string | null) => void;

export interface LinkMatcherResult {
  attributes?: AutoLinkAttributes;
  index: number;
  length: number;
  text: string;
  url: string;
}

export type LinkMatcher = (text: string) => LinkMatcherResult | null;

export function createLinkMatcherWithRegExp(
  regExp: RegExp,
  urlTransformer: (text: string) => string = (text) => text,
) {
  return (text: string) => {
    const match = regExp.exec(text);
    if (match === null) {
      return null;
    }
    return {
      index: match.index,
      length: match[0].length,
      text: match[0],
      url: urlTransformer(match[0]),
    };
  };
}

function findFirstMatch(
  text: string,
  matchers: LinkMatcher[],
): LinkMatcherResult | null {
  for (const matcher of matchers) {
    const match = matcher(text);

    if (match) {
      return match;
    }
  }

  return null;
}

const PUNCTUATION_OR_SPACE = /[.,;\s]/;

function isSeparator(char: string): boolean {
  return PUNCTUATION_OR_SPACE.test(char);
}

function endsWithSeparator(textContent: string): boolean {
  return isSeparator(textContent[textContent.length - 1]!);
}

function startsWithSeparator(textContent: string): boolean {
  return isSeparator(textContent[0]!);
}

function startsWithFullStop(textContent: string): boolean {
  return /^\.[a-zA-Z0-9]{1,}/.test(textContent);
}

function isPreviousNodeValid(node: LexicalNode): boolean {
  let previousNode = node.getPreviousSibling();
  if ($isElementNode(previousNode)) {
    previousNode = previousNode.getLastDescendant();
  }
  return (
    previousNode === null ||
    $isLineBreakNode(previousNode) ||
    ($isTextNode(previousNode) &&
      endsWithSeparator(previousNode.getTextContent()))
  );
}

function isNextNodeValid(node: LexicalNode): boolean {
  let nextNode = node.getNextSibling();
  if ($isElementNode(nextNode)) {
    nextNode = nextNode.getFirstDescendant();
  }
  return (
    nextNode === null ||
    $isLineBreakNode(nextNode) ||
    ($isTextNode(nextNode) && startsWithSeparator(nextNode.getTextContent()))
  );
}

function isContentAroundIsValid(
  matchStart: number,
  matchEnd: number,
  text: string,
  nodes: TextNode[],
): boolean {
  const contentBeforeIsValid =
    matchStart > 0
      ? isSeparator(text[matchStart - 1]!)
      : isPreviousNodeValid(nodes[0]!);
  if (!contentBeforeIsValid) {
    return false;
  }

  const contentAfterIsValid =
    matchEnd < text.length
      ? isSeparator(text[matchEnd]!)
      : isNextNodeValid(nodes[nodes.length - 1]!);
  return contentAfterIsValid;
}

function extractMatchingNodes(
  nodes: TextNode[],
  startIndex: number,
  endIndex: number,
): [
  matchingOffset: number,
  unmodifiedBeforeNodes: TextNode[],
  matchingNodes: TextNode[],
  unmodifiedAfterNodes: TextNode[],
] {
  const unmodifiedBeforeNodes: TextNode[] = [];
  const matchingNodes: TextNode[] = [];
  const unmodifiedAfterNodes: TextNode[] = [];
  let matchingOffset = 0;

  let currentOffset = 0;
  const currentNodes = [...nodes];

  while (currentNodes.length > 0) {
    const currentNode = currentNodes[0]!;
    const currentNodeText = currentNode.getTextContent();
    const currentNodeLength = currentNodeText.length;
    const currentNodeStart = currentOffset;
    const currentNodeEnd = currentOffset + currentNodeLength;

    if (currentNodeEnd <= startIndex) {
      unmodifiedBeforeNodes.push(currentNode);
      matchingOffset += currentNodeLength;
    } else if (currentNodeStart >= endIndex) {
      unmodifiedAfterNodes.push(currentNode);
    } else {
      matchingNodes.push(currentNode);
    }
    currentOffset += currentNodeLength;
    currentNodes.shift();
  }
  return [
    matchingOffset,
    unmodifiedBeforeNodes,
    matchingNodes,
    unmodifiedAfterNodes,
  ];
}

function $createAutoLinkNode_(
  nodes: TextNode[],
  startIndex: number,
  endIndex: number,
  match: LinkMatcherResult,
): TextNode | undefined {
  const linkNode = $createAutoLinkNode(match.url, match.attributes);
  if (nodes.length === 1) {
    let remainingTextNode = nodes[0];
    let linkTextNode;
    invariant(
      remainingTextNode !== undefined,
      "$createAutoLinkNode_ remainingTextNode must be defined",
    );
    if (startIndex === 0) {
      [linkTextNode, remainingTextNode] = remainingTextNode.splitText(endIndex);
    } else {
      [, linkTextNode, remainingTextNode] = remainingTextNode.splitText(
        startIndex,
        endIndex,
      );
    }
    invariant(
      linkTextNode !== undefined,
      "$createAutoLinkNode_ linkTextNode must be defined",
    );
    const textNode = $createTextNode(match.text);
    textNode.setFormat(linkTextNode.getFormat());
    textNode.setDetail(linkTextNode.getDetail());
    textNode.setStyle(linkTextNode.getStyle());
    linkNode.append(textNode);
    linkTextNode.replace(linkNode);
    return remainingTextNode;
  } else if (nodes.length > 1) {
    const firstTextNode = nodes[0]!;
    let offset = firstTextNode.getTextContent().length;
    let firstLinkTextNode;
    if (startIndex === 0) {
      firstLinkTextNode = firstTextNode;
    } else {
      [, firstLinkTextNode] = firstTextNode.splitText(startIndex);
    }
    const linkNodes = [];
    let remainingTextNode;
    for (let i = 1; i < nodes.length; i++) {
      const currentNode = nodes[i]!;
      const currentNodeText = currentNode.getTextContent();
      const currentNodeLength = currentNodeText.length;
      const currentNodeStart = offset;
      const currentNodeEnd = offset + currentNodeLength;
      if (currentNodeStart < endIndex) {
        if (currentNodeEnd <= endIndex) {
          linkNodes.push(currentNode);
        } else {
          const [linkTextNode, endNode] = currentNode.splitText(
            endIndex - currentNodeStart,
          );
          invariant(
            linkTextNode !== undefined,
            "$createAutoLinkNode_ linkTextNode must be defined",
          );
          linkNodes.push(linkTextNode);
          remainingTextNode = endNode;
        }
      }
      offset += currentNodeLength;
    }
    const selection = $getSelection();
    const selectedTextNode = selection
      ? selection.getNodes().find($isTextNode)
      : undefined;
    invariant(
      firstLinkTextNode !== undefined,
      "$createAutoLinkNode_ firstLinkTextNode must be defined",
    );
    const textNode = $createTextNode(firstLinkTextNode.getTextContent());
    textNode.setFormat(firstLinkTextNode.getFormat());
    textNode.setDetail(firstLinkTextNode.getDetail());
    textNode.setStyle(firstLinkTextNode.getStyle());
    linkNode.append(textNode, ...linkNodes);
    // it does not preserve caret position if caret was at the first text node
    // so we need to restore caret position
    if (selectedTextNode && selectedTextNode === firstLinkTextNode) {
      if ($isRangeSelection(selection)) {
        textNode.select(selection.anchor.offset, selection.focus.offset);
      } else if ($isNodeSelection(selection)) {
        textNode.select(0, textNode.getTextContent().length);
      }
    }
    firstLinkTextNode.replace(linkNode);
    return remainingTextNode;
  }
  return undefined;
}

function $handleLinkCreation(
  nodes: TextNode[],
  matchers: LinkMatcher[],
  onChange: ChangeHandler,
): void {
  let currentNodes = [...nodes];
  const initialText = currentNodes
    .map((node) => node.getTextContent())
    .join("");
  let text = initialText;
  let match;
  let invalidMatchEnd = 0;

  while ((match = findFirstMatch(text, matchers))) {
    const matchStart = match.index;
    const matchLength = match.length;
    const matchEnd = matchStart + matchLength;
    const isValid = isContentAroundIsValid(
      invalidMatchEnd + matchStart,
      invalidMatchEnd + matchEnd,
      initialText,
      currentNodes,
    );

    if (isValid) {
      const [matchingOffset, , matchingNodes, unmodifiedAfterNodes] =
        extractMatchingNodes(
          currentNodes,
          invalidMatchEnd + matchStart,
          invalidMatchEnd + matchEnd,
        );

      const actualMatchStart = invalidMatchEnd + matchStart - matchingOffset;
      const actualMatchEnd = invalidMatchEnd + matchEnd - matchingOffset;
      const remainingTextNode = $createAutoLinkNode_(
        matchingNodes,
        actualMatchStart,
        actualMatchEnd,
        match,
      );
      currentNodes = remainingTextNode
        ? [remainingTextNode, ...unmodifiedAfterNodes]
        : unmodifiedAfterNodes;
      onChange(match.url, null);
      invalidMatchEnd = 0;
    } else {
      invalidMatchEnd += matchEnd;
    }

    text = text.substring(matchEnd);
  }
}

function handleLinkEdit(
  linkNode: AutoLinkNode,
  matchers: LinkMatcher[],
  onChange: ChangeHandler,
): void {
  // Check children are simple text
  const children = linkNode.getChildren();
  const childrenLength = children.length;
  for (let i = 0; i < childrenLength; i++) {
    const child = children[i];
    if (!$isTextNode(child) || !child.isSimpleText()) {
      replaceWithChildren(linkNode);
      onChange(null, linkNode.getURL());
      return;
    }
  }

  // Check text content fully matches
  const text = linkNode.getTextContent();
  const match = findFirstMatch(text, matchers);
  if (match === null || match.text !== text) {
    replaceWithChildren(linkNode);
    onChange(null, linkNode.getURL());
    return;
  }

  // Check neighbors
  if (!isPreviousNodeValid(linkNode) || !isNextNodeValid(linkNode)) {
    replaceWithChildren(linkNode);
    onChange(null, linkNode.getURL());
    return;
  }

  const url = linkNode.getURL();
  if (url !== match.url) {
    linkNode.setURL(match.url);
    onChange(match.url, url);
  }

  if (match.attributes) {
    const rel = linkNode.getRel();
    if (rel !== match.attributes.rel) {
      linkNode.setRel(match.attributes.rel || null);
      onChange(match.attributes.rel || null, rel);
    }

    const target = linkNode.getTarget();
    if (target !== match.attributes.target) {
      linkNode.setTarget(match.attributes.target || null);
      onChange(match.attributes.target || null, target);
    }
  }
}

// Bad neighbors are edits in neighbor nodes that make AutoLinks incompatible.
// Given the creation preconditions, these can only be simple text nodes.
function handleBadNeighbors(
  textNode: TextNode,
  matchers: LinkMatcher[],
  onChange: ChangeHandler,
): void {
  const previousSibling = textNode.getPreviousSibling();
  const nextSibling = textNode.getNextSibling();
  const text = textNode.getTextContent();

  if (
    $isAutoLinkNode(previousSibling) &&
    !previousSibling.getIsUnlinked() &&
    (!startsWithSeparator(text) || startsWithFullStop(text))
  ) {
    previousSibling.append(textNode);
    handleLinkEdit(previousSibling, matchers, onChange);
    onChange(null, previousSibling.getURL());
  }

  if (
    $isAutoLinkNode(nextSibling) &&
    !nextSibling.getIsUnlinked() &&
    !endsWithSeparator(text)
  ) {
    replaceWithChildren(nextSibling);
    handleLinkEdit(nextSibling, matchers, onChange);
    onChange(null, nextSibling.getURL());
  }
}

function replaceWithChildren(node: ElementNode): LexicalNode[] {
  const children = node.getChildren();
  const childrenLength = children.length;

  for (let j = childrenLength - 1; j >= 0; j--) {
    node.insertAfter(children[j]!);
  }

  node.remove();
  return children.map((child) => child.getLatest());
}

function getTextNodesToMatch(textNode: TextNode): TextNode[] {
  // check if next siblings are simple text nodes till a node contains a space separator
  const textNodesToMatch = [textNode];
  let nextSibling = textNode.getNextSibling();
  while (
    nextSibling !== null &&
    $isTextNode(nextSibling) &&
    nextSibling.isSimpleText()
  ) {
    textNodesToMatch.push(nextSibling);
    if (/[\s]/.test(nextSibling.getTextContent())) {
      break;
    }
    nextSibling = nextSibling.getNextSibling();
  }
  return textNodesToMatch;
}

export interface AutoLinkConfig {
  matchers: LinkMatcher[];
  onChange: ChangeHandler;
  disabled: boolean;
}

const URL_REGEX =
  // eslint-disable-next-line prefer-named-capture-group -- meta style
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])/;

const EMAIL_REGEX =
  // eslint-disable-next-line prefer-named-capture-group -- meta style
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

export const DEFAULT_MATCHERS = [
  createLinkMatcherWithRegExp(URL_REGEX, (text) => {
    return text.startsWith("http") ? text : `https://${text}`;
  }),
  createLinkMatcherWithRegExp(EMAIL_REGEX, (text) => {
    return `mailto:${text}`;
  }),
];

export type AutoLinkOutput = DisabledToggleOutput;

export const AutoLinkExtension = defineExtension({
  name: "@etrepum/lexical-builder-link/AutoLink",
  dependencies: [LinkExtension],
  nodes: [AutoLinkNode],
  config: safeCast<AutoLinkConfig>({
    matchers: DEFAULT_MATCHERS,
    onChange: (_url, _prevUrl) => {
      /* noop */
    },
    disabled: false,
  }),
  register(editor, config) {
    return provideOutput<AutoLinkOutput>(
      ...disabledToggle({
        disabled: config.disabled,
        register() {
          const { matchers, onChange } = config;
          return mergeRegister(
            editor.registerNodeTransform(TextNode, (textNode: TextNode) => {
              const parent = textNode.getParentOrThrow();
              const previous = textNode.getPreviousSibling();
              if ($isAutoLinkNode(parent) && !parent.getIsUnlinked()) {
                handleLinkEdit(parent, matchers, onChange);
              } else if (!$isLinkNode(parent)) {
                if (
                  textNode.isSimpleText() &&
                  (startsWithSeparator(textNode.getTextContent()) ||
                    !$isAutoLinkNode(previous))
                ) {
                  const textNodesToMatch = getTextNodesToMatch(textNode);
                  $handleLinkCreation(textNodesToMatch, matchers, onChange);
                }

                handleBadNeighbors(textNode, matchers, onChange);
              }
            }),
            editor.registerCommand(
              TOGGLE_LINK_COMMAND,
              (payload) => {
                const selection = $getSelection();
                if (payload !== null || !$isRangeSelection(selection)) {
                  return false;
                }
                const nodes = selection.extract();
                nodes.forEach((node) => {
                  const parent = node.getParent();

                  if ($isAutoLinkNode(parent)) {
                    // invert the value
                    parent.setIsUnlinked(!parent.getIsUnlinked());
                    parent.markDirty();
                    return true;
                  }
                });
                return false;
              },
              COMMAND_PRIORITY_LOW,
            ),
          );
        },
      }),
    );
  },
});
