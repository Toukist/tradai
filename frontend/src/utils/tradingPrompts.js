export const TRADING_PROMPT_PRESETS = {
  global: [
    {
      id: 'global-risk',
      label: 'Risk-on / risk-off',
      description: 'Lecture macro cross-assets : regime de marche, correlations et meilleur setup immediat.',
      prompt: `Quel est le regime de marche actuel (risk-on ou risk-off) ?
Analyse croisee : S&P 500, VIX, DXY, or, petrole, taux 10Y US, BTC.
Identifie les correlations qui divergent de la norme et leur signal.
Donne le meilleur trade global du moment avec entree precise, stop loss, target 1, target 2 et ratio risque/rendement.
Horizon : intraday a 48h.`,
    },
    {
      id: 'global-evening',
      label: 'Catalyseur du soir',
      description: 'Evenement after-hours ou asiatique pouvant impacter l\'ouverture suivante.',
      prompt: `Identifie le catalyseur le plus important attendu ce soir ou overnight (earnings after-hours, donnees asiatiques, discours banquier central, evenement geopolitique).
Pour chaque catalyseur :
- Heure exacte et timezone
- Consensus du marche vs surprise possible
- Impact attendu sur quels actifs
Propose le meilleur trade a placer AVANT l'evenement avec entree, stop, target et timing d'execution (pre-close, AH, ou ouverture J+1).`,
    },
    {
      id: 'global-week',
      label: 'Catalyseur de la semaine',
      description: 'Evenement macro ou geopolitique dominant des 5 prochains jours.',
      prompt: `Donne les 3 catalyseurs macro/geopolitiques les plus importants de cette semaine.
Pour le catalyseur principal :
- Date et heure precises
- Consensus du marche et probabilite de surprise
- Quels actifs seront les plus sensibles
- Scenario haussier vs baissier avec niveaux chiffres
Propose le meilleur setup a jouer sur 3 a 5 jours avec entree, stop, target et plan de gestion si le consensus est battu ou decu.`,
    },
    {
      id: 'global-swing',
      label: 'Setup swing 5 jours',
      description: 'Trade multi-seances base sur les correlations cross-assets.',
      prompt: `Cherche le meilleur trade swing a 5 jours sur les marches mondiaux.
Criteres : correlation cross-assets favorable, momentum technique aligne, catalyseur identifiable dans l'horizon.
Donne :
- Actif/ticker avec justification technique ET fondamentale
- Scenario principal (probabilite %) et scenario alternatif
- Entree, stop loss, target intermediaire, target final
- Plan de gestion jour par jour (trailing stop, ajout, allegement)
- Drawdown max attendu et ratio R/R.`,
    },
    {
      id: 'global-long-term',
      label: 'Portefeuille long terme',
      description: 'Theme global solide a accumuler sur 3-12 mois.',
      prompt: `Dans une logique portefeuille long terme (3 a 12 mois), identifie le theme macro global le plus porteur actuellement.
Analyse :
- Les forces structurelles derriere ce theme (demographie, technologie, geopolitique, regulation)
- Les meilleurs instruments pour l'exprimer (ETFs, actions, secteurs, geographies)
- Les zones de prix optimales pour construire une position (DCA vs lump sum)
- Les risques majeurs et niveaux d'invalidation de la these
- L'allocation optimale dans un portefeuille equilibre (% du portefeuille).`,
    },
    {
      id: 'global-custom',
      label: 'Mode libre',
      description: 'Pose ta propre question — les 3 IA scanneront le marche mondial.',
      prompt: '',
    },
  ],
  nasdaq: [
    {
      id: 'nasdaq-day',
      label: 'Ticker du jour',
      description: 'Le meilleur ticker Nasdaq a jouer aujourd\'hui avec catalyseur et niveaux.',
      prompt: `Scanne le Nasdaq 100 et beyond : quel est le ticker US le plus actionnable aujourd'hui ?
Criteres de selection : volume anormal (>1.5x moyenne 20j), catalyseur identifie, breakout/breakdown technique confirme.
Pour le meilleur ticker :
- Catalyseur precis (earnings, upgrade, news, option flow)
- Analyse technique : pattern, supports/resistances, RSI, volume profile
- Short interest et days-to-cover si pertinent
- Entree, stop loss (-%), target 1, target 2, ratio R/R
- Timing : ouverture, breakout level, ou pullback ?`,
    },
    {
      id: 'nasdaq-evening',
      label: 'Annonce du soir',
      description: 'Earnings after-hours ou annonce susceptible de creer un gap.',
      prompt: `Quelles entreprises tech/Nasdaq publient leurs resultats ce soir en after-hours ?
Pour la publication la plus importante :
- Consensus EPS et revenue, whisper number si disponible
- Historique de reaction post-earnings (surprise -> move moyen)
- Options implied move vs realized move moyen
- Le plus important : guidance et metriques a surveiller (ARR, DAU, margins, guide Q+1)
Propose un plan de trade complet : entree pre-close, scenario beat/miss, niveaux, sizing.`,
    },
    {
      id: 'nasdaq-week',
      label: 'Catalyseur de la semaine',
      description: 'Evenement ou publication tech qui peut driver le Nasdaq cette semaine.',
      prompt: `Quels sont les 3 catalyseurs les plus importants pour le Nasdaq cette semaine ?
(Earnings de mega caps, FOMC, CPI, guidance, product launch, analyst day, antitrust, etc.)
Pour le catalyseur principal :
- Date/heure precise
- Impact historique sur NDX et les titres concernes
- Consensus vs risque de surprise
Propose le meilleur setup tech US sur 3 a 5 jours : ticker, direction, entree, stop, targets, plan si consensus battu ou decu.`,
    },
    {
      id: 'nasdaq-options',
      label: 'Flux options / squeeze',
      description: 'Momentum, unusual activity et short squeeze potentiel.',
      prompt: `Scanne les flux options et short interest sur le Nasdaq :
1. Unusual options activity : quels tickers ont un volume calls/puts anormal ? Ratio call/put, strikes concentres, expiration
2. Short squeeze candidates : short interest >15%, days-to-cover >3, catalyseur identifiable
3. Gamma exposure : quel est le gamma flip level du SPX/NDX ? Sommes-nous en positive ou negative gamma ?
4. Dark pool prints : transactions block notables recentes
Identifie le meilleur trade momentum/squeeze avec entree, stop, target et timing. Risque : taille position reduite car volatilite elevee.`,
    },
    {
      id: 'nasdaq-long-term',
      label: 'Tech long terme',
      description: 'Leader tech US a accumuler sur 3-12 mois.',
      prompt: `Dans une logique d'investissement long terme (3-12 mois), quelle est la meilleure idee tech US a accumuler maintenant ?
Analyse approfondie :
- These d'investissement (bull case, base case, bear case avec probabilites)
- Metriques fondamentales : P/E forward, PEG, EV/EBITDA, FCF yield, revenue growth, rule of 40
- Avantage competitif (moat) : reseau, propriete intellectuelle, switching costs, scale
- Risques : regulation, concentration, cyclicite, concurrence
- Zone de construction de position : prix moyen cible, niveaux d'accumulation -5%/-10%/-15%
- Allocation cible dans un portefeuille growth (%).`,
    },
    {
      id: 'nasdaq-custom',
      label: 'Mode libre',
      description: 'Pose ta propre question — les 3 IA analyseront le Nasdaq.',
      prompt: '',
    },
  ],
  european: [
    {
      id: 'eu-setup',
      label: 'Setup Europe du jour',
      description: 'Meilleure opportunite Euronext actionnable maintenant.',
      prompt: `Scanne les marches europeens (Euronext Paris, Bruxelles, Amsterdam, Xetra) : quel est le meilleur setup du jour ?
Criteres : volume anormal, catalyseur corporate ou macro EU, configuration technique claire.
Pour le meilleur ticker :
- Catalyseur precis (resultats, M&A, upgrade, BCE, donnees macro EU)
- Analyse technique : supports/resistances, tendance, volumes
- Valorisation : P/E vs mediane sectorielle EU, discount vs peers
- Accessibilite : courtier belge (Bolero/Keytrade/Saxo) et fiscalite TOB
- Entree, stop, target 1, target 2, R/R, horizon.`,
    },
    {
      id: 'eu-evening',
      label: 'Annonce du soir',
      description: 'Publication ou evenement pouvant impacter l\'Europe a l\'ouverture.',
      prompt: `Identifie le catalyseur du soir le plus important pour les marches europeens :
- Resultats corporate EU publies en fin de seance (guidance, outlook)
- Donnees US after-hours impactant les futures EU overnight
- Decisions politiques EU, BCE speeches, evenements geopolitiques
Pour le catalyseur principal :
- Heure exacte et impact attendu (secteurs, indices, titres)
- Trade a preparer : entree (close ce soir ou ouverture demain ?), stop, target, horizon
- Courtier accessible et TOB applicable.`,
    },
    {
      id: 'eu-week',
      label: 'Catalyseur de la semaine',
      description: 'BCE, macro EU, resultats ou M&A susceptibles de deplacer les marches.',
      prompt: `Quels sont les 3 catalyseurs les plus importants pour les marches europeens cette semaine ?
(Reunion BCE, PMI EU, resultats corporate EU, M&A, CPI zone euro, politique EU, etc.)
Pour chaque catalyseur :
- Date/heure et consensus du marche
- Historique d'impact sur STOXX600/CAC/DAX/BEL20
Pour le plus important : propose le meilleur setup action ou indice EU sur 3 a 5 jours avec entree, stop, target et plan B.`,
    },
    {
      id: 'eu-rotation',
      label: 'Rotation sectorielle',
      description: 'Secteur europeen prenant ou perdant le leadership.',
      prompt: `Analyse la rotation sectorielle en Europe sur les 20 dernieres seances :
1. Quels secteurs STOXX600 surperforment (defense, luxe, tech, banques, energie, sante, utilities) ?
2. Quels secteurs sous-performent et pourquoi (cycliques, immobilier, telecom) ?
3. Est-ce une rotation defensive, cyclique, value->growth ou inversement ?
4. Quel est le driver principal (taux, croissance, EUR, geopolitique) ?
Propose le meilleur trade sectoriel : titre leader du secteur gagnant ou short relatif secteur en perte de momentum.
Entree, stop, target, horizon, R/R, et courtier belge accessible.`,
    },
    {
      id: 'eu-long-term',
      label: 'Europe long terme',
      description: 'Theme europeen robuste a accumuler sur 3-12 mois.',
      prompt: `Dans une logique portefeuille long terme (3-12 mois), identifie le meilleur theme ou actif europeen a accumuler.
Analyse :
- Theme structurel (defense EU, transition energetique, infra, reindustrialisation, digital EU, vieillissement)
- Valorisation relative EU vs US : discount P/E historique, earnings yield gap, catalyseur de re-rating
- Meilleurs instruments : ETF UCITS sectoriel EU, titres Euronext directs, ou mix
- Fiscalite belge : TOB applicable, domiciliation ETF (IE vs LU), accumulating vs distributing
- Zones de construction de position et invalidation de la these
- Allocation optimale dans un portefeuille belge (%).`,
    },
    {
      id: 'eu-custom',
      label: 'Mode libre',
      description: 'Pose ta propre question — les 3 IA analyseront les marches europeens.',
      prompt: '',
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
