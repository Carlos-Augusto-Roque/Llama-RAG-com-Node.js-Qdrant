# 🧠 Llama-RAG — Retrieval Augmented Generation (Node.js + Qdrant)

Implementação de um backend e frontend RAG (Retrieval Augmented Generation) robusto para consulta inteligente de documentos PDF utilizando busca vetorial e modelos de linguagem modernos.

Este projeto demonstra a aplicação prática de arquitetura de IA pronta para casos de uso avançados, combinando:

- **Embeddings vetoriais**
- **Banco vetorial especializado** (Qdrant)
- **Busca semântica isolada por sessão**
- **Geração de resposta em tempo real (Streaming/SSE)**
- **Memória Conversacional**
- **Containerização completa com Docker**

---

# 🎯 Objetivo

Demonstrar como construir um sistema RAG modular, seguro e com uma UX premium. O foco do projeto vai além do "básico", atacando problemas reais de implementações de RAG:

- **Chunking Inteligente**: Respeitando a semântica do texto.
- **Isolamento de Contexto**: Múltiplos PDFs sem alucinações cruzadas.
- **UX Moderna**: Respostas em *Streaming* e citações visuais de fontes.
- **Reprodutibilidade do ambiente**

---

# 🏗 Arquitetura & Pipeline

## Pipeline de Indexação (Upload)
1. **PDF** → O arquivo é enviado via `multipart/form-data`.
2. **Extração de Texto** → Leitura do Buffer via `pdfjs-dist`.
3. **Chunking Recursivo** → Divisão inteligente do texto respeitando Parágrafos `\n\n` -> Frases `. ` -> Caracteres.
4. **Embeddings** → Conversão do texto para vetores.
5. **Qdrant** → Armazenamento no banco vetorial atrelado a um `docId` único.

## Pipeline de Consulta (Chat)
1. **Pergunta + Histórico** → O usuário envia a pergunta atual junto ao histórico da conversa para manter a memória ativa.
2. **Embedding da Pergunta** → Conversão da pergunta para localização no espaço vetorial.
3. **Busca Vetorial Isolada** → Busca (Cosine Similarity) no Qdrant filtrando *exclusivamente* pela lista de `docIds` da sessão atual.
4. **LLM Generation** → Injeção do Contexto Encontrado + Histórico no *Prompt* do Llama.
5. **SSE Streaming** → A resposta é devolvida palavra por palavra em tempo real (Server-Sent Events) para a interface, junto com as **Fontes Utilizadas** (Citações).

---

## 🧩 Stack Técnica

- **Front-end**: HTML, CSS (Vanilla, Dark Mode com Glassmorphism), Lucide Icons.
- **Back-end API**: Node.js com Express.
- **Embeddings Locais**: MiniLM (Xenova Transformers - 384 dimensões).
- **Banco Vetorial**: Qdrant.
- **LLM**: Llama 3.x (Via Groq API rápida).
- **Extração**: pdfjs-dist.
- **Orquestração**: Docker Compose.

---

# 🚀 Como Rodar

## 1️⃣ Configure variáveis de ambiente

```bash
cp .env.example .env
```
Preencha a chave secreta `LLAMA_API_KEY` com a sua key da Groq.

## 2️⃣ Suba os containers

```bash
docker compose up -d --build
```
*(Se preferir rodar local, suba apenas o Qdrant pelo Docker e rode `npm run dev` no Host, certificando-se de acertar a `QDRANT_URL` no `.env`)*

## 3️⃣ Acesse

- Interface Completa: http://localhost:3000
- Qdrant Dashboard: http://localhost:6334/dashboard

---

# 🔌 API Endpoints

## POST `/pdf`
Upload de documento para indexação. Deve conter o form-data `file` com mimetype `application/pdf`.

## POST `/ask`
Endpoint principal do chat com suporte a Streaming (SSE).

**Payload esperado:**
```json
{
  "question": "Qual a tese principal?",
  "topK": 5,
  "docIds": ["id-do-pdf-123"],
  "history": [
    {"role": "user", "content": "olá"},
    {"role": "assistant", "content": "como posso ajudar?"}
  ]
}
```

O endpoint responderá no painel de cabeçalho `text/event-stream`, retornando primeiro um objeto opcional com as `{ sources }` e subsequentemente fluxos contínuos de `{ text }` até receber a sinalização `[DONE]`.

---

# 📊 Decisões Arquiteturais

## 🔹 Chunking Recursivo Semântico
Garante que pedaços de frases não sejam amputados durante a vetorização, entregando contextos saudáveis e compreensíveis ao LLM.

## 🔹 Filtro Qdrant `match: any`
O uso do rastreio de `docIds` pelo Front-end evita o problema clássico de contaminação cruzada. Você fala *apenas* com os PDFs que você quiser durante aquela aba de conversa.

## 🔹 Streaming UX
Esperar 20 segundos por uma geração completa de LLM quebra a experiência do usuário. O uso de SSE entrega o visual de "digitando", melhorando absurdamente a percepção de performance.

## 🔹 Citações Visuais
A interface revela para o usuário exatamente de qual trecho do documento o pedaço de informação foi extraído, melhorando a confiabilidade do sistema RAG.

---

# 📌 Limitações Atuais

- Não possui OCR ativo (PDFs constituídos apenas como imagens não retornarão texto sem fallback com Tesseract).
- Não implementa Reranking pós-busca semântica (embora as precisões atuais já sejam bem altas para os casos gerais).

---

# 📜 Licença
MIT
