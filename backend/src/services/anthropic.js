import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function callModel(systemPrompt, userMessage) {
  const client = getClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: systemPrompt,
    tools: [{ type: 'web_search_20260209', name: 'web_search' }],
    messages: [{ role: 'user', content: userMessage }],
  });

  let fullText = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  if (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter((block) => block.type === 'tool_use');
    const toolResults = toolUseBlocks.map((block) => ({
      type: 'tool_result',
      tool_use_id: block.id,
      content: 'Search executed.',
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
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');
  }

  return fullText.trim() || 'Aucune réponse générée.';
}
