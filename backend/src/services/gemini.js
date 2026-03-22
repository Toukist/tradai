import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PRIMARY_MODEL = 'gemini-2.5-pro';
const FALLBACK_MODEL = 'gemini-2.5-flash';

async function generate(model, contents, config) {
  const result = await client.models.generateContent({ model, contents, config });
  return (
    result?.candidates?.[0]?.content?.parts?.map(p => p.text || '').filter(Boolean).join('\n') ||
    result?.text ||
    result?.response?.text?.() ||
    null
  );
}

export async function callModel(systemPrompt, userMessage) {
  const contents = [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }];
  const config = { tools: [{ googleSearch: {} }], maxOutputTokens: 1500 };

  try {
    const text = await generate(PRIMARY_MODEL, contents, config);
    if (text) return text.trim();
    console.warn(`Gemini (${PRIMARY_MODEL}): empty response, trying ${FALLBACK_MODEL}...`);
  } catch (error) {
    const status = error.status || error.httpStatusCode;
    if (status === 503 || status === 429 || status === 404) {
      console.warn(`Gemini (${PRIMARY_MODEL}): ${status}, falling back to ${FALLBACK_MODEL}...`);
    } else {
      console.error('Gemini error:', error.message);
      return `Gemini: Erreur — ${error.message}`;
    }
  }

  try {
    const fallback = await generate(FALLBACK_MODEL, contents, config);
    if (fallback) return fallback.trim();
    return 'Gemini: Pas de réponse (vérifier clé API ou quota).';
  } catch (fallbackError) {
    console.error(`Gemini fallback (${FALLBACK_MODEL}) error:`, fallbackError.message);
    return `Gemini: Erreur — ${fallbackError.message}`;
  }
}
