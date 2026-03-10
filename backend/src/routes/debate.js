const express = require('express');
const router = express.Router();
const { callModel: callClaude } = require('../services/anthropic');
const { callModel: callGPT } = require('../services/openai');
const { callModel: callGemini } = require('../services/gemini');
const { callModel: callGrok } = require('../services/grok');
// const { callModel: callMistral } = require('../services/mistral'); // désactivé temporairement

const SYSTEM_PROMPTS = {
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
    const { question, models = ['claude', 'gpt54', 'gemini', 'grok'] } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Le champ "question" est requis.' });
    }

    // Call all selected models in parallel
    const callPromises = models.map(async (modelId) => {
      const caller = MODEL_CALLERS[modelId];
      if (!caller) return [modelId, `Modèle "${modelId}" inconnu.`];
      try {
        const response = await caller(SYSTEM_PROMPTS[modelId], question);
        return [modelId, response];
      } catch (err) {
        return [modelId, `Erreur: ${err.message}`];
      }
    });

    const results = await Promise.all(callPromises);
    const responses = Object.fromEntries(results);

    // Build synthesis prompt
    const responsesText = results
      .map(([id, text]) => `**${id.toUpperCase()}**: ${text}`)
      .join('\n\n---\n\n');

    const synthesisSystem =
      "Tu es un analyste financier senior et arbitre IA. Analyse ces réponses, identifie les consensus, divergences clés, et insights uniques de chacun. Fournis la meilleure réponse consolidée en français avec cette structure:\n1. Points de consensus\n2. Divergences clés\n3. Synthèse finale actionnable";

    const synthesisUser = `Question posée: ${question}\n\nRéponses des modèles:\n\n${responsesText}`;

    const synthesis = await callClaude(synthesisSystem, synthesisUser);

    return res.json({ responses, synthesis });
  } catch (err) {
    console.error('[debate] Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
