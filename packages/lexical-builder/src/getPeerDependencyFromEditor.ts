import { $getEditor, LexicalEditor } from "lexical";
import { LexicalPeerDependency } from "./types";
import { LexicalBuilder } from "./LexicalBuilder";
import invariant from "./shared/invariant";
import { PACKAGE_VERSION } from "./PACKAGE_VERSION";

/**
 * Get the finalized config and output of a Plan that was used to build the
 * editor by name.
 *
 * This can be used from the implementation of a LexicalNode or in other
 * situation where you have an editor reference but it's not easy to pass the
 * config around. Use this version if you do not have a concrete reference to
 * the Plan for some reason (e.g. it is an optional peer dependency).
 *
 * @param editor The editor that may have been built using plan
 * @param planName The name of the Plan
 * @returns The config and output of the Plan or undefined
 */
export function getPeerDependencyFromEditor<Name extends string>(
  editor: LexicalEditor,
  planName: Name,
): LexicalPeerDependency<Name> | undefined {
  const builder = LexicalBuilder.fromEditor(editor);
  invariant(
    builder !== undefined,
    "getPeerConfigFromEditor: editor was not created with this build of Lexical Builder %s",
    PACKAGE_VERSION,
  );
  const peer = builder.planNameMap.get(planName);
  return peer
    ? (peer.getPlanDependency() as LexicalPeerDependency<Name>)
    : undefined;
}

/**
 * Get the finalized config and output of a Plan that was used to build the
 * editor by name.
 *
 * This can be used from the implementation of a LexicalNode or in other
 * situation where you have an editor reference but it's not easy to pass the
 * config around. Use this version if you do not have a concrete reference to
 * the Plan for some reason (e.g. it is an optional peer dependency).
 *
 * @param planName The name of the Plan
 * @returns The config and output of the Plan or undefined
 */
export function $getPeerDependency<Name extends string>(
  planName: Name,
): LexicalPeerDependency<Name> | undefined {
  return getPeerDependencyFromEditor($getEditor(), planName);
}
