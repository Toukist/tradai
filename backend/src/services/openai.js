import OpenAI from 'openai';

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function callModel(systemPrompt, userMessage) {
  try {
    const client = getClient();
    const freshnessHint = [
      `Date et heure actuelles UTC: ${new Date().toISOString()}`,
      'IMPORTANT: Tu DOIS utiliser la recherche web pour recuperer les donnees de marche les plus recentes avant de repondre.',
      'Cherche les prix, indices, actualites et evenements du jour. Ne te base pas sur des donnees anterieures.',
      'Si une donnee de marche n est pas verifiee via le web, indique [estime] au lieu de l inventer.',
    ].join('\n');

    const response = await client.responses.create({
      model: 'gpt-4o',
      tools: [{ type: 'web_search_preview' }],
      instructions: systemPrompt,
      input: `${freshnessHint}\n\n${userMessage}`,
      max_output_tokens: 1500,
    });

    return response.output_text?.trim() || 'Aucune réponse générée.';
  } catch (error) {
    console.error('OpenAI error:', error.message);
    return `GPT: Erreur — ${error.message}`;
  }
}
