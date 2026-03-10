# TradAI

**TradAI** est une plateforme de débat multi-IA et d'analyse de portefeuille.  
5 modèles (Claude, GPT-4o, Gemini, Grok, Mistral) débattent de vos questions financières et synthétisent la meilleure réponse.

---

## Stack

- **Frontend** : React 18 + Vite + Tailwind CSS
- **Backend** : Node.js 20 + Express
- **Déploiement** : Railway

---

## Installation locale

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env   # remplir les clés API
npm run dev            # démarre sur http://localhost:3001

# 2. Frontend (nouveau terminal)
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:3001
npm run dev            # démarre sur http://localhost:5173
```

---

## Clés API nécessaires

| Modèle  | Fournisseur | Lien                             |
|---------|-------------|----------------------------------|
| Claude  | Anthropic   | https://console.anthropic.com    |
| GPT-4o  | OpenAI      | https://platform.openai.com      |
| Gemini  | Google      | https://aistudio.google.com      |
| Grok    | xAI         | https://console.x.ai             |
| Mistral | Mistral AI  | https://console.mistral.ai       |

---

## Déploiement Railway

### Backend
1. Créer un nouveau service Railway pointant sur `./backend`
2. Ajouter les variables d'environnement (toutes les clés API + `FRONTEND_URL`)
3. Railway détecte automatiquement via `railway.json` → `node src/index.js`

### Frontend
1. Créer un nouveau service Railway pointant sur `./frontend`
2. Ajouter `VITE_API_URL=https://<votre-backend>.railway.app`
3. Railway exécute `npm run preview -- --host 0.0.0.0 --port $PORT`

---

## Avertissement légal

> TradAI fournit des pistes de réflexion uniquement. Ne constitue pas un conseil en investissement
> au sens de MiFID II. Consultez un conseiller financier agréé avant toute décision d'investissement.
