/**
 * Extract and lightly repair JSON objects/arrays from LLM text.
 * Handles markdown fences, leading prose, trailing commas, and truncated closings.
 */

export function extractJsonCandidate(raw: string): string {
  let text = raw.trim();
  if (!text) return text;

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();

  const objStart = text.indexOf("{");
  const arrStart = text.indexOf("[");
  let start = -1;
  if (objStart >= 0 && (arrStart < 0 || objStart < arrStart)) start = objStart;
  else if (arrStart >= 0) start = arrStart;

  if (start > 0) text = text.slice(start);

  // Drop trailing prose after the last closing brace/bracket when both are present.
  const lastBrace = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (lastBrace > 0 && lastBrace < text.length - 1) {
    text = text.slice(0, lastBrace + 1);
  }

  return text.trim();
}

/** Remove trailing commas before } or ]. */
export function stripTrailingCommas(jsonText: string): string {
  return jsonText.replace(/,\s*([}\]])/g, "$1");
}

/** Replace smart quotes that break JSON.parse. */
export function normalizeQuotes(jsonText: string): string {
  return jsonText
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
}

/**
 * Balance braces/brackets if the model truncated the response.
 * Best-effort — only closes structures opened outside of string literals.
 */
export function closeTruncatedJson(jsonText: string): string {
  let inString = false;
  let escape = false;
  const stack: string[] = [];

  for (let i = 0; i < jsonText.length; i++) {
    const ch = jsonText[i]!;
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") {
      if (stack.length && stack[stack.length - 1] === ch) stack.pop();
    }
  }

  // If we were still inside a string, close it.
  let repaired = jsonText;
  if (inString) repaired += '"';

  // Remove a dangling trailing comma before we close.
  repaired = repaired.replace(/,\s*$/, "");
  while (stack.length) repaired += stack.pop();
  return repaired;
}

export function parseJsonLoose(raw: string): unknown {
  const attempts = [
    extractJsonCandidate(raw),
    stripTrailingCommas(extractJsonCandidate(raw)),
    normalizeQuotes(stripTrailingCommas(extractJsonCandidate(raw))),
    closeTruncatedJson(normalizeQuotes(stripTrailingCommas(extractJsonCandidate(raw)))),
  ];

  let lastError: unknown;
  const seen = new Set<string>();

  for (const candidate of attempts) {
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);
    try {
      return JSON.parse(candidate);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Unable to parse JSON: ${String(lastError)}`);
}
