export function chunkText(text, chunkSize = 1200, overlap = 200) {
  // Removes excessive whitespace and normalizes it
  const clean = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

  const separators = ["\n\n", "\n", ". ", " "];
  const chunks = [];

  function splitText(sourceText, size, currentLevel) {
    if (sourceText.length <= size) {
      if (sourceText.trim().length > 50) {
        chunks.push(sourceText.trim());
      }
      return;
    }

    const separator = separators[currentLevel] || "";
    const parts = separator ? sourceText.split(separator) : [sourceText];

    let currentChunk = "";

    for (const part of parts) {
      const addedText = currentChunk ? currentChunk + separator + part : part;

      if (addedText.length <= size) {
        currentChunk = addedText;
      } else {
        if (currentChunk) {
          if (currentChunk.trim().length > 50) chunks.push(currentChunk.trim());
          // Handle overlap if possible, though strict overlap handling in recursive split
          // is complex. As a simple fallback, we keep some characters from the end of currentChunk
          const overlapStr = currentChunk.slice(Math.max(0, currentChunk.length - overlap));
          currentChunk = overlapStr + separator + part;
        } else {
          // A single part is larger than the chunk size
          if (currentLevel < separators.length - 1) {
            splitText(part, size, currentLevel + 1);
          } else {
            // Fallback to strict slicing if we ran out of separators
            let start = 0;
            while (start < part.length) {
              const end = Math.min(start + size, part.length);
              const sliceStr = part.slice(start, end).trim();
              if (sliceStr.length > 50) chunks.push(sliceStr);
              start = end - overlap > start ? end - overlap : end;
            }
          }
        }
      }
    }

    if (currentChunk && currentChunk.trim().length > 50) {
      chunks.push(currentChunk.trim());
    }
  }

  splitText(clean, chunkSize, 0);

  // Return deduplicated and valid chunks
  return [...new Set(chunks)];
}