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

    const synthPrompt = `Tu es un fund selector senior sur un advisory desk institutionnel.
Tu reçois 3 analyses d'AIs sur des fonds d'investissement et tu dois les synthétiser.

RÈGLES ABSOLUES :
- Utilise UNIQUEMENT les données des 3 analyses fournies
- Reprends les chiffres : performance, frais, rating, AUM, volatilité
- Si les AIs divergent, identifie qui a la donnée la plus fiable
- Angle fiscal belge obligatoire

STRUCTURE OBLIGATOIRE :
1. 📊 CONSENSUS — accord des 3 AIs (meilleur fonds, tendances, benchmark)
2. ⚔️ DIVERGENCES — désaccords et analyse de qui a raison
3. 🏆 RECOMMANDATION FINALE
   • Fonds recommandé (ISIN, nom, gestionnaire)
   • Performance vs benchmark et vs pairs
   • Frais totaux (TER, entry/exit, transaction costs)
   • Rating Morningstar et analyse qualitative
   • Fiscalité belge (PM sur revenus, TOB, taxe Reynders si applicable)
4. 🔄 ALTERNATIVE — fonds backup
5. ⚠️ DISCLAIMER MiFID II

Réponds en français. Sois précis et chiffré.`;
    const synthesis = await safeCall(
      () => openai.callModel(synthPrompt, `Voici les 3 analyses à synthétiser :\n\nCLAUDE:\n${claudeRes}\n\nGEMINI:\n${geminiRes}\n\nMISTRAL:\n${mistralRes}`),
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

    const synthPrompt = `Tu es un expert en switch de fonds sur un advisory desk, spécialisé en optimisation de portefeuille.
Tu reçois 3 analyses d'AIs sur une opération de switch et tu dois les synthétiser en une recommandation claire.

RÈGLES ABSOLUES :
- Utilise UNIQUEMENT les données des 3 analyses fournies
- Reprends les chiffres : frais de switch, impact fiscal, performance comparative
- Quantifie toujours le coût total de l'opération vs le bénéfice attendu
- Angle fiscal belge obligatoire (coût TOB achat+vente, PM, timing fiscal)

STRUCTURE OBLIGATOIRE :
1. 📊 CONSENSUS SUR LE SWITCH — les 3 AIs recommandent-elles le switch ? Score /3
2. 🏆 MEILLEUR FONDS CIBLE
   • Nom et ISIN
   • Performance vs le fonds actuel (1Y/3Y/5Y)
   • Frais comparés (TER, entry/exit)
   • Avantage principal justifiant le switch
3. ⏱️ TIMING — moment optimal pour exécuter (immédiat, attendre ex-date, fin de trimestre)
4. 💶 IMPACT FISCAL BELGIQUE — coût total du switch : TOB sortie + TOB entrée + PM impact + taxe Reynders si applicable
5. ✅ VERDICT — GO/NO-GO avec justification chiffrée (coût total vs gain attendu sur l'horizon)
6. ⚠️ DISCLAIMER MiFID II

Réponds en français. Sois chiffré et concret.`;
    const synthesis = await safeCall(
      () => openai.callModel(synthPrompt, `Voici les 3 analyses à synthétiser :\n\nCLAUDE:\n${claudeRes}\n\nGEMINI:\n${geminiRes}\n\nMISTRAL:\n${mistralRes}`),
      'Synthesis'
    );

    return res.json({ responses, synthesis });
  } catch (error) {
    console.error('[funds/switch] Error:', error.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
