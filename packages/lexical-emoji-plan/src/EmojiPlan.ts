/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { definePlan, safeCast } from "@etrepum/lexical-builder";
import { mergeRegister } from "@lexical/utils";
import { LexicalEditor, TextNode } from "lexical";
import { EmojiNode } from "./EmojiNode";
import { unifiedIDFromText } from "./unifiedID";

export const PACKAGE_VERSION: string = import.meta.env.PACKAGE_VERSION;

const NAME = "@etrepum/lexical-builder/emoji-plan";
export interface EmojiPlanConfig {
  emojiBaseUrl: string;
  emojiClass: string;
  emojiLoadedClass: string;
}

declare module "@etrepum/lexical-builder" {
  interface LexicalPlanRegistry {
    [NAME]: typeof EmojiPlan;
  }
}

export const EmojiPlan = definePlan({
  config: safeCast<EmojiPlanConfig>({
    emojiBaseUrl: `https://cdn.jsdelivr.net/npm/@etrepum/lexical-emoji-plan@${import.meta.env.PACKAGE_VERSION}/dist/emoji`,
    emojiClass: "emoji-node",
    emojiLoadedClass: "emoji-node-loaded",
  }),
  name: NAME,
  nodes: [EmojiNode],
  register(editor: LexicalEditor, config, state) {
    let cleanup = editor.registerMutationListener(EmojiNode, (nodes) => {
      // Everything we already need is in the DOM, otherwise we would
      // want to get the node reference from here as well
      // (using editor.update and $getNodeByKey).
      for (const [nodeKey, mutation] of nodes) {
        if (mutation !== "destroyed") {
          const dom = editor.getElementByKey(nodeKey);
          if (dom) {
            // A possible future enhancement would be to allow both image
            // emojis and plain text emojis that we do not have images for,
            // in which case we would want to have a separate class and not
            // use a background image if we don't have one.
            const imageUrl = `${config.emojiBaseUrl}/${unifiedIDFromText(dom.innerText)}.png`;
            dom.classList.add(config.emojiClass);
            dom.style.backgroundImage = `url(${imageUrl})`;
            const img = new Image();
            img.addEventListener(
              "load",
              () => dom.classList.add(config.emojiLoadedClass),
              { signal: state.signal, once: true },
            );
            img.src = imageUrl;
          }
        }
      }
    });
    // Defer loading of the transform which needs to load the emoji JSON
    import("./$textNodeTransform").then(({ $textNodeTransform }) => {
      if (!state.signal.aborted) {
        cleanup = mergeRegister(
          cleanup,
          editor.registerNodeTransform(TextNode, $textNodeTransform),
        );
      }
    });
    return () => cleanup();
  },
});
