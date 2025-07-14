import type { LexicalEditor } from "lexical";
import type {
  AnyLexicalExtension,
  LexicalExtensionDependency,
} from "@etrepum/lexical-builder-core";
import { LexicalBuilder } from "./LexicalBuilder";
import invariant from "./shared/invariant";

/**
 * Get the finalized config and output of an Extension that was used to build the
 * editor by name.
 *
 * This can be used from the implementation of a LexicalNode or in other
 * situation where you have an editor reference but it's not easy to pass the
 * config around. Use this version if you do not have a concrete reference to
 * the Extension for some reason (e.g. it is an optional peer dependency, or you
 * are avoiding a circular import).
 *
 * Both the explicit Extension type and the name are required.
 *
 *  @example
 * ```tsx
 * import type { EmojiExtension } from "@etrepum/lexical-emoji-extension";
 * getPeerDependencyFromEditor<typeof EmojiExtension>(editor, "@etrepum/lexical-emoji-extension/Emoji");
 * ```

 * @param editor - The editor that may have been built using extension
 * @param extensionName - The name of the Extension
 * @returns The config and output of the Extension or undefined
 */
export function getPeerDependencyFromEditor<
  Extension extends AnyLexicalExtension = never,
>(
  editor: LexicalEditor,
  extensionName: Extension["name"],
): LexicalExtensionDependency<Extension> | undefined {
  const builder = LexicalBuilder.fromEditor(editor);
  const peer = builder.extensionNameMap.get(extensionName);
  return peer
    ? (peer.getExtensionDependency() as LexicalExtensionDependency<Extension>)
    : undefined;
}

/**
 * Get the finalized config and output of an Extension that was used to build the
 * editor by name.
 *
 * This can be used from the implementation of a LexicalNode or in other
 * situation where you have an editor reference but it's not easy to pass the
 * config around. Use this version if you do not have a concrete reference to
 * the Extension for some reason (e.g. it is an optional peer dependency, or you
 * are avoiding a circular import).
 *
 * Both the explicit Extension type and the name are required.
 *
 *  @example
 * ```tsx
 * import type { EmojiExtension } from "./EmojiExtension";
 * export class EmojiNode extends TextNode {
 *   // other implementation details not included
 *   createDOM(
 *     config: EditorConfig,
 *     editor?: LexicalEditor | undefined
 *   ): HTMLElement {
 *     const dom = super.createDOM(config, editor);
 *     addClassNamesToElement(
 *       dom,
 *       getPeerDependencyFromEditorOrThrow<typeof EmojiExtension>(
 *         editor || $getEditor(),
 *         "@etrepum/lexical-emoji-extension/Emoji",
 *       ).config.emojiClass,
 *     );
 *     return dom;
 *   }
 * }
 * ```

 * @param editor - The editor that may have been built using extension
 * @param extensionName - The name of the Extension
 * @returns The config and output of the Extension
 */
export function getPeerDependencyFromEditorOrThrow<
  Extension extends AnyLexicalExtension = never,
>(
  editor: LexicalEditor,
  extensionName: Extension["name"],
): LexicalExtensionDependency<Extension> {
  const dep = getPeerDependencyFromEditor<Extension>(editor, extensionName);
  invariant(
    dep !== undefined,
    "getPeerDependencyFromEditorOrThrow: Editor was not built with Extension %s",
    extensionName,
  );
  return dep;
}
