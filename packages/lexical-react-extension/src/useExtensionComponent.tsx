import {
  type LexicalExtensionOutput,
  type OutputComponentExtension,
  getExtensionDependencyFromEditor,
  type AnyLexicalExtension,
  type LexicalExtensionDependency,
} from "@etrepum/lexical-builder";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { type ComponentProps } from "react";

export function useExtensionDependency<Extension extends AnyLexicalExtension>(
  extension: Extension,
): LexicalExtensionDependency<Extension> {
  return getExtensionDependencyFromEditor(useLexicalComposerContext()[0], extension);
}

/**
 * Use a Component from the given Extension that uses the ReactExtension convention
 * of exposing a Component property in its output.
 *
 * @param extension - A extension with a Component property in the output
 * @returns `getExtensionConfigFromEditor(useLexicalComposerContext()[0], extension).Component`
 */
export function useExtensionComponent<
  Props extends Record<never, never>,
  OutputComponent extends React.ComponentType<Props>,
  Extension extends OutputComponentExtension<OutputComponent>,
>(extension: Extension): OutputComponent {
  return useExtensionDependency(extension).output.Component;
}

/**
 * The lexical:extension prop combined with the props of the given Extension's
 * output Component.
 */
export type UseExtensionComponentProps<Extension extends AnyLexicalExtension> = {
  /** The Extension */ "lexical:extension": Extension;
} & ([LexicalExtensionOutput<Extension>] extends [
  {
    Component: infer OutputComponentType extends React.ComponentType;
  },
]
  ? /** The Props from the Extension output Component */ Omit<
      ComponentProps<OutputComponentType>,
      "lexical:extension"
    >
  : never);

/**
 * A convenient way to get a Extension's output Component with {@link useExtensionComponent}
 * and construct it in one step.
 *
 * @example Usage
 * ```tsx
 * return (
 *   <UseExtensionComponent
 *     lexical:extension={TreeViewExtension}
 *     viewClassName="tree-view-output" />
 * );
 * ```
 *
 * @example Alternative without UseExtensionComponent
 * ```tsx
 * const TreeViewComponent = useExtensionComponent(TreeViewExtension);
 * return (<TreeViewComponent viewClassName="tree-view-output" />);
 * ```
 */
export function UseExtensionComponent<Extension extends AnyLexicalExtension>({
  "lexical:extension": extension,
  ...props
}: UseExtensionComponentProps<Extension>) {
  const Component = useExtensionComponent(extension);
  return <Component {...props} />;
}
