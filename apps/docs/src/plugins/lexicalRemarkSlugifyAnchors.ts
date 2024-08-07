/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

/**
 * Resolve links to lexical functions that have $ in them. typedoc labels only allow `[a-z_][a-z0-9_]*`
 * so any time we link to a symbol that starts with $ it generates a broken link in the final output.
 * This plugin resolves these at link resolution time rather than requiring awkward links in the docs.
 *
 *
 */
export function lexicalRemarkSlugifyAnchors() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (node.type === "link") {
        // Fix url anchors with a preceding $, e.g. #$getroot to #getroot
        node.url = node.url.replace(/#\$/, "#");
        // Remove module names from references, e.g. @lexical/html!$generateHtmlFromNodes to $generateHtmlFromNodes
        if (node.children.length === 1) {
          const [child] = node.children;
          if (child.type === "text") {
            child.value = child.value.replace(
              /^(?:@etrepum\/lexical-[^!]+)!/,
              "",
            );
          }
        }
      }
    });
    return tree;
  };
}
