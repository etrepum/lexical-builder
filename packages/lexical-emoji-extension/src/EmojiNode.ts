/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { getPeerDependencyFromEditorOrThrow } from "@lexical/extension";
import { addClassNamesToElement } from "@lexical/utils";
import type {
  DOMConversionMap,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  StateValueOrUpdater,
} from "lexical";
import {
  TextNode,
  $getEditor,
  createState,
  $getStateChange,
  $getState,
  $setState,
  $create,
} from "lexical";
import type { EmojiExtension } from "./EmojiExtension";

const shortcodeState = createState("shortcode", {
  parse: (v) => (typeof v === "string" ? v : undefined),
});

/**
 * EmojiNode doesn't really need to override any of TextNode's functionality,
 * other than these serialization and type related static methods.
 *
 * The behavior is augmented in $createEmojiNode where we set mode to token
 * so it is treated as an "atomic" unit and not considered for further text
 * transforms.
 *
 * The display behavior is all implemented in the mutation listener set up
 * by EmojiExtension, which makes it a little easier to ensure that clean-up is
 * done properly.
 */
export class EmojiNode extends TextNode {
  $config() {
    return this.config("emoji", {
      extends: TextNode,
      stateConfigs: [{ stateConfig: shortcodeState, flat: true }],
    });
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      span: (el: HTMLElement) => {
        return {
          conversion: () => {
            const {
              textContent,
              dataset: { emojiShortcode },
            } = el;
            if (textContent && emojiShortcode) {
              return {
                node: $createEmojiNode(textContent, el.dataset.emojiShortcode),
              };
            }
            return null;
          },
          priority: 1,
        };
      },
    };
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    if (super.updateDOM(prevNode, dom, config)) {
      return true;
    }
    const change = $getStateChange(this, prevNode, shortcodeState);
    if (change) {
      const [shortcode] = change;
      if (shortcode) {
        dom.dataset.emojiShortcode = shortcode;
      } else {
        delete dom.dataset.emojiShortcode;
      }
    }
    return false;
  }

  createDOM(
    config: EditorConfig,
    editor?: LexicalEditor | undefined,
  ): HTMLElement {
    const dom = super.createDOM(config, editor);
    // We reference this as a peer dependency so we can avoid a circular
    // import. If this was in the same file as the extension definition it
    // would not be an issue. It is fine to have circular type imports.
    // Alternatively, we could include this code in the mutation listener,
    // but that would not run in the default implementation of exportDOM.
    addClassNamesToElement(
      dom,
      getPeerDependencyFromEditorOrThrow<typeof EmojiExtension>(
        editor || $getEditor(),
        "@etrepum/lexical-emoji-extension/Emoji",
      ).config.emojiClass,
    );
    const shortcode = $getState(this, shortcodeState);
    if (shortcode) {
      dom.dataset.emojiShortcode = shortcode;
    }
    return dom;
  }

  getShortcode(): string | undefined {
    return $getState(this, shortcodeState);
  }

  setShortcode(shortcode?: StateValueOrUpdater<typeof shortcodeState>): this {
    return $setState(this, shortcodeState, shortcode);
  }
}

/**
 * @param text - The emoji string (a decoded unified id)
 * @returns the EmojiNode
 */
export function $createEmojiNode(
  text: string,
  shortcode?: string | undefined,
): EmojiNode {
  // In token mode node can be navigated through character-by-character,
  // but are deleted as a single entity (not individually by character).
  // This also forces Lexical to create adjacent TextNode on user input instead of
  // modifying Emoji node as it now acts as immutable node.
  return $create(EmojiNode)
    .setTextContent(text)
    .setShortcode(shortcode)
    .setMode("token");
}

export function $isEmojiNode(
  node: LexicalNode | null | undefined,
): node is EmojiNode {
  return node instanceof EmojiNode;
}
