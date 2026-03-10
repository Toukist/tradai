const Anthropic = require('@anthropic-ai/sdk');

async function callModel(systemPrompt, userMessage) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  return message.content[0].text;
}

module.exports = { callModel };
