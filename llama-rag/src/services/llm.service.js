import OpenAI from "openai";

export function createLlmClient({ llamaApiKey, llamaBaseUrl }) {
  return new OpenAI({ apiKey: llamaApiKey, baseURL: llamaBaseUrl });
}

export async function chatAnswer(llm, { model, messages, temperature = 0.3 }) {
  const response = await llm.chat.completions.create({
    model,
    messages,
    temperature,
  });

  return response.choices?.[0]?.message?.content ?? "(sem resposta)";
}