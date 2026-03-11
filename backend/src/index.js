import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import debateRouter from './routes/debate.js';
import portfolioRouter from './routes/portfolio.js';
import etfRouter from './routes/etf.js';
import fundsRouter from './routes/funds.js';
import authRouter from './routes/auth.js';
import stripeRouter from './routes/stripe.js';
import { rateLimiter } from './middleware/rateLimit.js';
import { checkDatabase } from './db/index.js';
import { runMigrations } from './db/migrate.js';

dotenv.config();

const app = express();
const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const frontendUrl = rawFrontendUrl.replace(/^(https?:\/\/)+/, (match) => match.slice(0, match.lastIndexOf('://') + 3));
const allowedOrigins = new Set([
  frontendUrl.replace(/\/$/, ''),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://heartfelt-quietude-production.up.railway.app',
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = String(origin).replace(/\/$/, '');
    if (allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  const databaseOk = await checkDatabase();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      configured: !!process.env.DATABASE_URL,
      connected: databaseOk,
    },
    models: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      grok: !!process.env.GROK_API_KEY,
      mistral: !!process.env.MISTRAL_API_KEY,
    },
  });
});

app.use('/api/auth', authRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api', rateLimiter);
app.use('/api/debate', debateRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/etf', etfRouter);
app.use('/api/funds', fundsRouter);

const PORT = process.env.PORT || 3001;

await runMigrations();

app.listen(PORT, () => console.log(`TradAI backend running on port ${PORT}`));
