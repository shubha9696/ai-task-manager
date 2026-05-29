const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ai_task_manager_key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Expecting format: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains id, email, username
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Session expired or invalid authentication token.' });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
