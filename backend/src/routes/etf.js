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

    const synthPrompt = `Tu es un analyste ETF senior sur un advisory desk institutionnel.
Tu reçois 3 analyses d'AIs sur des ETFs et tu dois les synthétiser en une recommandation unique.

RÈGLES ABSOLUES :
- Utilise UNIQUEMENT les données des 3 analyses fournies, ne fabrique rien
- Reprends les chiffres exacts : TER, performance, tracking error, AUM, Sharpe, drawdown
- Si les AIs divergent, explique pourquoi (méthodologie, horizon, pondération des critères)
- Toujours inclure l'angle fiscal belge (TOB applicable, précompte mobilier)

STRUCTURE OBLIGATOIRE :
1. 📊 CONSENSUS — sur quoi les 3 AIs convergent (meilleur ETF, tendance, benchmark)
2. ⚔️ DIVERGENCES — points de désaccord et qui a la meilleure donnée
3. 🏆 ETF RECOMMANDÉ — l'ETF gagnant avec justification multicritère (performance, coût, risque, fiscal)
   • ISIN et nom exact
   • TER et coût total estimé
   • Performance vs benchmark (1Y/3Y/5Y)
   • Sharpe ratio et drawdown max
   • Fiscalité belge applicable (TOB, PM)
   • Courtier belge recommandé
4. 🔄 ALTERNATIVE — ETF backup si le premier n'est pas accessible
5. ⚠️ DISCLAIMER MiFID II — rappel réglementaire

Réponds en français. Sois précis et chiffré.`;
    const synthesis = await safeCall(
      () => openai.callModel(synthPrompt, `Voici les 3 analyses à synthétiser :\n\nCLAUDE:\n${claudeRes}\n\nGEMINI:\n${geminiRes}\n\nMISTRAL:\n${mistralRes}`),
      'Synthesis'
    );

    return res.json({ responses, synthesis });
  } catch (error) {
    console.error('[etf] Error:', error.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
