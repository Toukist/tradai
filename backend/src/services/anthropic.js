const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function callModel(systemPrompt, userMessage) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: systemPrompt,
    tools: [{ type: 'web_search_20260209', name: 'web_search' }],
    messages: [{ role: 'user', content: userMessage }],
  });

  // First pass — collect text blocks
  let fullText = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n');

  // If Claude used the web search tool, do a follow-up call to get the final answer
  if (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
    const toolResults = toolUseBlocks.map(block => ({
      type: 'tool_result',
      tool_use_id: block.id,
      content: 'Search executed successfully.',
    }));

    const followUp = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      tools: [{ type: 'web_search_20260209', name: 'web_search' }],
      messages: [
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ],
    });

    fullText = followUp.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');
  }

  return fullText.trim() || 'Aucune réponse générée.';
}

module.exports = { callModel };
