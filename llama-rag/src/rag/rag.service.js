import { extractTextFromPdfBuffer } from "../services/pdf.service.js";
import { chunkText } from "../services/chunk.service.js";
import { embed } from "../services/embed.service.js";
import { ensureCollection, upsertPoints, search } from "../services/qdrant.service.js";
import { chatAnswer } from "../services/llm.service.js";

export function createRagService({ cfg, qdrant, llm }) {
  async function indexPdf(file) {
    await ensureCollection(qdrant, {
      collection: cfg.qdrantCollection,
      vectorSize: cfg.vectorSize,
    });

    if (!file) {
      throw new Error("Envie um PDF no campo 'file'.");
    }

    if (!file?.buffer) throw new Error("Arquivo inválido (buffer vazio).");
    const text = await extractTextFromPdfBuffer(file.buffer);

    if (text.length < 100) {
      throw new Error("Não consegui extrair texto suficiente do PDF (pode ser escaneado).");
    }

    const docId = `${Date.now()}-${file.originalname}`;
    const chunks = chunkText(text, cfg.chunkSize, cfg.chunkOverlap);

    const baseId = Date.now(); // Qdrant aceita int ou UUID
    const points = [];

    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i];
      const vector = await embed(content);

      points.push({
        id: baseId + i,
        vector,
        payload: { docId, chunkIndex: i, content },
      });
    }

    await upsertPoints(qdrant, {
      collection: cfg.qdrantCollection,
      points,
      batchSize: cfg.batchSize,
    });


    return { docId, chunksIndexed: chunks.length };
  }

  async function ask(question, topK = 5, docId=null) {
    await ensureCollection(qdrant, {
    collection: cfg.qdrantCollection,
    vectorSize: cfg.vectorSize,
  });

  const qVec = await embed(question);

  const filter = docId
    ? { must: [{ key: "docId", match: { value: docId } }] }
    : null;

  const results = await search(qdrant, {
    collection: cfg.qdrantCollection,
    vector: qVec,
    topK,
    filter,
  });

  const hits = (results || []).map((r) => ({
    score: r.score,
    docId: r.payload?.docId,
    chunkIndex: r.payload?.chunkIndex,
    content: r.payload?.content,
  }));

  const context = hits
    .map((h, i) => `[#${i + 1} | ${h.docId} | trecho ${h.chunkIndex}] ${h.content}`)
    .join("\n\n");

  const messages = [
    { role: "system", content: "Você é um assistente útil e direto. Responda em português." },
    {
      role: "user",
      content:
`Responda usando SOMENTE os trechos abaixo como base.
Se não houver evidência suficiente, diga que não encontrou no documento.

Pergunta: ${question}

TRECHOS:
${context}`
    }
  ];

  const answer = await chatAnswer(llm, {
    model: cfg.llamaModel,
    messages,
    temperature: 0.3,
  });

  return {
    answer,
    sources: hits.map((h) => ({
      docId: h.docId,
      chunkIndex: h.chunkIndex,
      score: h.score,
    })),
  };
  }

  return { indexPdf, ask };
}