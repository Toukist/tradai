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
  global: 'Marche mondial',
  nasdaq: 'Nasdaq / US',
  european: 'Marche europeen',
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
    return 'Angle : investissement long terme (3-12 mois). Privilegie la these structurelle, les forces macro, les meilleurs instruments (ETFs/actions), les zones de construction de position, le drawdown acceptable et les risques de portefeuille. Ne propose PAS un trade intraday.';
  }

  if (source.includes('evening') || source.includes('soir')) {
    return "Angle : catalyseur du soir / overnight. Focus sur l'annonce ou evenement attendu (heure exacte, consensus vs surprise), impact sur les futures, et plan d'execution immediat (pre-close, after-hours, ou ouverture J+1). Le verdict doit etre actionnable MAINTENANT.";
  }

  if (source.includes('week') || source.includes('semaine')) {
    return "Angle : catalyseur de la semaine. Identifie l'evenement dominant des 5 prochains jours (macro, earnings, banque centrale), evalue le consensus vs surprise probable, et propose un plan de trade swing 3-5 jours avec gestion jour par jour.";
  }

  if (source.includes('rotation')) {
    return 'Angle : rotation sectorielle. Identifie clairement le secteur gagnant le leadership, le secteur perdant, le driver de la rotation (taux, growth, geo), et propose long secteur fort / short relatif secteur faible, ou titre leader.';
  }

  if (source.includes('options') || source.includes('squeeze')) {
    return 'Angle : flux speculatifs / options. Focus momentum, unusual options activity, short interest avec days-to-cover, gamma exposure level. Sizing reduit compte tenu de la volatilite elevee.';
  }

  if (source.includes('swing') || source.includes('5 jours') || source.includes('5j')) {
    return 'Angle : trade swing multi-seances. Plan sur 5 jours avec scenarios probabilises, trailing stop, points ajout/allegement, et drawdown max attendu.';
  }

  if (source.includes('risk') || source.includes('risk-on') || source.includes('risk-off')) {
    return 'Angle : lecture risk-on/risk-off. Qualifie le regime de marche actuel, cite les correlations cross-assets qui le confirment ou infirment, et propose le meilleur trade exprimant cette lecture macro.';
  }

  if (source.includes('ticker') || source.includes('day') || source.includes('jour')) {
    return "Angle : meilleur ticker du jour. Donne UN ticker precis avec catalyseur, niveaux techniques, et plan d'execution intraday ou very short term. Tranche pour le meilleur.";
  }

  return "Angle : opportunite de marche actionnable. Verdict concret avec actif/ticker precis, direction claire, niveaux entree/stop/target exacts, ratio R/R chiffre, et horizon defini.";
}

async function buildSynthesis({ synthSystemPrompt, synthMessage, responses }) {
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const synthClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const synthResponse = await synthClient.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: synthSystemPrompt,
      messages: [{ role: 'user', content: synthMessage }],
    });

    const synthesis = synthResponse.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    if (synthesis) {
      return synthesis;
    }
  } catch (error) {
    console.error('[debate/synthesis] Anthropic error:', error.message);
  }

  const fallback = await safeCall(
    () => openai.callModel(synthSystemPrompt, synthMessage),
    'SynthesisFallback'
  );

  if (fallback && !String(fallback).startsWith('GPT: Erreur')) {
    return fallback;
  }

  return [
    '1. CONSENSUS',
    'La synthese automatique est temporairement indisponible. Consulte les reponses individuelles ci-dessous pour comparer les points communs.',
    '',
    '2. DIVERGENCES',
    'Compare en priorite les tickers, niveaux, catalyseurs et horizons mentionnes par chaque modele.',
    '',
    '3. MEILLEUR SETUP',
    'Utilise la reponse la plus precise et la plus chiffree parmi les modeles retournes.',
    '',
    '4. VERDICT FINAL',
    `Reponses disponibles: ${Object.keys(responses).join(', ') || 'aucune'}.`,
  ].join('\n');
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
      ).then(text => ({ modelId, text: text || `${modelId}: pas de reponse` }))
    );

    const results = await Promise.all(calls);

    // Build responses - ensure no undefined values
    const responses = {};
    results.forEach(r => {
      responses[r.modelId] = r.text || `${r.modelId}: pas de reponse`;
    });

    // Log for debugging
    console.log('Responses collected:', Object.keys(responses).map(k => `${k}: ${responses[k].length} chars`));

    // Build a rich synthesis message with all 3 responses clearly labeled
    const synthMessage = `Tu dois synthetiser ces 3 reponses d'analystes IA.
UTILISE UNIQUEMENT le contenu ci-dessous. Ne fais PAS de recherche.
Ne dis JAMAIS que les infos ne sont pas disponibles — elles sont la, lis-les.

=== CONTEXTE DE LA DEMANDE ===
Marche : ${marketLabels[market] || marketLabels.global}
Angle choisi : ${promptContext.label || 'Question libre'}

=== QUESTION POSEE ===
${question}

=== REPONSE 1 ===
${responses.claude || responses.grok || 'Non disponible'}

=== REPONSE 2 ===
${responses.gpt54 || 'Non disponible'}

=== REPONSE 3 ===
${responses.gemini || responses.mistral || 'Non disponible'}

Synthetise maintenant ces 3 reponses en suivant ta structure obligatoire.
Les donnees sont dans les reponses ci-dessus — extrais-les et compile-les.`;

    const synthSystemPrompt = `Tu es un directeur de trading desk — arbitre senior qui tranche.
Tu recois 3 analyses d'AIs differentes et tu dois les synthetiser en un verdict unique et actionnable.

REGLES ABSOLUES :
- Utilise UNIQUEMENT le contenu des 3 reponses fournies — ne fabrique aucune donnee
- Ne fais PAS de recherche web — tout est deja dans les reponses
- Ne dis JAMAIS "informations non disponibles" — si une IA l'a trouve, extrais-le et utilise-le
- Reprends les tickers, prix, niveaux exacts mentionnes dans les reponses (cite les chiffres)
- Si une reponse est vide ou en erreur, ignore-la et synthetise les autres — ne commente pas l'erreur
- Quand les AIs divergent, explique POURQUOI elles divergent (hypotheses differentes, horizons differents, donnees differentes)
- ${buildSynthesisFocus(promptContext)}

STRUCTURE OBLIGATOIRE :
1. CONSENSUS — les points factuels sur lesquels toutes les AIs convergent (tickers, direction, catalyseurs communs). Sois specifique avec des donnees.
2. DIVERGENCES — ou elles different et pourquoi. Identifie quel modele a la meilleure donnee sur chaque point.
3. MEILLEUR SETUP — le trade le plus concret et le mieux argumente parmi les 3 reponses. Reprends les niveaux exacts.
4. VERDICT FINAL
   - Ticker / actif
   - Direction : LONG ou SHORT
   - Entree : [prix exact repris des analyses]
   - Stop loss : [prix exact]
   - Target 1 : [prix exact] (+X%)
   - Target 2 : [prix exact] (+X%)
   - R/R : [ratio chiffre]
   - Horizon : [intraday / swing / position]
   - Conviction : /10 (basee sur le degre de consensus entre les 3 AIs)

Reponds en francais. Sois concret, direct et chiffre. Pas de fluff.`;

    const synthesis = await buildSynthesis({ synthSystemPrompt, synthMessage, responses });

    return res.json({ responses, synthesis, market, promptContext });
  } catch (error) {
    console.error('[debate] Error:', error.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
