import express from 'express';
import { checkSubscription } from '../middleware/subscription.js';
import { safeCall } from '../utils/safeCall.js';
import * as anthropic from '../services/anthropic.js';
import * as gemini from '../services/gemini.js';
import * as mistral from '../services/mistral.js';
import * as openai from '../services/openai.js';
import { advisoryPersonas } from '../personas/advisory.js';

const router = express.Router();

router.post('/', checkSubscription, async (req, res) => {
  try {
    const { profile, funds = [], question } = req.body;
    if (!profile || !Array.isArray(funds) || !funds.length) {
      return res.status(400).json({ error: 'Les champs profile et funds sont requis.' });
    }

    const fundLines = funds
      .map((fund) => `- ${fund.name} (${fund.ticker || fund.isin || fund.type || 'N/A'}): ${fund.pct || 0}%`)
      .join('\n');

    const userMsg = question || `Analyse ce portefeuille pour un profil ${profile.risk || profile}, horizon ${profile.horizon || 'non précisé'}, montant ${profile.amount || 'N/A'} ${profile.currency || 'EUR'}.
Portefeuille:\n${fundLines}

Analyse demandée : performance, cohérence d'allocation, concentration, alternatives, angle fiscal belge, priorités d'action.`;

    const calls = [
      safeCall(() => anthropic.callModel(advisoryPersonas.claude, userMsg), 'Claude'),
      safeCall(() => gemini.callModel(advisoryPersonas.gemini, userMsg), 'Gemini'),
      safeCall(() => mistral.callModel(advisoryPersonas.mistral, userMsg), 'Mistral'),
    ];

    const [claudeRes, geminiRes, mistralRes] = await Promise.all(calls);
    const responses = { claude: claudeRes, gemini: geminiRes, mistral: mistralRes };

    const synthPrompt = `Tu es un directeur advisory desk senior, expert en construction de portefeuille.
Tu reçois 3 analyses d'AIs sur un portefeuille client et tu dois les consolider.

RÈGLES ABSOLUES :
- Utilise UNIQUEMENT les données des 3 analyses fournies
- Reprends les chiffres : allocations %, performance, corrélations, ratios
- Si les AIs divergent sur le diagnostic, identifie pourquoi (hypothèses de marché différentes)
- Priorise les actions concrètes que le conseiller peut présenter au client

STRUCTURE OBLIGATOIRE :
1. 📊 DIAGNOSTIC CONSOLIDÉ — forces et faiblesses du portefeuille identifiées par les 3 AIs
2. ⚖️ ANALYSE RISQUE — concentration, corrélation, drawdown max estimé, Sharpe du portefeuille, exposition factorielle
3. ⚔️ DIVERGENCES — où les AIs ne sont pas d'accord et pourquoi
4. 🏆 TOP 3 ACTIONS PRIORITAIRES
   • Action 1 : [précise, chiffrée, avec instrument exact]
   • Action 2 : [précise]
   • Action 3 : [précise]
5. 💶 IMPACT FISCAL — coût fiscal des réallocations proposées (TOB, PM, plus-values)
6. ⚠️ DISCLAIMER MiFID II

Réponds en français. Sois concret et immédiatement actionnable.`;

    const synthesis = await safeCall(
      () => openai.callModel(synthPrompt, `Voici les 3 analyses à synthétiser :\n\nCLAUDE:\n${claudeRes}\n\nGEMINI:\n${geminiRes}\n\nMISTRAL:\n${mistralRes}`),
      'Synthesis'
    );

    return res.json({ responses, synthesis });
  } catch (error) {
    console.error('[portfolio] Error:', error.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
