import { LexicalEditor } from "lexical";
import { LexicalPeerConfig } from "./types";
import { LexicalBuilder } from "./LexicalBuilder";
import invariant from "./shared/invariant";
import { PACKAGE_VERSION } from "./PACKAGE_VERSION";

/**
 * Get the finalized configuration of a Plan using the editor by name, can be
 * used from the implementation of a LexicalNode or in other situations
 * where you have an editor reference but it's not easy to pass the config
 * around. Use this version if you do not have a concrete reference to the
 * Plan for some reason (e.g. it is an optional peer dependency).
 *
 * @param editor The editor that may have been built using plan
 * @param planName The name of the Plan
 * @returns The configuration for that Plan or undefined
 */
export function getPeerConfigFromEditor<Name extends string>(
  editor: LexicalEditor,
  planName: Name,
): LexicalPeerConfig<Name> | undefined {
  const builder = LexicalBuilder.fromEditor(editor);
  invariant(
    builder !== undefined,
    "getPlanConfigFromEditor: editor was not created with this build of Lexical Builder %s",
    PACKAGE_VERSION,
  );
  const peer = builder.planNameMap.get(planName);
  return peer ? peer.getConfig() : undefined;
}
