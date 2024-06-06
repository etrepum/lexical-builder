import { EditorChildrenComponentProps } from "./types";
import { Placeholder } from "./Placeholder";

/**
 * @example The default EditorChildrenComponent implementation
 * ```jsx
 * return (
 *   <>
 *     {contentEditable}
 *     {placeholder && <Placeholder content={placeholder} />}
 *     {children}
 *   </>
 * );
 * ```
 */
export function DefaultEditorChildrenComponent({
  contentEditable,
  placeholder,
  children,
}: EditorChildrenComponentProps) {
  return (
    <>
      {contentEditable}
      {placeholder && <Placeholder content={placeholder} />}
      {children}
    </>
  );
}
