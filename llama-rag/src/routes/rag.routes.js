import express from "express";
import multer from "multer";

export function createRagRouter({ rag }) {
  const router = express.Router();

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Apenas arquivos PDF são permitidos"), false);
      }
    }
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
      const { question, topK = 5, docIds = [], history = [] } = req.body;

      if (!question?.trim()) {
        return res.status(400).json({ error: "Envie { question: '...' }" });
      }

      const { stream, hits } = await rag.ask(question, topK, docIds, history);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // (Optional) Send the sources first
      res.write(`data: ${JSON.stringify({ sources: hits })}\n\n`);

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();

      req.on('close', () => {
        // Handle client aborting the stream safely
        if (!res.writableEnded) {
          res.end();
        }
      });
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).json({ error: err?.message || "Erro no /ask" });
      } else {
        res.write(`data: ${JSON.stringify({ error: err?.message || "Erro durante o processamento" })}\n\n`);
        res.end();
      }
    }
  });

  return router;

  router.get("/health", async (_req, res) => {
    res.json({ ok: true, service: "llama-rag", ts: new Date().toISOString() });
  });
}
