const express = require('express');
const router = express.Router();
const { callModel: callClaude } = require('../services/anthropic');
const { callModel: callGPT } = require('../services/openai');
const { callModel: callGemini } = require('../services/gemini');
const { callModel: callGrok } = require('../services/grok');
// const { callModel: callMistral } = require('../services/mistral'); // désactivé temporairement

async function safeCall(fn, modelName) {
  try {
    return await fn();
  } catch (error) {
    console.error(`${modelName} error:`, error.message);
    return `${modelName}: Erreur — ${error.message}`;
  }
}

const BASE_PROMPTS = {
  claude: `Tu es Claude — analyste senior d'un hedge fund avec accès web temps réel.

RÈGLE ABSOLUE : Tu ne demandes JAMAIS de précision à l'utilisateur.
Si aucun ticker n'est mentionné → tu cherches toi-même sur le web et tu présentes
les meilleures opportunités du moment. Tu es proactif, jamais passif.
Réponds en français.`,

  gpt54: `Tu es GPT — quant trader senior avec accès web temps réel.

RÈGLE ABSOLUE : Jamais de "donnez-moi le ticker". Si aucun actif n'est cité,
tu scannes le marché toi-même et présentes les setups les plus chauds du moment.
Réponds en français.`,

  gemini: `Tu es Gemini — macro strategist avec Google Search temps réel.

RÈGLE ABSOLUE : Si aucun ticker n'est mentionné, utilise Google Search pour
trouver les catalyseurs du jour. Ne demande jamais de précision — cherche et présente.
Réponds en français.`,

  grok: `Tu es Grok — trader avec accès X/Twitter et données sentiment temps réel.

RÈGLE ABSOLUE : Jamais de question en retour. Si pas de ticker → tu scannes
X/Twitter et les marchés MAINTENANT et tu présentes ce qui buzz et pourquoi.
Réponds en français.`,
};

const PORTFOLIO_ADDON = `
Pour l'analyse de portefeuille, recherche en temps réel :
- Performance récente de chaque fonds/ETF mentionné
- Comparaison avec les benchmarks actuels
- Actualité des secteurs représentés
- Taux actuels, spreads, contexte macro du moment

STRUCTURE OBLIGATOIRE :
1. 📡 DONNÉES TEMPS RÉEL — performance et contexte actuel des positions
2. 🔍 DIAGNOSTIC — forces, faiblesses, doublons, surexpositions
3. ⚖️ COHÉRENCE — adéquation profil de risque / horizon / allocation
4. 🔄 SWITCHES SUGGÉRÉS — alternatives concrètes et justifiées
5. 🔑 PRIORITÉS — les 2-3 actions les plus urgentes

Termine par :
⚠️ Ces pistes de réflexion ne constituent pas un conseil en investissement
au sens de MiFID II. Consultez votre conseiller financier agréé avant toute décision.`;

const SYNTHESIS_PROMPT = `Tu es un arbitre IA senior — directeur de trading desk.
Jamais de "il faudrait plus d'info" — toujours une conclusion actionnable.

STRUCTURE OBLIGATOIRE :
1. ✅ CONSENSUS — points sur lesquels tous les modèles s'accordent
2. ⚔️ DIVERGENCES — où ils diffèrent et pourquoi
3. 🔍 DIAGNOSTIC CONSOLIDÉ
   Forces : ...
   Faiblesses / Risques : ...
4. 🔄 TOP 3 ACTIONS PRIORITAIRES
5. 🎯 VERDICT — Allocation : Adaptée / À revoir / Urgente révision

⚠️ Ces pistes de réflexion ne constituent pas un conseil en investissement
au sens de MiFID II. Consultez votre conseiller financier agréé avant toute décision.`;

const MODEL_CALLERS = {
  claude: callClaude,
  gpt54: callGPT,
  gemini: callGemini,
  grok: callGrok,
};

router.post('/', async (req, res) => {
  try {
    const { profile, funds } = req.body;

    if (!profile || !funds) {
      return res.status(400).json({ error: 'Les champs "profile" et "funds" sont requis.' });
    }

    // Build portfolio summary string
    const fundsText = funds
      .map(
        (f) =>
          `- ${f.name} (${f.type}): ${f.pct}% — perf 1an: ${f.perf1y !== undefined ? f.perf1y + '%' : 'N/A'}`
      )
      .join('\n');

    const portfolioSummary = `Profil investisseur:
- Risque: ${profile.risk}
- Horizon: ${profile.horizon}
- Montant: ${profile.amount} ${profile.currency}

Portefeuille actuel:
${fundsText}

Total alloué: ${funds.reduce((acc, f) => acc + (parseFloat(f.pct) || 0), 0)}%`;

    const allModels = ['claude', 'gpt54', 'gemini', 'grok'];

    // Call all models in parallel with augmented system prompts
    const callPromises = allModels.map((modelId) =>
      safeCall(
        () => MODEL_CALLERS[modelId](BASE_PROMPTS[modelId] + PORTFOLIO_ADDON, portfolioSummary),
        modelId
      ).then((response) => [modelId, response])
    );

    const results = await Promise.all(callPromises);
    const responses = Object.fromEntries(results);

    // Tronquer chaque réponse à 600 chars pour limiter les tokens envoyés à Claude
    const responsesText = results
      .map(([id, text]) => `=== ${id.toUpperCase()} ===\n${text.slice(0, 600)}`)
      .join('\n\n');

    // Délai pour éviter le rate limit (Claude appelé 2x dans la même requête)
    await new Promise(r => setTimeout(r, 2000));

    const synthesisUser = `Portefeuille:\n${portfolioSummary}\n\nAnalyses (résumées):\n\n${responsesText}`;

    const synthesis = await safeCall(
      () => callClaude(SYNTHESIS_PROMPT, synthesisUser),
      'Synthesis'
    );

    return res.json({ responses, synthesis });
  } catch (err) {
    console.error('[portfolio] Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
