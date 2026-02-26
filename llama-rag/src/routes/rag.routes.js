import express from "express";
import multer from "multer";

export function createRagRouter({ rag }) {
  const router = express.Router();

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB (ajuste se quiser)
  });

  router.post("/pdf", upload.single("file"), async (req, res) => {
    try {
      const result = await rag.indexPdf(req.file);
      res.json({ ok: true, ...result });
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err?.message || "Erro ao indexar PDF" });
    }
  });

  router.post("/ask", async (req, res) => {
    try {
      const { question, topK = 5, docId = null } = req.body;

      if (!question?.trim()) {
        return res.status(400).json({ error: "Envie { question: '...' }" });
      }

      const result = await rag.ask(question, topK, docId);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err?.message || "Erro no /ask" });
    }
  });

  return router;

  router.get("/health", async (_req, res) => {
    res.json({ ok: true, service: "llama-rag", ts: new Date().toISOString() });
  });
}
