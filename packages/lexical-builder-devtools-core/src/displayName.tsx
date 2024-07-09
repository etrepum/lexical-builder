import { type AnyLexicalPlan } from "@etrepum/lexical-builder";

export function displayName(plan: AnyLexicalPlan) {
  const { name } = plan;
  const parts = name.split(/\//g);
  while (parts.length > 1 && /^plan$/i.test(parts[parts.length - 1] ?? "")) {
    parts.pop();
  }
  return (parts[parts.length - 1] || name)
    .replaceAll("/", "-")
    .replaceAll(/[\\"<>]/g, "");
}
