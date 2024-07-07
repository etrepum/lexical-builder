import { deflate } from "pako";
import { fromUint8Array } from "js-base64";

export function getMermaidLiveUrl(code: string): string {
  const state = JSON.stringify({
    code,
    mermaid: JSON.stringify({ theme: "dark" }, null, 2),
    autoSync: true,
    rough: false,
    updateDiagram: true,
    updateEditor: false,
    editorMode: "code",
  });
  return `https://mermaid.live/edit#pako:${fromUint8Array(
    deflate(new TextEncoder().encode(state), { level: 9 }),
  )}`;
}
