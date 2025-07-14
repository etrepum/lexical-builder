/**
 * Convert a unified emoji ID its emoji representation.
 *
 * @example
 * ```js
 * assert(textFromUnifiedId("1F926-200D-2642-FE0F") === "🤦‍♂️");
 * ```
 *
 * @param unifiedID - The hyphen delimited hex representation of the UTF-16 code points in the emoji
 * @returns The emoji as a string
 */
export function textFromUnifiedID(unifiedID: string): string {
  return String.fromCodePoint(
    ...unifiedID.split("-").map((v) => parseInt(v, 16)),
  );
}

/**
 * Convert an emoji to its unified id (in uppercase).
 *
 * @example
 * ```js
 * assert(unifiedIDFromText("🤦‍♂️") === "1F926-200D-2642-FE0F");
 * ```
 */
export function unifiedIDFromText(text: string): string {
  return Array.from(text, (v) =>
    v.codePointAt(0)!.toString(16).padStart(4, "0"),
  ).join("-");
}
