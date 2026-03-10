const OpenAI = require('openai');

async function callModel(systemPrompt, userMessage) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 1024,
  });
  return response.choices[0].message.content;
}

module.exports = { callModel };
