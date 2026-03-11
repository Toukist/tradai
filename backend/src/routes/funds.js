import express from 'express';
import { checkSubscription } from '../middleware/subscription.js';
import { safeCall } from '../utils/safeCall.js';
import * as anthropic from '../services/anthropic.js';
import * as gemini from '../services/gemini.js';
import * as mistral from '../services/mistral.js';
import * as openai from '../services/openai.js';
import { advisoryPersonas } from '../personas/advisory.js';

const router = express.Router();

router.post('/analyze', checkSubscription, async (req, res) => {
  try {
    const { funds = [], profile, horizon, amount, question } = req.body;

    if (!Array.isArray(funds) || !funds.length) {
      return res.status(400).json({ error: 'funds is required' });
    }

    const fundList = funds.map((fund) => `${fund.name} (${fund.isin || 'ISIN non précisé'})`).join(', ');
    const userMsg = question || `Analyse ces fonds d'investissement pour profil ${profile}, horizon ${horizon}, montant ${amount}€: ${fundList}.
Inclus: performance historique, frais, rating Morningstar, gestionnaire, alternative recommandée.`;

    const calls = [
      safeCall(() => anthropic.callModel(advisoryPersonas.claude, userMsg), 'Claude'),
      safeCall(() => gemini.callModel(advisoryPersonas.gemini, userMsg), 'Gemini'),
      safeCall(() => mistral.callModel(advisoryPersonas.mistral, userMsg), 'Mistral'),
    ];

    const [claudeRes, geminiRes, mistralRes] = await Promise.all(calls);
    const responses = { claude: claudeRes, gemini: geminiRes, mistral: mistralRes };

    const synthPrompt = `Tu es un fund selector senior. Synthétise ces 3 analyses.
STRUCTURE: 1. Consensus 2. Points divergents 3. Recommandation finale 4. Disclaimer MiFID II.
Réponds en français.`;
    const synthesis = await safeCall(
      () => openai.callModel(synthPrompt, JSON.stringify(responses).slice(0, 2000)),
      'Synthesis'
    );

    return res.json({ responses, synthesis });
  } catch (error) {
    console.error('[funds/analyze] Error:', error.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/switch', checkSubscription, async (req, res) => {
  try {
    const { currentFund, targetFunds, reason, profile } = req.body;

    if (!currentFund) {
      return res.status(400).json({ error: 'currentFund is required' });
    }

    const userMsg = `Un client avec profil ${profile} veut switcher depuis "${currentFund}".
Raison: ${reason || 'optimisation'}.
Fonds cibles envisagés: ${targetFunds?.join(', ') || 'à identifier'}.
Analyse: est-ce pertinent ? Vers quoi switcher ? Timing optimal ? Impact fiscal en Belgique ?`;

    const calls = [
      safeCall(() => anthropic.callModel(advisoryPersonas.claude, userMsg), 'Claude'),
      safeCall(() => gemini.callModel(advisoryPersonas.gemini, userMsg), 'Gemini'),
      safeCall(() => mistral.callModel(advisoryPersonas.mistral, userMsg), 'Mistral'),
    ];

    const [claudeRes, geminiRes, mistralRes] = await Promise.all(calls);
    const responses = { claude: claudeRes, gemini: geminiRes, mistral: mistralRes };

    const synthPrompt = `Tu es un expert en switch de fonds. Synthétise en recommandation de switch actionnable.
STRUCTURE: 1. Consensus sur le switch 2. Meilleur fonds cible 3. Timing 4. Impact fiscal Belgique 5. Disclaimer MiFID II.
Réponds en français.`;
    const synthesis = await safeCall(
      () => openai.callModel(synthPrompt, JSON.stringify(responses).slice(0, 2000)),
      'Synthesis'
    );

    return res.json({ responses, synthesis });
  } catch (error) {
    console.error('[funds/switch] Error:', error.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
