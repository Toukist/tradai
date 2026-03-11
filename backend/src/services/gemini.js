import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL = 'gemini-2.5-pro';

function getClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function callModel(systemPrompt, userMessage) {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 1200,
      },
    });

    const text = response.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('\n');

    return text?.trim() || 'Aucune réponse générée.';
  } catch (error) {
    console.error('Gemini error:', error.message);
    return `Gemini: Erreur — ${error.message}`;
  }
}
