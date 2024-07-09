/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { definePlan, safeCast } from "@etrepum/lexical-builder";
import {
  addClassNamesToElement,
  mergeRegister,
  removeClassNamesFromElement,
} from "@lexical/utils";
import { type LexicalEditor, type NodeKey, TextNode } from "lexical";
import { EmojiNode } from "./EmojiNode";
import { unifiedIDFromText } from "./unifiedID";

export const PACKAGE_VERSION: string = import.meta.env.PACKAGE_VERSION;

export interface EmojiPlanConfig {
  /**
   * The base URL to find the emoji PNG files, originally from the 64x64 set in emoji-datasource-facebook.
   * Default: "https://cdn.jsdelivr.net/npm/\@etrepum/lexical-emoji-plan\@$\{PACKAGE_VERSION\}/dist/emoji"
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

/**
 * A plan to use the emoji-datasource-facebook emoji database to convert
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
export const EmojiPlan = definePlan({
  config: safeCast<EmojiPlanConfig>({
    emojiBaseUrl: `https://cdn.jsdelivr.net/npm/@etrepum/lexical-emoji-plan@${PACKAGE_VERSION}/dist/emoji`,
    emojiClass: "emoji-node",
    emojiLoadingClass: "emoji-node-loading",
    emojiLoadedClass: "emoji-node-loaded",
  }),
  name: "@etrepum/lexical-emoji-plan/Emoji",
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
            if (dom) {
              // A possible future enhancement would be to allow both image
              // emojis and plain text emojis that we do not have images for,
              // in which case we would want to have a separate class and not
              // use a background image if we don't have one.
              const imageUrl = `${config.emojiBaseUrl}/${unifiedIDFromText(dom.innerText)}.png`;
              addClassNamesToElement(
                dom,
                config.emojiClass,
                config.emojiLoadingClass,
              );
              dom.style.backgroundImage = `url(${imageUrl})`;
              const img = new Image();
              const callback = () => {
                removeClassNamesFromElement(dom, config.emojiLoadingClass);
                addClassNamesToElement(dom, config.emojiLoadedClass);
                nodeCleanup.delete(nodeKey);
              };
              nodeCleanup.set(nodeKey, () => {
                img.removeEventListener("load", callback);
              });
              img.addEventListener("load", callback, {
                signal: state.signal,
                once: true,
              });
              img.src = imageUrl;
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
    void import("./$textNodeTransform").then(({ $textNodeTransform }) => {
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
