import { AnyLexicalPlan } from "@etrepum/lexical-builder";
import { LexicalEditor } from "lexical";
import { ComponentProps, lazy, useMemo } from "react";
import { buildGraph } from "./buildGraph";
import { getMermaidLiveUrl } from "./getMermaidLiveUrl";

const Mermaid = lazy(() => import("./Mermaid"));

export interface BuilderGraphComponentProps {
  editor: LexicalEditor;
  className?: string;
}

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

export function BuilderGraphComponent({
  editor,
  ...rest
}: BuilderGraphComponentProps & ComponentProps<"div">) {
  const { text, href } = useMemo(() => {
    const text = buildGraph(editor);
    return {
      text,
      href: getMermaidLiveUrl(text),
    };
  }, [editor]);
  const defaults = rest.className
    ? {}
    : { style: { display: "grid", gap: "1rem" } };
  return (
    <div {...defaults} {...rest}>
      <a href={href} target="_blank">
        mermaid.live
      </a>
      <Mermaid text={text} />
    </div>
  );
}

export default BuilderGraphComponent;
