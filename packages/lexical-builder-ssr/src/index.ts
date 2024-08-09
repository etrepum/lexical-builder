import type { LexicalEditor } from "lexical";
import { withDOM as withDOMLocal } from "@etrepum/lexical-builder-ssr/dom";

export const PACKAGE_VERSION: string = import.meta.env.PACKAGE_VERSION;
// This prevents rollup from generating two imports
export const withDOM = withDOMLocal;

export function prerenderEditorHtml(editor: LexicalEditor): string {
  return withDOM(({ document }) => {
    const el = document.createElement("div");
    el.contentEditable = "false";
    editor.setRootElement(el);
    const html = el.innerHTML;
    editor.setRootElement(null);
    return html;
  });
}
