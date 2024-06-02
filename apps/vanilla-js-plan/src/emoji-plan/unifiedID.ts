export function textFromUnifiedID(unifiedID: string): string {
  return String.fromCodePoint(
    ...unifiedID.split("-").map((v) => parseInt(v, 16))
  );
}

export function unifiedIDFromText(text: string): string {
  return Array.from(text, (v) =>
    v.codePointAt(0)!.toString(16).padStart(4, "0")
  ).join("-");
}
