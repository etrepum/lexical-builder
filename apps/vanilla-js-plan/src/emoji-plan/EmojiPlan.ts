/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { definePlan } from "@etrepum/lexical-builder";
import { mergeRegister } from "@lexical/utils";
import { LexicalEditor, TextNode } from "lexical";
import { EmojiNode } from "./EmojiNode";
import { unifiedIDFromText } from "./unifiedID";

export const EmojiPlan = definePlan({
  config: {
    emojiBaseUrl: "/emoji",
    emojiClass: "emoji-node",
  },
  name: "@lexical/examples/vanilla-js/emoji-plan",
  nodes: [EmojiNode],
  register(editor: LexicalEditor, config, state) {
    let cleanup = editor.registerMutationListener(EmojiNode, (nodes) => {
      // Everything we already need is in the DOM, otherwise we would
      // want to get the node reference from here as well.
      // We could do it from the node class itself, of course, but in
      // order to pass configuration it would require an awkward
      // WeakMap<LexicalEditor, Config> or similar approach.
      for (const [nodeKey, mutation] of nodes) {
        if (mutation !== "destroyed") {
          const dom = editor.getElementByKey(nodeKey);
          if (dom) {
            dom.classList.add(config.emojiClass);
            dom.style.backgroundImage = `url(${config.emojiBaseUrl}/${unifiedIDFromText(dom.innerText)}.png)`;
          }
        }
      }
    });
    // Defer loading of the transform which needs to load the emoji JSON
    import("./$textNodeTransform").then(({ $textNodeTransform }) => {
      if (!state.signal.aborted) {
        cleanup = mergeRegister(
          cleanup,
          editor.registerNodeTransform(TextNode, $textNodeTransform)
        );
      }
    });
    return () => cleanup();
  },
});
