/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { defineExtension, safeCast } from "@etrepum/lexical-builder";
import {
  addClassNamesToElement,
  mergeRegister,
  removeClassNamesFromElement,
} from "@lexical/utils";
import { type LexicalEditor, type NodeKey, TextNode } from "lexical";
import { loadTextNodeTransform } from "@etrepum/lexical-emoji-extension/loadTextNodeTransform";
import { EmojiNode } from "./EmojiNode";
import { unifiedIDFromText } from "./unifiedID";

export const PACKAGE_VERSION: string = import.meta.env.PACKAGE_VERSION;

export interface EmojiExtensionConfig {
  /**
   * The base URL to find the emoji PNG files, originally from the 64x64 set in emoji-datasource-facebook.
   * Default: "https://cdn.jsdelivr.net/npm/\@etrepum/lexical-emoji-extension\@$\{PACKAGE_VERSION\}/dist/emoji"
   *
   * Do not add a trailing slash to the path.
   */
  emojiBaseUrl: string;
  /**
   * The class to use for emoji nodes
   */
  emojiClass: string;
  /**
   * The class to use for emoji nodes before the image is loaded
   */
  emojiLoadingClass: string;
  /**
   * The class to use for emoji nodes after the image is loaded and set as a background-image
   */
  emojiLoadedClass: string;
}

function noop() {
  /*noop*/
}

// eslint-disable-next-line @typescript-eslint/ban-types -- transform is a function
function resolve<T extends Function>(arg: Promise<T> | T, fn: (v: T) => void) {
  typeof arg === "function"
    ? fn(arg)
    : void arg.then((v) => {
        fn(v);
      });
}

const ssr = typeof window === "undefined";

/**
 * A extension to use the emoji-datasource-facebook emoji database to convert
 * short names such as :man-facepalming: or :) to their corresponding
 * emoji, and uses an img from the same package rather than the current
 * font to display it so that the display is consistent regardless of the
 * platform.
 *
 * Loading the emoji database is done using an async import so will typicallly
 * be a lazy loaded module in a separate chunk.
 *
 * Images are also maximally lazily loaded, before they load the font's
 * representation of that emoji is used and then the emojiLoadedClass is
 * added.
 */
export const EmojiExtension = defineExtension({
  config: safeCast<EmojiExtensionConfig>({
    emojiBaseUrl: `https://cdn.jsdelivr.net/npm/@etrepum/lexical-emoji-extension@${PACKAGE_VERSION}/dist/emoji`,
    emojiClass: "emoji-node",
    emojiLoadingClass: "emoji-node-loading",
    emojiLoadedClass: "emoji-node-loaded",
  }),
  name: "@etrepum/lexical-emoji-extension/Emoji",
  nodes: [EmojiNode],
  register(editor: LexicalEditor, config, state) {
    const nodeCleanup = new Map<NodeKey, () => void>();
    let cleanupTransform = noop;
    const cleanup = mergeRegister(
      // no need for init since we are synchronously registering at editor creation
      editor.registerMutationListener(EmojiNode, (nodes) => {
        // Everything we already need is in the DOM, otherwise we would
        // want to get the node reference from here as well
        // (using editor.update and $getNodeByKey).
        for (const [nodeKey, mutation] of nodes) {
          if (mutation === "destroyed") {
            const fn = nodeCleanup.get(nodeKey);
            if (fn) {
              nodeCleanup.delete(nodeKey);
              fn();
            }
          } else {
            const dom = editor.getElementByKey(nodeKey);
            if (dom?.textContent) {
              // A possible future enhancement would be to allow both image
              // emojis and plain text emojis that we do not have images for,
              // in which case we would want to have a separate class and not
              // use a background image if we don't have one.
              const imageUrl = `${config.emojiBaseUrl}/${unifiedIDFromText(dom.textContent)}.png`;
              addClassNamesToElement(
                dom,
                config.emojiClass,
                config.emojiLoadingClass,
              );
              dom.style.backgroundImage = `url(${imageUrl})`;
              if (!ssr) {
                const img = new Image();
                const cleanupImg = () => {
                  Object.assign(img, { onload: null, onerror: null });
                };
                const eagerNodeCleanup = () => {
                  cleanupImg();
                  nodeCleanup.delete(nodeKey);
                  removeClassNamesFromElement(dom, config.emojiLoadingClass);
                };
                Object.assign(img, {
                  onerror: eagerNodeCleanup,
                  onload: () => {
                    eagerNodeCleanup();
                    addClassNamesToElement(dom, config.emojiLoadedClass);
                  },
                });
                nodeCleanup.set(nodeKey, cleanupImg);
                img.src = imageUrl;
              }
            }
          }
        }
      }),
      () => {
        for (const fn of nodeCleanup.values()) {
          fn();
        }
        nodeCleanup.clear();
      },
      () => {
        cleanupTransform();
      },
    );
    // Defer loading of the transform which needs to load the emoji JSON
    resolve(loadTextNodeTransform(), ($textNodeTransform) => {
      if (!state.signal.aborted) {
        cleanupTransform = editor.registerNodeTransform(
          TextNode,
          $textNodeTransform,
        );
      }
    });
    return cleanup;
  },
});
