const { authenticateToken, authorizeRole } = require('./auth.middleware');

module.exports = {
  authenticateToken,
  authorizeRole,
}; 