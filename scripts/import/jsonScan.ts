// Reads a single JSON object out of a larger string starting at `start`,
// e.g. parsing `window.__STORE__={...};` without assuming where it ends.
export function extractJsonAt(text: string, start: number): { value: unknown; end: number } {
  let i = start;
  while (i < text.length && /\s/.test(text[i])) i++;
  if (text[i] !== "{") {
    throw new Error(`extractJsonAt: expected '{' at index ${i}`);
  }

  let depth = 0;
  let inString = false;
  let escape = false;

  for (; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const end = i + 1;
        return { value: JSON.parse(text.slice(start, end)), end };
      }
    }
  }
  throw new Error("extractJsonAt: unterminated JSON value");
}
