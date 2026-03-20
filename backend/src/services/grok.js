import OpenAI from 'openai';

function getClient() {
  return new OpenAI({ apiKey: process.env.GROK_API_KEY, baseURL: 'https://api.x.ai/v1' });
}

export async function callModel(systemPrompt, userMessage) {
  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: 'grok-3',
      messages: [
        { role: 'system', content: `${systemPrompt}\n\nDate et heure actuelles UTC: ${new Date().toISOString()}. Utilise tes connaissances les plus recentes et les donnees X/Twitter temps reel pour fournir une analyse a jour.` },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1500,
    });

    return response.choices[0]?.message?.content?.trim() || 'Aucune réponse générée.';
  } catch (error) {
    console.error('Grok error:', error.message);
    return `Grok: Erreur — ${error.message}`;
  }
}
