/**
 * security.js — NearJob Centralized Security Middleware
 * OWASP Top 10 compliant middleware stack
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// ─── 1. Helmet (HTTP security headers) ───────────────────────────────────────
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false, // relax for API usage
});

// ─── 2. CORS (strict whitelist) ──────────────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  // Always allow nearjob.com regardless of env var
  .concat(['https://nearjob.com', 'https://www.nearjob.com'])
  .filter((o, i, arr) => arr.indexOf(o) === i); // deduplicate

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, Postman in dev)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
});

// ─── 3. Rate Limiters ────────────────────────────────────────────────────────

/** General API limiter — 300 req / 15 min per IP */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

/** Strict limiter for auth endpoints — 15 req / 15 min per IP */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: true, // only count failures
});

/** OTP / password-reset limiter — 5 req / 10 min per IP */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many OTP requests. Please wait 10 minutes.' },
});

// ─── 4. Ban Check Middleware ──────────────────────────────────────────────────
/**
 * Rejects requests from banned users even if they hold a valid token.
 * Must be placed AFTER authMiddleware so req.user is populated.
 */
const banCheck = (req, res, next) => {
  if (req.user && req.user.isBanned) {
    return res.status(403).json({
      success: false,
      error: 'Your account has been suspended. Please contact support.',
    });
  }
  next();
};

// ─── 5. Role Guard Factory ────────────────────────────────────────────────────
/**
 * Usage: requireRole('company')  or  requireRole('worker', 'admin')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  if (!roles.includes(req.user.userType)) {
    // Security log — failed authorization
    console.warn(`[AUTH_FAIL] User ${req.user.id} (${req.user.userType}) tried ${req.method} ${req.originalUrl} — required: ${roles.join('/')}`);
    return res.status(403).json({
      success: false,
      error: `Access denied. This action requires: ${roles.join(' or ')} role.`,
    });
  }
  next();
};

// ─── 6. Ownership Guard ───────────────────────────────────────────────────────
/**
 * Ensures the param ID matches the authenticated user.
 * Usage: requireOwnership('id')   (param name)
 */
const requireOwnership = (paramName = 'id') => (req, res, next) => {
  const paramId = parseInt(req.params[paramName], 10);
  const userId  = parseInt(req.user?.id, 10);

  if (isNaN(paramId) || isNaN(userId) || paramId !== userId) {
    console.warn(`[IDOR_ATTEMPT] User ${req.user?.id} tried to access resource owned by ${req.params[paramName]}`);
    return res.status(403).json({ success: false, error: 'Access denied. You do not own this resource.' });
  }
  next();
};

module.exports = {
  helmetMiddleware,
  corsMiddleware,
  apiLimiter,
  authLimiter,
  otpLimiter,
  banCheck,
  requireRole,
  requireOwnership,
};
