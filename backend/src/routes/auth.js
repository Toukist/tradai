import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  BOOTSTRAP_EMAIL,
  getBootstrapUser,
  isBootstrapEmail,
  isBootstrapUserId,
  verifyBootstrapPassword,
} from '../utils/bootstrapAccount.js';

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      plan: user.plan,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (isBootstrapEmail(email)) {
    if (!(await verifyBootstrapPassword(password || ''))) {
      return res.status(400).json({
        error: `Compte réservé. Utilise l’adresse ${BOOTSTRAP_EMAIL} avec le mot de passe transmis par l’administrateur.`,
      });
    }

    const user = getBootstrapUser(name);
    const token = signToken(user);
    return res.json({ token, user });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, plan',
      [email, hash, name]
    );
    const user = result.rows[0];
    const token = signToken(user);
    return res.json({ token, user });
  } catch (error) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (isBootstrapEmail(email)) {
    if (!(await verifyBootstrapPassword(password || ''))) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const user = getBootstrapUser();
    const token = signToken(user);
    return res.json({ token, user });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  if (isBootstrapUserId(req.userId)) {
    return res.json({ user: getBootstrapUser(req.auth?.name) });
  }

  try {
    const result = await pool.query('SELECT id, email, name, plan, questions_today FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
