export function extractHighlight(description: string, query: string): string {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  // Split on sentence-ending punctuation followed by whitespace
  const sentences = description.split(/(?<=[.!?])\s+/);

  const match = sentences.find((sentence) =>
    tokens.some((token) => sentence.toLowerCase().includes(token))
  );

  return match ?? sentences[0];
}
