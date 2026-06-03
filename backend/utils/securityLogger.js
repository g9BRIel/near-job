/**
 * securityLogger.js — Structured Security Audit Log
 *
 * Logs sensitive actions to console (structured JSON).
 * In production, pipe these to a SIEM / log aggregator (Datadog, Papertrail, etc.)
 *
 * Covered events:
 *  - Login attempts (success + failure)
 *  - Failed authorization (403)
 *  - IDOR / ownership violation attempts
 *  - Banned user access attempts
 *  - Password changes / resets
 *  - Account deletions
 *  - Admin actions
 */

const LOG_LEVELS = {
  INFO:  'INFO',
  WARN:  'WARN',
  ERROR: 'ERROR',
  AUDIT: 'AUDIT',
};

const log = (level, event, data = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data,
  };
  // In production: replace with structured logger (winston, pino, etc.)
  console.log(`[SECURITY] ${JSON.stringify(entry)}`);
};

// ─── Named event helpers ───────────────────────────────────────────────────────

const securityLog = {
  /** Successful login */
  loginSuccess: (userId, userType, ip) =>
    log(LOG_LEVELS.AUDIT, 'LOGIN_SUCCESS', { userId, userType, ip }),

  /** Failed login attempt */
  loginFailure: (email, ip, reason = 'invalid_credentials') =>
    log(LOG_LEVELS.WARN, 'LOGIN_FAILURE', { email, reason, ip }),

  /** Token expired during a request */
  tokenExpired: (ip) =>
    log(LOG_LEVELS.INFO, 'TOKEN_EXPIRED', { ip }),

  /** User tried to request another user's resource (IDOR attempt) */
  idorAttempt: (requesterId, targetId, route) =>
    log(LOG_LEVELS.WARN, 'IDOR_ATTEMPT', { requesterId, targetId, route }),

  /** User tried an action they don't have the role for */
  roleDenied: (userId, userType, requiredRole, route) =>
    log(LOG_LEVELS.WARN, 'ROLE_DENIED', { userId, userType, requiredRole, route }),

  /** Banned user tried to access the system */
  bannedAccess: (userId, userType, route) =>
    log(LOG_LEVELS.WARN, 'BANNED_ACCESS_ATTEMPT', { userId, userType, route }),

  /** Password changed */
  passwordChanged: (userId, userType) =>
    log(LOG_LEVELS.AUDIT, 'PASSWORD_CHANGED', { userId, userType }),

  /** Password reset completed */
  passwordReset: (email, method) =>
    log(LOG_LEVELS.AUDIT, 'PASSWORD_RESET', { email, method }),

  /** OTP / reset code requested */
  otpRequested: (email, method, ip) =>
    log(LOG_LEVELS.INFO, 'OTP_REQUESTED', { email, method, ip }),

  /** Account deleted */
  accountDeleted: (userId, userType) =>
    log(LOG_LEVELS.AUDIT, 'ACCOUNT_DELETED', { userId, userType }),

  /** Admin action */
  adminAction: (adminId, action, targetId, targetType, details = '') =>
    log(LOG_LEVELS.AUDIT, 'ADMIN_ACTION', { adminId, action, targetId, targetType, details }),

  /** Validation failure (potential attacker probing) */
  validationError: (route, ip, fields = []) =>
    log(LOG_LEVELS.INFO, 'VALIDATION_ERROR', { route, ip, fields }),

  /** Rate limit hit */
  rateLimited: (ip, route) =>
    log(LOG_LEVELS.WARN, 'RATE_LIMITED', { ip, route }),
};

module.exports = securityLog;
