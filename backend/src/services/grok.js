const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

async function callModel(systemPrompt, userMessage) {
  const response = await client.chat.completions.create({
    model: 'grok-3',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 1024,
  });
  return response.choices[0].message.content;
}

module.exports = { callModel };
