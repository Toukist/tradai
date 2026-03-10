const { GoogleGenAI } = require('@google/genai');

async function callModel(systemPrompt, userMessage) {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await client.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 1024,
    },
  });
  return response.text;
}

module.exports = { callModel };
