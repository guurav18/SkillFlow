const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'workflow_ai_super_secret_jwt_key_2026_dev', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

module.exports = { generateToken };
