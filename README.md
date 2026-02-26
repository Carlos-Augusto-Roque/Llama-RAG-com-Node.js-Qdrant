# Llama-RAG — Retrieval Augmented Generation com Node.js + Qdrant

Implementação de um backend RAG (Retrieval Augmented Generation) para consulta inteligente de documentos PDF utilizando busca vetorial e LLM.

Este projeto demonstra a aplicação prática de arquitetura moderna de IA combinando:

- Embeddings vetoriais
- Banco vetorial especializado
- Busca semântica
- Geração de resposta condicionada ao contexto
- Containerização completa com Docker

---

# Objetivo

Demonstrar como construir um sistema RAG modular, stateless e containerizável, pronto para evoluir para ambientes corporativos.

O foco não é apenas a funcionalidade, mas:

- Organização arquitetural
- Separação de responsabilidades
- Escalabilidade futura
- Reprodutibilidade do ambiente

---

# Arquitetura

## Pipeline de Indexação

PDF → Extração de Texto → Chunking → Embeddings → Qdrant

## Pipeline de Consulta

Pergunta → Embedding → Busca Vetorial (Cosine) → Contexto → LLM → Resposta com Fontes

O sistema utiliza o padrão clássico de RAG:

Retrieval + Context Injection + Generation

---

## Stack Técnica

- **Node.js (Express)** — API backend
- **MiniLM (Xenova Transformers)** — Embeddings locais (384 dimensões)
- **Qdrant** — Banco vetorial (Cosine similarity)
- **Llama 3.x (via Groq API)** — Large Language Model para geração
- **pdfjs-dist** — Extração de texto
- **Docker Compose** — Orquestração de serviços

---

# Estrutura do Projeto

```
src/
 ├── config/
 ├── routes/
 ├── services/
 ├── rag/
 └── server.js
```

Separação clara entre:

- Configuração
- Infraestrutura (LLM / Qdrant)
- Serviços utilitários (PDF, chunking, embedding)
- Camada RAG (orquestração)
- Rotas HTTP

Essa organização facilita:

- Testabilidade
- Evolução futura
- Substituição de componentes (ex: trocar Groq por Azure OpenAI)

---

# Execução

## 1) Configure variáveis

```bash
cp .env.example .env
```

Preencha `LLAMA_API_KEY`.

## 2️) Suba tudo

```bash
docker compose up -d --build
```

## 3️) Acesse

- App: http://localhost:3000
- Qdrant Dashboard: http://localhost:6334/dashboard
- Health: http://localhost:3000/health

---

# Endpoints

## POST `/pdf`

Upload de PDF via multipart/form-data

Field:

```
file
```

Retorno:

```
docId
```

---

## POST `/ask`

```json
{
  "question": "Pergunta aqui",
  "topK": 5,
  "docId": "opcional"
}
```

Permite filtrar por documento específico.

---

# Decisões Arquiteturais

## 🔹 Embeddings locais
Reduz custo operacional e facilita demonstração offline.

## 🔹 Qdrant
Banco vetorial especializado com alta performance para similaridade.

## 🔹 Filtro por payload (docId)
Permite múltiplos documentos simultaneamente sem colisão de contexto.

## 🔹 Upload em memória
Arquitetura stateless e adequada para ambientes containerizados.

## 🔹 Docker Compose
Reprodutibilidade com único comando.

---

# Limitações

- Não possui OCR (PDFs escaneados não são suportados)
- Não implementa reranking (ainda)
- Não possui autenticação

---

# Roadmap

- Implementar Reranking
- OCR com Tesseract
- Cache de embeddings
- Observabilidade (logs estruturados + métricas)
- Migração para Azure OpenAI
- Versionamento de índice vetorial

---

# Health Check

```
GET /health
```

---

# Licença

MIT
