/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  definePlan,
  disabledToggle,
  type DisabledToggleOutput,
  provideOutput,
  safeCast,
  Store,
  type WritableStore,
} from "@etrepum/lexical-builder";
import { $isLinkNode } from "@lexical/link";
import { $findMatchingParent, isHTMLAnchorElement } from "@lexical/utils";
import {
  $getNearestNodeFromDOMNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  getNearestEditorFromDOMNode,
} from "lexical";
import { LinkPlan } from "./LinkPlan";

function findMatchingDOM<T extends Node>(
  startNode: Node,
  predicate: (node: Node) => node is T,
): T | null {
  let node: Node | null = startNode;
  while (node != null) {
    if (predicate(node)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

export interface ClickableLinkConfig {
  newTab: boolean;
  disabled: boolean;
  clickable: boolean;
}

export interface ClickableLinkOutput extends DisabledToggleOutput {
  clickable: WritableStore<boolean>;
}

export const ClickableLinkPlan = definePlan({
  name: "@etrepum/lexical-builder-link/ClickableLink",
  dependencies: [LinkPlan],
  config: safeCast<ClickableLinkConfig>({
    disabled: false,
    newTab: true,
    clickable: true,
  }),
  register(editor, config, _state) {
    const clickable = new Store<boolean>(config.clickable);
    const [output, cleanup] = disabledToggle({
      disabled: config.disabled,
      register() {
        const { newTab } = config;
        const onClick = (event: MouseEvent) => {
          const target = event.target;
          if (!(target instanceof Node)) {
            return;
          }
          const nearestEditor = getNearestEditorFromDOMNode(target);

          if (nearestEditor === null) {
            return;
          }
          let url: string | null = null;
          let urlTarget: string | null = null;

          nearestEditor.update(() => {
            const clickedNode = $getNearestNodeFromDOMNode(target);
            if (clickedNode !== null) {
              const maybeLinkNode = $findMatchingParent(
                clickedNode,
                $isElementNode,
              );
              if (clickable.get()) {
                if ($isLinkNode(maybeLinkNode)) {
                  url = maybeLinkNode.sanitizeUrl(maybeLinkNode.getURL());
                  urlTarget = maybeLinkNode.getTarget();
                } else {
                  const a = findMatchingDOM(target, isHTMLAnchorElement);
                  if (a !== null) {
                    url = a.href;
                    urlTarget = a.target;
                  }
                }
              }
            }
          });

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- false positive
          if (url === null || url === "") {
            return;
          }

          // Allow user to select link text without follwing url
          const selection = editor.getEditorState().read($getSelection);
          if ($isRangeSelection(selection) && !selection.isCollapsed()) {
            event.preventDefault();
            return;
          }

          const isMiddle = event.type === "auxclick" && event.button === 1;
          window.open(
            url,
            newTab ||
              isMiddle ||
              event.metaKey ||
              event.ctrlKey ||
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- false positive
              urlTarget === "_blank"
              ? "_blank"
              : "_self",
          );
          event.preventDefault();
        };

        const onMouseUp = (event: MouseEvent) => {
          if (event.button === 1) {
            onClick(event);
          }
        };

        return editor.registerRootListener((rootElement, prevRootElement) => {
          if (prevRootElement !== null) {
            prevRootElement.removeEventListener("click", onClick);
            prevRootElement.removeEventListener("mouseup", onMouseUp);
          }
          if (rootElement !== null) {
            rootElement.addEventListener("click", onClick);
            rootElement.addEventListener("mouseup", onMouseUp);
          }
        });
      },
    });
    return provideOutput<ClickableLinkOutput>(
      { ...output, clickable },
      cleanup,
    );
  },
});
