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

function buildSynthesisPayload(results) {
  return results.map((result) => `${result.modelId}: ${String(result.text).slice(0, 450)}`).join('\n\n');
}

router.post('/', checkSubscription, async (req, res) => {
  try {
    const { question, market = 'global' } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    const services = marketServices[market] || marketServices.global;
    const personas = marketPersonas[market] || marketPersonas.global;

    const calls = Object.entries(services).map(([modelId, service]) =>
      safeCall(() => service.callModel(personas[modelId], question), modelId)
        .then((text) => ({ modelId, text }))
    );

    const results = await Promise.all(calls);
    const responses = {};
    results.forEach((result) => {
      responses[result.modelId] = result.text;
    });

    const synthPrompt = `Tu es un directeur de trading desk — arbitre senior.
Tu reçois 3 analyses d'AIs sur une question de trading.
RÈGLE : Toujours une conclusion actionnable. Jamais de "il faudrait plus d'info".
STRUCTURE OBLIGATOIRE:
1. 📡 CONSENSUS — ce sur quoi toutes les AIs s'accordent
2. ⚔️ DIVERGENCES — où elles diffèrent et pourquoi
3. 🏆 MEILLEUR SETUP — le trade le plus convaincant
4. 🔑 VERDICT FINAL — entrée, stop, target, conviction /10
Réponds en français.`;

    const synthMessage = `Question: "${question}"\n\n${buildSynthesisPayload(results)}`;
    const synthesis = await safeCall(() => openai.callModel(synthPrompt, synthMessage), 'Synthesis');

    return res.json({ responses, synthesis, market });
  } catch (error) {
    console.error('[debate] Error:', error.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
