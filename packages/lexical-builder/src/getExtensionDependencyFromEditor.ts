import type { LexicalEditor } from "lexical";
import type {
  AnyLexicalExtension,
  LexicalExtensionDependency,
} from "@etrepum/lexical-builder-core";
import { LexicalBuilder } from "./LexicalBuilder";
import invariant from "./shared/invariant";

/**
 * Get the finalized config and output of a Extension that was used to build the editor.
 *
 * This is useful in the implementation of a LexicalNode or in other
 * situations where you have an editor reference but it's not easy to
 * pass the config or {@link ExtensionRegisterState} around.
 *
 * It will throw if the Editor was not built using this Extension.
 *
 * @param editor - The editor that was built using extension
 * @param extension - The concrete reference to a Extension used to build this editor
 * @returns The config and output for that Extension
 */
export function getExtensionDependencyFromEditor<Extension extends AnyLexicalExtension>(
  editor: LexicalEditor,
  extension: Extension,
): LexicalExtensionDependency<Extension> {
  const builder = LexicalBuilder.fromEditor(editor);
  const rep = builder.getExtensionRep(extension);
  invariant(
    rep !== undefined,
    "getExtensionFromEditor: Extension %s was not built when creating this editor",
    extension.name,
  );
  return rep.getExtensionDependency();
}
