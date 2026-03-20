export const TRADING_PROMPT_PRESETS = {
  global: [
    {
      id: 'global-risk',
      label: 'Risk-on / risk-off',
      description: 'Lecture macro cross-assets du moment avec le meilleur setup global immédiat.',
      prompt: 'Scan le marché mondial maintenant et donne-moi le meilleur setup risk-on/risk-off du jour avec niveaux précis.',
    },
    {
      id: 'global-evening',
      label: 'Catalyseur du soir',
      description: 'Cherche l’annonce ou l’événement de ce soir qui peut déplacer les marchés à court terme.',
      prompt: 'Identifie le catalyseur le plus important attendu ce soir sur le marché mondial et donne le meilleur trade à préparer avec entrée, stop, objectif et timing.',
    },
    {
      id: 'global-week',
      label: 'Catalyseur de la semaine',
      description: 'Priorise l’événement macro ou géopolitique dominant des prochains jours.',
      prompt: 'Donne-moi le principal catalyseur macro ou géopolitique de la semaine sur le marché mondial et le meilleur setup exploitable sur 3 à 5 jours avec niveaux précis.',
    },
    {
      id: 'global-swing',
      label: 'Setup swing 5 jours',
      description: 'Cherche une opportunité exploitable sur plusieurs séances, pas seulement intraday.',
      prompt: 'Propose le meilleur setup swing global sur 5 jours basé sur les corrélations cross-assets, avec scénario haussier, invalidation, stop et target.',
    },
    {
      id: 'global-long-term',
      label: 'Portefeuille long terme',
      description: 'Angle allocation long terme à partir des tendances globales et du régime macro.',
      prompt: 'Dans une logique portefeuille long terme, identifie aujourd’hui le thème global le plus solide à accumuler sur plusieurs mois avec les actifs ou secteurs à privilégier et les principaux risques.',
    },
    {
      id: 'global-custom',
      label: 'Mode libre',
      description: 'Tu pars d’une base neutre puis tu adaptes ta propre demande.',
      prompt: 'Analyse libre du marché mondial : adapte cette question à ton besoin précis avant de lancer les IA.',
    },
  ],
  nasdaq: [
    {
      id: 'nasdaq-day',
      label: 'Ticker du jour',
      description: 'Cherche le meilleur ticker US immédiat avec catalyseur et niveaux de trade.',
      prompt: 'Scan le Nasdaq et donne-moi le meilleur ticker US du jour avec catalyst, entry, stop et targets.',
    },
    {
      id: 'nasdaq-evening',
      label: 'Annonce du soir',
      description: 'Focus sur l’earnings, la guidance ou l’annonce after-hours la plus exploitable.',
      prompt: 'Identifie l’annonce du soir la plus importante sur le Nasdaq ou les méga caps US et donne le meilleur trade à préparer pour l’after-hours ou l’ouverture suivante avec niveaux précis.',
    },
    {
      id: 'nasdaq-week',
      label: 'Catalyseur de la semaine',
      description: 'Privilégie l’événement ou la publication qui peut driver la tech US sur plusieurs séances.',
      prompt: 'Quel est le principal catalyseur de la semaine sur le Nasdaq et quel est le meilleur setup tech US à jouer sur 3 à 5 jours avec entrée, stop, targets et risque principal ?',
    },
    {
      id: 'nasdaq-options',
      label: 'Flux options / squeeze',
      description: 'Angle momentum, short squeeze et flux spéculatifs sur les valeurs US.',
      prompt: 'Cherche le meilleur setup Nasdaq lié aux flux options, au momentum ou à un short squeeze potentiel, avec catalyseur, timing et niveaux de gestion du risque.',
    },
    {
      id: 'nasdaq-long-term',
      label: 'Tech long terme',
      description: 'Vision portefeuille sur les leaders US à accumuler sur plusieurs mois.',
      prompt: 'Dans une logique portefeuille long terme, identifie aujourd’hui la meilleure idée tech US ou Nasdaq à accumuler sur plusieurs mois avec thèse, risques et zones de construction de position.',
    },
    {
      id: 'nasdaq-custom',
      label: 'Mode libre',
      description: 'Base neutre pour écrire une demande Nasdaq totalement personnalisée.',
      prompt: 'Analyse libre du Nasdaq : adapte cette question à ton besoin précis avant de lancer les IA.',
    },
  ],
  european: [
    {
      id: 'eu-setup',
      label: 'Setup Europe du jour',
      description: 'Cherche l’opportunité Euronext la plus actionnable maintenant.',
      prompt: 'Scan le marché européen maintenant et donne-moi le meilleur setup Euronext avec angle BCE et risque/rendement.',
    },
    {
      id: 'eu-evening',
      label: 'Annonce du soir',
      description: 'Focus sur les publications, guidance ou événements politiques qui peuvent bouger l’Europe.',
      prompt: 'Identifie le catalyseur du soir le plus important pour les marchés européens et propose le meilleur trade à préparer avec entrée, stop, objectif et horizon.',
    },
    {
      id: 'eu-week',
      label: 'Catalyseur de la semaine',
      description: 'Priorise BCE, macro EU, résultats ou M&A susceptibles de déplacer les indices et actions européennes.',
      prompt: 'Quel est le principal catalyseur de la semaine pour les marchés européens et quel est le meilleur setup action ou indice à jouer sur 3 à 5 jours avec niveaux précis ?',
    },
    {
      id: 'eu-rotation',
      label: 'Rotation sectorielle',
      description: 'Cherche quel secteur européen prend ou perd le leadership.',
      prompt: 'Analyse la rotation sectorielle en Europe et donne le meilleur secteur ou titre européen à surpondérer maintenant, avec justification, risque et niveaux de trade.',
    },
    {
      id: 'eu-long-term',
      label: 'Europe long terme',
      description: 'Angle portefeuille sur les thèmes européens robustes à plusieurs mois.',
      prompt: 'Dans une logique portefeuille long terme, identifie aujourd’hui le meilleur thème ou actif européen à accumuler sur plusieurs mois, avec thèse, valorisation relative et risques majeurs.',
    },
    {
      id: 'eu-custom',
      label: 'Mode libre',
      description: 'Base neutre pour écrire une demande européenne totalement personnalisée.',
      prompt: 'Analyse libre du marché européen : adapte cette question à ton besoin précis avant de lancer les IA.',
    },
  ],
};

export function getTradingPromptPresets(market) {
  return TRADING_PROMPT_PRESETS[market] || [];
}

export function getDefaultTradingPrompt(market) {
  return getTradingPromptPresets(market)[0]?.prompt || '';
}

export function getTradingPromptPreset(market, presetId) {
  return getTradingPromptPresets(market).find((preset) => preset.id === presetId) || null;
}