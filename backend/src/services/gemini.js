const { GoogleGenAI } = require('@google/genai');

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function callModel(systemPrompt, userMessage) {
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-pro-preview-03-25',
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 2000,
      },
    });

    const text = response.candidates?.[0]?.content?.parts
      ?.map(p => p.text || '')
      .join('\n');

    return text?.trim() || 'Aucune réponse générée.';
  } catch (error) {
    console.error('Gemini error:', error.message);
    return `Gemini: Erreur — ${error.message}`;
  }
}

module.exports = { callModel };
