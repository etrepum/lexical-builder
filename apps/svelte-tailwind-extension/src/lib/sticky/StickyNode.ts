/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import {
  $applyNodeReplacement,
  $getEditor,
  $setSelection,
  DecoratorNode,
} from "lexical";
import { getPeerDependencyFromEditorOrThrow } from "@etrepum/lexical-builder";
import type { StickyOutput, StickyExtension } from "./StickyExtension";

export type StickyNoteColor = "pink" | "yellow";

export type SerializedStickyNode = Spread<
  {
    xOffset: number;
    yOffset: number;
    color: StickyNoteColor;
    caption: SerializedEditor;
  },
  SerializedLexicalNode
>;

export class StickyNode extends DecoratorNode<null> {
  __x: number;
  __y: number;
  __color: StickyNoteColor;
  __caption: LexicalEditor;

  static getType(): "sticky" {
    return "sticky";
  }

  static clone(node: StickyNode): StickyNode {
    return new StickyNode(
      node.__x,
      node.__y,
      node.__color,
      node.__caption,
      node.__key,
    );
  }
  static importJSON(serializedNode: SerializedStickyNode): StickyNode {
    const stickyNode = $createStickyNode(
      serializedNode.xOffset,
      serializedNode.yOffset,
      serializedNode.color,
    );
    const caption = serializedNode.caption;
    const nestedEditor = stickyNode.__caption;
    const editorState = nestedEditor.parseEditorState(caption.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return stickyNode;
  }

  constructor(
    x: number,
    y: number,
    color: "pink" | "yellow",
    caption?: LexicalEditor,
    key?: NodeKey,
  ) {
    super(key);
    this.__x = x;
    this.__y = y;
    this.__caption = caption ?? $getOutput().$createCaptionEditor();
    this.__color = color;
  }

  exportJSON(): SerializedStickyNode {
    return {
      caption: this.__caption.toJSON(),
      color: this.__color,
      type: "sticky",
      version: 1,
      xOffset: this.__x,
      yOffset: this.__y,
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return document.createElement("div");
  }

  updateDOM(): false {
    return false;
  }

  setPosition(x: number, y: number): void {
    const writable = this.getWritable();
    writable.__x = x;
    writable.__y = y;
    $setSelection(null);
  }

  toggleColor(): void {
    const writable = this.getWritable();
    writable.__color = writable.__color === "pink" ? "yellow" : "pink";
  }

  decorate(): null {
    // see mutation listener
    return null;
  }

  isIsolated(): true {
    return true;
  }
}

function $getOutput(editor?: LexicalEditor): StickyOutput {
  return getPeerDependencyFromEditorOrThrow<typeof StickyExtension>(
    editor ?? $getEditor(),
    "Sticky",
  ).output;
}

export function $isStickyNode(
  node: LexicalNode | null | undefined,
): node is StickyNode {
  return node instanceof StickyNode;
}

export function $createStickyNode(
  xOffset = 0,
  yOffset = 0,
  color: StickyNoteColor = "yellow",
): StickyNode {
  return $applyNodeReplacement(new StickyNode(xOffset, yOffset, color));
}
