const { Mistral } = require('@mistralai/mistralai');

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function callModel(systemPrompt, userMessage) {
  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    maxTokens: 1024,
  });
  return response.choices[0].message.content;
}

module.exports = { callModel };
