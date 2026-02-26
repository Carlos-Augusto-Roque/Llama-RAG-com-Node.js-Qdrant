export function loadEnv() {
  const cfg = {
    port: Number(process.env.PORT || 3000),

    llamaApiKey: process.env.LLAMA_API_KEY,
    llamaBaseUrl: process.env.LLAMA_BASE_URL || "https://api.groq.com/openai/v1",
    llamaModel: process.env.LLAMA_MODEL || "llama-3.1-8b-instant",

    qdrantUrl: process.env.QDRANT_URL || "http://localhost:6333",
    qdrantCollection: process.env.QDRANT_COLLECTION || "pdf_chunks",

    vectorSize: Number(process.env.VECTOR_SIZE || 384),

    chunkSize: Number(process.env.CHUNK_SIZE || 1200),
    chunkOverlap: Number(process.env.CHUNK_OVERLAP || 200),
    batchSize: Number(process.env.BATCH_SIZE || 16),
  };

  if (!cfg.llamaApiKey) {
    throw new Error("Defina LLAMA_API_KEY no .env");
  }

  return cfg;
}