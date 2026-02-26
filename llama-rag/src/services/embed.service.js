import { pipeline } from "@xenova/transformers";

let embedderPromise = null;

function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedderPromise;
}

function meanPool(matrix) {
  const seqLen = matrix.length;
  const hidden = matrix[0].length;
  const out = new Array(hidden).fill(0);

  for (let i = 0; i < seqLen; i++) {
    for (let j = 0; j < hidden; j++) out[j] += matrix[i][j];
  }
  for (let j = 0; j < hidden; j++) out[j] /= seqLen;

  return out;
}

export async function embed(text) {
  const embedder = await getEmbedder();
  const out = await embedder(text, { pooling: "none", normalize: true });
  const arr = out.tolist(); // [1][seq][hid]
  return meanPool(arr[0]);  // [hid]=384
}