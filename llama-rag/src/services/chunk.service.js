export function chunkText(text, chunkSize = 1200, overlap = 200) {
  const clean = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  const chunks = [];
  let start = 0;

  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    const chunk = clean.slice(start, end).trim();
    if (chunk.length > 80) chunks.push(chunk);
    if (end === clean.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
}