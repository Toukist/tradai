import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, plan',
      [email, hash, name]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    return res.json({ token, user });
  } catch (error) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
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
