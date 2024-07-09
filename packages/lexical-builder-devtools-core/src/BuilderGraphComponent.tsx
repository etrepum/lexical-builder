import { type LexicalEditor } from "lexical";
import { type ComponentProps, lazy, useMemo } from "react";
import { buildGraph } from "./buildGraph";
import { getMermaidLiveUrl } from "./getMermaidLiveUrl";

const Mermaid = lazy(() => import("./Mermaid"));

export interface BuilderGraphComponentProps {
  editor: LexicalEditor;
  className?: string;
}

export function BuilderGraphComponent({
  editor,
  ...rest
}: BuilderGraphComponentProps & ComponentProps<"div">) {
  const { text, href } = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-shadow -- memo
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
      <a href={href} target="_blank" rel="noopener">
        mermaid.live
      </a>
      <Mermaid text={text} />
    </div>
  );
}

export default BuilderGraphComponent;
