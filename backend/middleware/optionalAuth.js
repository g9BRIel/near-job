/**
 * optionalAuth.js — Soft authentication middleware
 *
 * Populates req.user if a valid token is present, but does NOT reject the
 * request if no token is provided. Used on public endpoints that optionally
 * personalize results for logged-in users.
 *
 * Security note: We still verify the JWT and re-validate the user from DB
 * when a token IS provided — we never blindly trust unverified tokens.
 */

const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');
const Company = require('../models/Company');

const SAFE_WORKER_ATTRS  = ['id', 'email', 'fullName',    'userType', 'isActive', 'isBanned'];
const SAFE_COMPANY_ATTRS = ['id', 'email', 'companyName', 'userType', 'isActive', 'isBanned'];

const optionalAuth = async (req, res, next) => {
  req.user = null; // explicit default

  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // no token — continue without user context
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id || !decoded.userType) return next();

    let user = null;
    if (decoded.userType === 'worker') {
      user = await Worker.findByPk(decoded.id, { attributes: SAFE_WORKER_ATTRS });
    } else if (decoded.userType === 'company') {
      user = await Company.findByPk(decoded.id, { attributes: SAFE_COMPANY_ATTRS });
    }

    if (user && !user.isBanned && user.isActive !== false) {
      req.user = {
        id:       user.id,
        email:    user.email,
        name:     user.fullName || user.companyName || '',
        userType: decoded.userType,
        isBanned: user.isBanned,
      };
    }
  } catch (_) {
    // Invalid or expired token — treat as unauthenticated (don't leak details)
  }

  next();
};

module.exports = optionalAuth;
