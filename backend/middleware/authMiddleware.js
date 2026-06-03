/**
 * authMiddleware.js — Production-Grade JWT Authentication
 *
 * Security properties:
 *  - Verifies JWT signature against JWT_SECRET
 *  - Re-fetches user from DB on EVERY request (prevents stale/revoked tokens)
 *  - Checks isActive + isBanned status
 *  - Never trusts client-supplied user IDs
 *  - Attaches minimal, safe req.user object
 */

const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');
const Company = require('../models/Company');

const SAFE_WORKER_ATTRS = ['id', 'email', 'fullName', 'userType', 'isActive', 'isBanned', 'lastActiveAt'];
const SAFE_COMPANY_ATTRS = ['id', 'email', 'companyName', 'userType', 'isActive', 'isBanned', 'lastActiveAt'];

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided. Please login first.' });
    }

    const token = authHeader.slice(7);

    // 1. Verify JWT signature + expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Token expired. Please login again.', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ success: false, error: 'Invalid token. Please login again.' });
    }

    if (!decoded.id || !decoded.userType) {
      return res.status(401).json({ success: false, error: 'Malformed token.' });
    }

    // 2. Re-fetch user from DB (detect bans, deletions, account changes)
    let user = null;
    let userType = decoded.userType;

    if (userType === 'worker') {
      user = await Worker.findByPk(decoded.id, { attributes: SAFE_WORKER_ATTRS });
    } else if (userType === 'company') {
      user = await Company.findByPk(decoded.id, { attributes: SAFE_COMPANY_ATTRS });
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found. Token is no longer valid.' });
    }

    // 3. Account status checks
    if (user.isActive === false) {
      return res.status(403).json({ success: false, error: 'Account deactivated. Please contact support.' });
    }

    if (user.isBanned) {
      console.warn(`[BANNED_ACCESS] Banned user ${user.id} (${userType}) attempted request: ${req.method} ${req.originalUrl}`);
      return res.status(403).json({ success: false, error: 'Your account has been suspended.' });
    }

    // 4. Build safe, canonical req.user — NEVER trust frontend-sourced IDs
    req.user = {
      id:       user.id,           // Always from DB, never from request body
      email:    user.email,
      name:     user.fullName || user.companyName || '',
      userType: userType,
      isBanned: user.isBanned,
    };

    // 5. Update lastActiveAt in background (non-blocking)
    setImmediate(async () => {
      try {
        const model = userType === 'worker' ? Worker : Company;
        await model.update({ lastActiveAt: new Date() }, { where: { id: decoded.id } });
      } catch (_) { /* non-critical */ }
    });

    next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Authentication failed.' });
  }
};

module.exports = authMiddleware;
