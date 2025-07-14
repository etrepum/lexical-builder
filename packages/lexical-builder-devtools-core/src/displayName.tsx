import { type AnyLexicalExtension } from "@etrepum/lexical-builder";

export function displayName(extension: AnyLexicalExtension) {
  const { name } = extension;
  const parts = name.split(/\//g);
  while (parts.length > 1 && /^extension$/i.test(parts[parts.length - 1] ?? "")) {
    parts.pop();
  }
  return (parts[parts.length - 1] || name)
    .replaceAll("/", "-")
    .replaceAll(/[\\"<>]/g, "");
}
