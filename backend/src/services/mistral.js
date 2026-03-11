import { Mistral } from '@mistralai/mistralai';

function getClient() {
  return new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
}

export async function callModel(systemPrompt, userMessage) {
  try {
    const client = getClient();
    const response = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      maxTokens: 1200,
    });

    return response.choices[0]?.message?.content?.trim() || 'Aucune réponse générée.';
  } catch (error) {
    console.error('Mistral error:', error.message);
    return `Mistral: Erreur — ${error.message}`;
  }
}
