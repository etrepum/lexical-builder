import { type AnyLexicalPlan, LexicalBuilder } from "@etrepum/lexical-builder";
import { type LexicalEditor } from "lexical";
import { displayName } from "./displayName";

export function buildGraph(editor: LexicalEditor): string {
  const builder = LexicalBuilder.fromEditor(editor);
  const output = ["flowchart TB"];
  function emit(s: string) {
    output.push(s);
  }
  const planReps = [...builder.sortedPlanReps()];
  const nameToId: Record<string, string> = {};
  for (let i = 0; i < planReps.length; i++) {
    nameToId[planReps[i]!.plan.name] = `P${String(i)}`;
  }
  function q(plan: AnyLexicalPlan): string {
    return nameToId[plan.name]!;
  }
  for (const rep of planReps) {
    const { plan } = rep;
    emit(`${q(plan)}["${displayName(plan)}"]`);
    for (const dep of plan.dependencies || []) {
      emit(`${q(plan)} --> ${q(Array.isArray(dep) ? dep[0] : dep)}`);
    }
    for (const [name] of plan.peerDependencies || []) {
      const peer = builder.planNameMap.get(name);
      if (peer) {
        emit(`${q(plan)} -.-> ${q(peer.plan)}`);
      }
    }
  }
  return `${output.join("\n  ")}\n`;
}
