import {
  AnyLexicalPlan,
  LexicalBuilder,
  PACKAGE_VERSION,
} from "@etrepum/lexical-builder";
import { LexicalEditor } from "lexical";
import invariant from "./shared/invariant";
import { displayName } from "./BuilderGraphComponent";

export function buildGraph(editor: LexicalEditor): string {
  const builder = LexicalBuilder.fromEditor(editor);
  invariant(
    builder !== undefined,
    "buildGraph: editor was not created with this build of Lexical Builder %s",
    PACKAGE_VERSION,
  );

  const output = ["flowchart TB"];
  function emit(s: string) {
    output.push(s);
  }
  const planReps = [...builder.sortedPlanReps()];
  const nameToId: Record<string, string> = {};
  for (let i = 0; i < planReps.length; i++) {
    nameToId[planReps[i]!.plan.name] = `P${i}`;
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
  return output.join("\n  ") + "\n";
}
