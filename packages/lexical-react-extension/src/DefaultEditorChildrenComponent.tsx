import { type EditorChildrenComponentProps } from "./types";

/**
 * @example The default EditorChildrenComponent implementation
 * ```jsx
 * return (
 *   <>
 *     {contentEditable}
 *     {children}
 *   </>
 * );
 * ```
 */
export function DefaultEditorChildrenComponent({
  contentEditable,
  children,
}: EditorChildrenComponentProps) {
  return (
    <>
      {contentEditable}
      {children}
    </>
  );
}
