import express from 'express';
import { checkSubscription } from '../middleware/subscription.js';
import { safeCall } from '../utils/safeCall.js';
import * as anthropic from '../services/anthropic.js';
import * as gemini from '../services/gemini.js';
import * as mistral from '../services/mistral.js';
import * as openai from '../services/openai.js';
import { advisoryPersonas } from '../personas/advisory.js';

const router = express.Router();

router.post('/compare', checkSubscription, async (req, res) => {
  try {
    const { etfs = [], profile, horizon, amount } = req.body;

    if (!Array.isArray(etfs) || !etfs.length) {
      return res.status(400).json({ error: 'etfs is required' });
    }

    const etfList = etfs.map((etf) => `${etf.name} (${etf.ticker || etf.isin || 'N/A'})`).join(', ');
    const userMsg = `Compare ces ETFs pour un profil ${profile}, horizon ${horizon}, montant ${amount}€: ${etfList}.
Analyse: performance, TER, tracking error, liquidité, fiscalité belge, recommandation finale.`;

    const calls = [
      safeCall(() => anthropic.callModel(advisoryPersonas.claude, userMsg), 'Claude'),
      safeCall(() => gemini.callModel(advisoryPersonas.gemini, userMsg), 'Gemini'),
      safeCall(() => mistral.callModel(advisoryPersonas.mistral, userMsg), 'Mistral'),
    ];

    const [claudeRes, geminiRes, mistralRes] = await Promise.all(calls);
    const responses = { claude: claudeRes, gemini: geminiRes, mistral: mistralRes };

    const synthPrompt = `Tu es un analyste ETF senior. Synthétise ces 3 analyses en recommandation finale.
STRUCTURE: 1. Consensus 2. Divergences 3. ETF recommandé avec justification 4. Disclaimer MiFID II.
Réponds en français.`;
    const synthesis = await safeCall(
      () => openai.callModel(synthPrompt, JSON.stringify(responses).slice(0, 2000)),
      'Synthesis'
    );

    return res.json({ responses, synthesis });
  } catch (error) {
    console.error('[etf] Error:', error.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
