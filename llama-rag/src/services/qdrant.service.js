import { QdrantClient } from "@qdrant/js-client-rest";

export function createQdrantClient({ qdrantUrl }) {
  return new QdrantClient({ url: qdrantUrl });
}

export async function ensureCollection(qdrant, { collection, vectorSize }) {
  const collections = await qdrant.getCollections();
  const exists = collections.collections?.some((c) => c.name === collection);

  if (!exists) {
    await qdrant.createCollection(collection, {
      vectors: { size: vectorSize, distance: "Cosine" },
    });
    console.log("✅ Coleção criada:", collection);
  }
}

export async function upsertPoints(qdrant, { collection, points, batchSize = 16 }) {
  for (let i = 0; i < points.length; i += batchSize) {
    await qdrant.upsert(collection, {
      wait: true,
      points: points.slice(i, i + batchSize),
    });
  }
}

export async function search(qdrant, { collection, vector, topK = 5, filter = null }) {
  return qdrant.search(collection, {
    vector,
    limit: Math.min(10, Math.max(1, topK)),
    with_payload: true,
    ...(filter ? { filter } : {}),
  });
}