import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tradai-bootstrap-secret-change-me';

export function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = decoded;
    req.userId = decoded.userId;
    return next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
}
