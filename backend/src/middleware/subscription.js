import pool from '../db/index.js';
import { authenticateToken } from './auth.js';
import { isBootstrapUserId, getBootstrapUser } from '../utils/bootstrapAccount.js';

const PLAN_LIMITS = {
  free: 5,
  trader: Number.POSITIVE_INFINITY,
  advisor: Number.POSITIVE_INFINITY,
  team: Number.POSITIVE_INFINITY,
};

export function checkSubscription(req, res, next) {
  authenticateToken(req, res, async () => {
    try {
      if (isBootstrapUserId(req.userId)) {
        req.user = getBootstrapUser();
        return next();
      }

      const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      const lastReset = new Date(user.questions_reset_at);
      const now = new Date();

      if (now.toDateString() !== lastReset.toDateString()) {
        await pool.query('UPDATE users SET questions_today = 0, questions_reset_at = NOW() WHERE id = $1', [user.id]);
        user.questions_today = 0;
      }

      const limit = PLAN_LIMITS[user.plan] ?? 5;
      if (user.questions_today >= limit) {
        return res.status(429).json({
          error: 'Limite journalière atteinte',
          plan: user.plan,
          upgrade: true,
        });
      }

      await pool.query('UPDATE users SET questions_today = questions_today + 1 WHERE id = $1', [user.id]);
      req.user = user;
      return next();
    } catch (error) {
      console.error('Subscription middleware error:', error.message);
      return res.status(500).json({ error: 'Erreur abonnement' });
    }
  });
}
