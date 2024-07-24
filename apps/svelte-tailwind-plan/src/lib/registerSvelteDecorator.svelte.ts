import {
  type Klass,
  type DecoratorNode,
  type NodeKey,
  type LexicalEditor,
  $getNodeByKey as L$getNodeByKey,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { mount, unmount, type Component } from "svelte";

/**
 * Register a mutation listener to render a Lexical decorator node with a
 * Svelte 5 component (using runes and the new component APIs). The node
 * prop is updated after every mutation with the latest version.
 *
 * @param editor - the editor
 * @param Klass - the DecoratorNode subclass
 * @param Component - the Svelte component
 * @returns a cleanup function
 */
export function registerSvelteDecorator<T extends DecoratorNode<null>>(
  editor: LexicalEditor,
  Klass: Klass<T>,
  Component: Component<{ node: T; editor: LexicalEditor }>,
): () => void {
  const mountMap = new Map<NodeKey, (node: T | null) => void>();
  return mergeRegister(
    () => {
      for (const setNode of mountMap.values()) {
        setNode(null);
      }
      mountMap.clear();
    },
    editor.registerMutationListener(
      Klass,
      (nodes /*, { updateTags, dirtyLeaves, prevEditorState }*/) => {
        for (const [nodeKey, mutation] of nodes.entries()) {
          const setNode = mountMap.get(nodeKey);
          if (mutation === "created") {
            if (setNode) {
              throw new Error("create mutation called twice with same nodeKey");
            }
            const el = editor.getElementByKey(nodeKey);
            const initialNode: T | null = editor.read(() =>
              L$getNodeByKey(nodeKey),
            );
            if (!el || !initialNode || !(initialNode instanceof Klass)) {
              throw new Error(
                `Expecting a mounted instance of ${Klass.name} (with type ${Klass.getType()})`,
              );
            }
            // eslint-disable-next-line no-undef -- false positive
            let node = $state.frozen(initialNode);
            const component = mount(Component, {
              target: el,
              props: {
                editor,
                get node() {
                  return node;
                },
              },
            });
            mountMap.set(nodeKey, (nextNode: T | null) => {
              if (nextNode) {
                node = nextNode;
              } else {
                unmount(component);
              }
            });
          } else if (setNode && mutation === "destroyed") {
            setNode(null);
            mountMap.delete(nodeKey);
          } else if (setNode && mutation === "updated") {
            const node: T | null = editor.read(() => L$getNodeByKey(nodeKey));
            if (!node || !(node instanceof Klass)) {
              throw new Error(
                `Expecting an instance of ${Klass.name} (with type ${Klass.getType()})`,
              );
            }
            setNode(node);
          }
        }
      },
      {
        // TODO: waiting for https://github.com/facebook/lexical/pull/6444
        // but doesn't need lazy init either way
        skipInitialization: true,
      },
    ),
  );
}
