import { canShowPlaceholder } from "./registerShowPlaceholder";
import { useRegisterSubscription } from "./useRegisterSubscription";
import { WithEditable } from "./WithEditable";

/**
 * A placeholder component that returns the content, or the
 * return value of content(isEditable),
 * when `$canShowPlaceholder` from \@lexical/text is true.
 */
export function Placeholder({
  content,
}: {
  content: ((isEditable: boolean) => null | JSX.Element) | JSX.Element;
}): null | JSX.Element {
  const showPlaceholder = useRegisterSubscription(canShowPlaceholder);
  if (!showPlaceholder) {
    return null;
  } else if (typeof content === "function") {
    return <WithEditable content={content} />;
  }
  return content;
}
