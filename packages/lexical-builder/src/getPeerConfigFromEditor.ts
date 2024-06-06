import { LexicalEditor } from "lexical";
import { LexicalPeerConfig, LexicalPlan, PlanConfigBase } from "./types";
import { LexicalBuilder } from "./LexicalBuilder";
import invariant from "./shared/invariant";
import { PACKAGE_VERSION } from "./PACKAGE_VERSION";

/**
 * Get the finalized configuration of a Plan using the editor, can be
 * used from the implementation of a LexicalNode or in other situations
 * where you have an editor reference but it's not easy to pass the config
 * around.
 *
 * @param editor The editor that was built using plan
 * @param plan The concrete reference to a Plan used to build this editor
 * @returns The configuration for that Plan
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
