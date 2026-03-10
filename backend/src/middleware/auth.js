// Middleware d'authentification (extensible)
// Actuellement non utilisé en production — à compléter selon les besoins
module.exports = function auth(req, res, next) {
  // Exemple: vérification d'une API key interne
  // const apiKey = req.headers['x-api-key'];
  // if (apiKey !== process.env.INTERNAL_API_KEY) {
  //   return res.status(401).json({ error: 'Non autorisé' });
  // }
  next();
};
