import mermaid, { type MermaidConfig, type RenderResult } from "mermaid";
import { type ComponentProps, useEffect, useRef, useState } from "react";

export interface MermaidProps extends ComponentProps<"div"> {
  text: string;
  config?: MermaidConfig;
}

let idSrc = 0;
function getMermaidId() {
  return `mermaid-tmp-${String(++idSrc)}`;
}
export function useMermaidRenderResult(
  text: string,
  config?: MermaidConfig,
): RenderResult | undefined {
  const [result, setResult] = useState<RenderResult | undefined>();
  useEffect(() => {
    const id = getMermaidId();
    let canceled = false;
    mermaid.mermaidAPI.initialize({
      startOnLoad: false,
      ...config,
    });
    mermaid.render(id, text).then(
      (r) => {
        if (!canceled) {
          setResult(r);
        }
      },
      (e) => {
        // suppressErrorRendering is not available until mermaid 11
        document.querySelector(`#d${id}`)?.remove();
        throw e;
      },
    );
    return () => {
      canceled = true;
    };
  }, [text, config]);
  return result;
}

export function Mermaid({ text, config, ...props }: MermaidProps) {
  const result = useMermaidRenderResult(text, config);
  const ref = useRef<null | HTMLDivElement>(null);
  useEffect(() => {
    if (result?.bindFunctions && ref.current) {
      result.bindFunctions(ref.current);
    }
  }, [result]);
  return result?.svg ? (
    <div
      {...props}
      ref={ref}
      dangerouslySetInnerHTML={{ __html: result.svg }}
    />
  ) : null;
}

export default Mermaid;
