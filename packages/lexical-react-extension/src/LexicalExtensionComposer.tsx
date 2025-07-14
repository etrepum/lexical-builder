import {
  buildEditorFromExtensions,
  getExtensionDependencyFromEditor,
  type AnyLexicalExtensionArgument,
} from "@etrepum/lexical-builder";
import { useEffect, useMemo } from "react";
import { scheduleMicrotask } from "./shared/scheduleMicroTask";
import { ReactProviderExtension } from "./ReactProviderExtension";
import { ReactExtension } from "./ReactExtension";

export interface LexicalExtensionComposerProps {
  /**
   * Your root extension, typically defined with {@link defineExtension}
   */
  extension: AnyLexicalExtensionArgument;
  /**
   * Any children will have access to useLexicalComposerContext (e.g. for React plug-ins or UX)
   */
  children: React.ReactNode;
}

/**
 * The equivalent of LexicalComposer for a extension. Make sure that your extension
 * argument is stable (e.g. using module scope or useMemo) so
 * that you are not re-creating the editor on every render!
 *
 * @example Module scoped extension
 * ```tsx
 * const extension = defineExtension({
 *   name: "[root]",
 *   dependencies: [RichTextExtension, HistoryExtension, EmojiExtension]
 * });
 * function MyEditor({ children }) {
 *   return (<LexicalExtensionComposer extension={extension}>{children}</LexicalExtensionComposer>);
 * }
 * ```
 *
 * @example useMemo extension
 * ```tsx
 * function MyEditor({ emojiBaseUrl, children }) {
 *   const extension = useMemo(() => {
 *     return defineExtension({
 *       name: "[root]",
 *       dependencies: [
 *         RichTextExtension,
 *         HistoryExtension,
 *         configExtension(EmojiExtension, { emojiBaseUrl }),
 *       ],
 *     });
 *   }, [emojiBaseUrl]);
 *   return (<LexicalExtensionComposer extension={extension}>{children}</LexicalExtensionComposer>);
 * }
 * ```
 *
 * @example Incorrect usage with unstable extension
 * ```tsx
 * function MyBrokenEditor({ emojiBaseUrl }) {
 *   // This argument is not stable, the editor is re-created every render and
 *   // all state is lost!
 *   const extension = defineExtension({
 *     name: "[root]",
 *     dependencies: [RichTextExtension, HistoryExtension, EmojiExtension]
 *   });
 *   return (<LexicalExtensionComposer extension={extension}>{children}</LexicalExtensionComposer>);
 * }
 * ```
 */
export function LexicalExtensionComposer({
  extension,
  children,
}: LexicalExtensionComposerProps) {
  const editor = useMemo(
    () => buildEditorFromExtensions(ReactProviderExtension, ReactExtension, extension),
    [extension],
  );
  useEffect(() => {
    // This is an awful trick to detect StrictMode so we don't dispose the
    // editor that we just created
    let didMount = false;
    scheduleMicrotask(() => {
      didMount = true;
    });
    return () => {
      if (didMount) {
        editor.dispose();
      }
    };
  }, [editor]);
  const { Component } = getExtensionDependencyFromEditor(editor, ReactExtension).output;
  return <Component>{children}</Component>;
}
