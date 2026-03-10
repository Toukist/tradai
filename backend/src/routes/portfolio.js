const express = require('express');
const router = express.Router();
const { callModel: callClaude } = require('../services/anthropic');
const { callModel: callGPT } = require('../services/openai');
const { callModel: callGemini } = require('../services/gemini');
const { callModel: callGrok } = require('../services/grok');
// const { callModel: callMistral } = require('../services/mistral'); // désactivé temporairement

const PORTFOLIO_ADDON =
  "\nPour l'analyse de portefeuille:\n1. Identifie les forces et faiblesses de l'allocation\n2. Détecte les doublons ou surexpositions sectorielles\n3. Évalue la cohérence avec le profil de risque et l'horizon\n4. Suggère des pistes de switch ou rééquilibrage\nTermine TOUJOURS par: ⚠️ Ces pistes de réflexion ne constituent pas un conseil en investissement au sens de MiFID II. Consultez votre conseiller financier agréé avant toute décision.";

const BASE_PROMPTS = {
  claude:
    "Tu es Claude par Anthropic — analytique, nuancé, rigoureux, avec des considérations éthiques. Réponds en 2-3 paragraphes structurés. Sois direct et précis.",
  gpt54:
    "Tu es GPT-4o par OpenAI — confiant, assertif, orienté action, avec une structure logique claire. Réponds en 2-3 paragraphes. Sois direct et précis.",
  gemini:
    "Tu es Gemini par Google — axé sur les données, conscient des tendances macro, quantitatif, références au contexte marché mondial. Réponds en 2-3 paragraphes. Sois direct et précis.",
  grok:
    "Tu es Grok par xAI — contrarian, incisif, attentif au sentiment de marché et aux signaux sociaux en temps réel. Ton direct et percutant. 2-3 paragraphes en français.",
};

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
    const callPromises = allModels.map(async (modelId) => {
      const caller = MODEL_CALLERS[modelId];
      const systemPrompt = BASE_PROMPTS[modelId] + PORTFOLIO_ADDON;
      try {
        const response = await caller(systemPrompt, portfolioSummary);
        return [modelId, response];
      } catch (err) {
        return [modelId, `Erreur: ${err.message}`];
      }
    });

    const results = await Promise.all(callPromises);
    const responses = Object.fromEntries(results);

    // Synthesis
    const responsesText = results
      .map(([id, text]) => `**${id.toUpperCase()}**: ${text}`)
      .join('\n\n---\n\n');

    const synthesisSystem =
      "Tu es un analyste financier senior et arbitre IA. Analyse ces réponses, identifie les consensus, divergences clés, et insights uniques de chacun. Fournis la meilleure réponse consolidée en français avec cette structure:\n1. Points de consensus\n2. Divergences clés\n3. Synthèse finale actionnable";

    const synthesisUser = `Analyse de portefeuille:\n\n${portfolioSummary}\n\nRéponses des modèles:\n\n${responsesText}`;

    const synthesis = await callClaude(synthesisSystem, synthesisUser);

    return res.json({ responses, synthesis });
  } catch (err) {
    console.error('[portfolio] Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
