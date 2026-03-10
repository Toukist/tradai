require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('./middleware/rateLimit');
const debateRouter = require('./routes/debate');
const portfolioRouter = require('./routes/portfolio');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Body parsing
app.use(express.json());

// Rate limiting on all /api/* routes
app.use('/api', rateLimit);

// Routes
app.use('/api/debate', debateRouter);
app.use('/api/portfolio', portfolioRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`TradAI backend running on port ${PORT}`);
});
