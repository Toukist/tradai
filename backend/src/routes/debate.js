import express from 'express';
import { checkSubscription } from '../middleware/subscription.js';
import { safeCall } from '../utils/safeCall.js';
import * as anthropic from '../services/anthropic.js';
import * as openai from '../services/openai.js';
import * as gemini from '../services/gemini.js';
import * as grok from '../services/grok.js';
import * as mistral from '../services/mistral.js';
import { globalPersonas, nasdaqPersonas, europeanPersonas } from '../personas/trading.js';

const router = express.Router();

const marketServices = {
  global: { claude: anthropic, gemini, gpt54: openai },
  nasdaq: { grok, gpt54: openai, claude: anthropic },
  european: { mistral, claude: anthropic, gemini },
};

const marketPersonas = {
  global: globalPersonas,
  nasdaq: nasdaqPersonas,
  european: europeanPersonas,
};

const marketLabels = {
  global: 'Marché mondial',
  nasdaq: 'Nasdaq / US',
  european: 'Marché européen',
};

function normalizePromptContext(body = {}) {
  const promptPresetId = typeof body.promptPresetId === 'string' ? body.promptPresetId.trim().slice(0, 80) : '';
  const promptPresetLabel = typeof body.promptPresetLabel === 'string' ? body.promptPresetLabel.trim().slice(0, 120) : '';

  return {
    id: promptPresetId,
    label: promptPresetLabel,
  };
}

function buildSynthesisFocus(promptContext) {
  const source = `${promptContext.id} ${promptContext.label}`.toLowerCase();

  if (source.includes('long-term') || source.includes('long terme')) {
    return 'Angle demandé : investissement long terme. Le verdict final doit privilégier la thèse, l’horizon, les zones de construction de position et les risques de portefeuille plutôt qu’un simple trade intraday.';
  }

  if (source.includes('evening') || source.includes('soir')) {
    return 'Angle demandé : catalyseur du soir. Mets l’accent sur l’annonce attendue, le timing after-hours ou prochaine ouverture et le plan d’exécution immédiat.';
  }

  if (source.includes('week') || source.includes('semaine')) {
    return 'Angle demandé : catalyseur de la semaine. Mets l’accent sur l’événement dominant des prochains jours et le plan de trade sur 3 à 5 séances.';
  }

  if (source.includes('rotation')) {
    return 'Angle demandé : rotation sectorielle. Le verdict final doit identifier le secteur leader, le secteur faible et l’expression la plus exploitable.';
  }

  if (source.includes('options') || source.includes('squeeze')) {
    return 'Angle demandé : flux spéculatifs. Mets l’accent sur le momentum, le catalyseur, le risque de squeeze et la gestion du risque.';
  }

  return 'Angle demandé : opportunité de marché actionnable. Garde un verdict final concret avec niveau d’entrée, invalidation et objectif principal.';
}

router.post('/', checkSubscription, async (req, res) => {
  try {
    const { question, market = 'global' } = req.body;
    const promptContext = normalizePromptContext(req.body);
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    const services = marketServices[market] || marketServices.global;
    const personas = marketPersonas[market] || marketPersonas.global;

    // Call 3 AIs in parallel
    const calls = Object.entries(services).map(([modelId, service]) =>
      safeCall(
        () => service.callModel(personas[modelId], question),
        modelId
      ).then(text => ({ modelId, text: text || `${modelId}: pas de réponse` }))
    );

    const results = await Promise.all(calls);

    // Build responses - ensure no undefined values
    const responses = {};
    results.forEach(r => {
      responses[r.modelId] = r.text || `${r.modelId}: pas de réponse`;
    });

    // Log for debugging
    console.log('Responses collected:', Object.keys(responses).map(k => `${k}: ${responses[k].length} chars`));

    // Build a rich synthesis message with all 3 responses clearly labeled
    const synthMessage = `
Tu dois synthétiser ces 3 réponses d'analystes IA. 
UTILISE UNIQUEMENT le contenu ci-dessous. Ne fais PAS de recherche.
Ne dis JAMAIS que les infos ne sont pas disponibles — elles sont là, lis-les.

  === CONTEXTE DE LA DEMANDE ===
  Marché : ${marketLabels[market] || marketLabels.global}
  Angle choisi : ${promptContext.label || 'Question libre'}

=== QUESTION POSÉE ===
${question}

=== RÉPONSE CLAUDE ===
${responses.claude || responses.gpt54 || 'Non disponible'}

=== RÉPONSE GPT ===
${responses.gpt54 || responses.grok || 'Non disponible'}

=== RÉPONSE GEMINI/MISTRAL ===
${responses.gemini || responses.mistral || 'Non disponible'}

Synthétise maintenant ces 3 réponses en suivant la structure obligatoire.
Les données sont dans les réponses ci-dessus — extrais-les et compile-les.
`;

  const synthSystemPrompt = `Tu es un directeur de trading desk — arbitre senior.
Tu reçois 3 analyses d'AIs et tu dois les synthétiser.

RÈGLES ABSOLUES :
- Utilise UNIQUEMENT le contenu des 3 réponses fournies
- Ne fais PAS de recherche web — les données sont déjà là
- Ne dis JAMAIS "informations non disponibles" — si une IA l'a trouvé, utilise-le
- Reprends les tickers, prix, niveaux exacts mentionnés dans les réponses
- Si une réponse est vide ou en erreur, ignore-la et synthétise les autres
- Adapte la synthèse à l'angle demandé par l'utilisateur
- ${buildSynthesisFocus(promptContext)}

STRUCTURE OBLIGATOIRE :
1. 📡 CONSENSUS — sur quoi toutes les AIs s'accordent (liste les points)
2. ⚔️ DIVERGENCES — où elles diffèrent (sois précis)
3. 🏆 MEILLEUR SETUP — le trade/info le plus concret et actionnable
4. 🔑 VERDICT FINAL — entrée, stop, target (repris des réponses), conviction /10

Réponds en français. Sois concret et direct.`;

    // Call Claude WITHOUT web search for synthesis
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const synthClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const synthResponse = await synthClient.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: synthSystemPrompt,
      messages: [{ role: 'user', content: synthMessage }],
      // NO tools here — synthesis must use provided content only
    });

    const synthesis = synthResponse.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim() || 'Synthèse indisponible.';

    return res.json({ responses, synthesis, market, promptContext });
  } catch (error) {
    console.error('[debate] Error:', error.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
