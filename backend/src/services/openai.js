const OpenAI = require('openai');

async function callModel(systemPrompt, userMessage) {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const freshnessHint = [
      `Date actuelle UTC: ${new Date().toISOString()}`,
      'Utilise obligatoirement la recherche web pour récupérer les données les plus récentes.',
      'Si un prix, une date, un consensus ou un catalyseur n est pas vérifié via le web, indique-le explicitement au lieu de l inventer.',
    ].join('\n');

    const response = await client.responses.create({
      model: 'gpt-4o',
      tools: [{ type: 'web_search_preview' }],
      instructions: systemPrompt,
      input: `${freshnessHint}\n\n${userMessage}`,
      max_output_tokens: 900,
    });

    return response.output_text?.trim() || 'Aucune réponse générée.';
  } catch (error) {
    console.error('OpenAI error:', error.message);
    return `OpenAI: Erreur — ${error.message}`;
  }
}

module.exports = { callModel };
