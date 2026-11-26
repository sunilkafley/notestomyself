export interface QuoteSegment {
  text: string;
  highlighted: boolean;
}

/**
 * Splits a quote string around *asterisk-wrapped* phrases so highlighted
 * sections render inline in handwritten yellow marker font.
 */
export function parseQuoteSegments(input: string): QuoteSegment[] {
  if (!input) return [];

  const regex = /\*([^*]+)\*/g;
  const segments: QuoteSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: input.slice(lastIndex, match.index),
        highlighted: false,
      });
    }
    segments.push({
      text: match[1],
      highlighted: true,
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    segments.push({
      text: input.slice(lastIndex),
      highlighted: false,
    });
  }

  return segments;
}
