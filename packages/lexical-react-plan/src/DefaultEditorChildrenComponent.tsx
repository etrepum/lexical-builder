import { EditorChildrenComponentProps } from "./types";
import { Placeholder } from "./Placeholder";

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
