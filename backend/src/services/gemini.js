import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function callModel(systemPrompt, userMessage) {
  try {
    const result = await client.models.generateContent({
      model: 'gemini-2.5-pro-preview-03-25',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
        },
      ],
      config: {
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 1500,
      },
    });

    // Try multiple response paths
    const text =
      result?.candidates?.[0]?.content?.parts?.map(p => p.text || '').filter(Boolean).join('\n') ||
      result?.text ||
      result?.response?.text?.() ||
      null;

    if (!text) {
      console.error('Gemini: empty response, raw:', JSON.stringify(result).slice(0, 300));
      return 'Gemini: Pas de réponse (vérifier clé API ou quota).';
    }

    return text.trim();
  } catch (error) {
    console.error('Gemini error:', error.message);
    return `Gemini: Erreur — ${error.message}`;
  }
}
