# TradAI

TradAI est une plateforme multi-IA pour traders actifs et conseillers en investissement.

## Produits

- **Trading Desk** : 3 marchés (`global`, `nasdaq`, `european`) avec analyses multi-modèles et synthèse.
- **Advisory Desk** : comparaison d’ETF, analyse de fonds, analyse de portefeuille et switch optimizer.

## Stack

- **Frontend** : React 18 + Vite + Tailwind CSS
- **Backend** : Node.js 20 + Express
- **Base de données** : PostgreSQL via Railway
- **Paiements** : Stripe
- **Déploiement** : Railway

## Installation locale

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Railway

Prévoir **3 services** :

1. **backend**
2. **frontend**
3. **PostgreSQL**

Variables backend principales :

- `DATABASE_URL`
- `FRONTEND_URL`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `GROK_API_KEY`
- `MISTRAL_API_KEY`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_TRADER_PRICE_ID`
- `STRIPE_ADVISOR_PRICE_ID`
- `STRIPE_TEAM_PRICE_ID`

Variable frontend principale :

- `VITE_API_URL`

## Stripe

Créer les produits et prix dans le dashboard Stripe, puis reporter les `price_id` dans le backend.

## Légal

TradAI fournit des pistes de réflexion uniquement. Ne constitue pas un conseil en investissement au sens de MiFID II. Consultez un conseiller financier agréé avant toute décision.
