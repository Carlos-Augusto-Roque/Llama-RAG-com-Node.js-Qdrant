import "dotenv/config";
import express from "express";

import { loadEnv } from "./config/env.js";
import { createQdrantClient } from "./services/qdrant.service.js";
import { createLlmClient } from "./services/llm.service.js";
import { createRagService } from "./rag/rag.service.js";
import { createRagRouter } from "./routes/rag.routes.js";

const cfg = loadEnv();

const app = express();
app.use(express.json());
app.use(express.static("public"));

const qdrant = createQdrantClient(cfg);
const llm = createLlmClient(cfg);

const rag = createRagService({ cfg, qdrant, llm });
app.use("/", createRagRouter({ rag }));

app.listen(cfg.port, () => {
  console.log(`RAG rodando em http://localhost:${cfg.port}`);
  console.log(`Qdrant dashboard: ${cfg.qdrantUrl}/dashboard`);
});