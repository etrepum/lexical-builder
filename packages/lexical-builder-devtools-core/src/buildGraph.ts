import { type AnyLexicalExtension, LexicalBuilder } from "@etrepum/lexical-builder";
import { type LexicalEditor } from "lexical";
import { displayName } from "./displayName";

export function buildGraph(editor: LexicalEditor): string {
  const builder = LexicalBuilder.fromEditor(editor);
  const output = ["flowchart TB"];
  function emit(s: string) {
    output.push(s);
  }
  const extensionReps = builder.sortedExtensionReps();
  const nameToId: Record<string, string> = {};
  for (let i = 0; i < extensionReps.length; i++) {
    nameToId[extensionReps[i]!.extension.name] = `P${String(i)}`;
  }
  function q(extension: AnyLexicalExtension): string {
    return nameToId[extension.name]!;
  }
  for (const rep of extensionReps) {
    const { extension } = rep;
    emit(`${q(extension)}["${displayName(extension)}"]`);
    for (const dep of extension.dependencies || []) {
      emit(`${q(extension)} --> ${q(Array.isArray(dep) ? dep[0] : dep)}`);
    }
    for (const [name] of extension.peerDependencies || []) {
      const peer = builder.extensionNameMap.get(name);
      if (peer) {
        emit(`${q(extension)} -.-> ${q(peer.extension)}`);
      }
    }
  }
  return `${output.join("\n  ")}\n`;
}
