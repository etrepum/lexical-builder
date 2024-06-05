import { useLexicalEditable } from "@lexical/react/useLexicalEditable";

export function WithEditable({
  content,
}: {
  content: (isEditable: boolean) => null | JSX.Element;
}) {
  return content(useLexicalEditable());
}
