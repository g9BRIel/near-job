/**
 * authRoutes.js — Secure Auth Routes
 *
 * Security:
 *  - authLimiter: strict rate limit on login/register (15 req/15min per IP)
 *  - otpLimiter:  strict rate limit on OTP requests (5 req/10min per IP)
 *  - validate():  Joi schema validation strips unknown fields
 */

const express = require('express');
const router  = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  changePassword,
} = require('../controllers/authController');

const authMiddleware            = require('../middleware/authMiddleware');
const { authLimiter, otpLimiter } = require('../middleware/security');
const { validate }              = require('../middleware/validation');

// ─── Public Auth Routes (rate-limited) ────────────────────────────────────────
router.post('/register',        authLimiter, validate('register'),       registerUser);
router.post('/login',           authLimiter, validate('login'),          loginUser);
router.post('/forgot-password', otpLimiter,  validate('forgotPassword'), forgotPassword);
router.post('/verify-code',     otpLimiter,  validate('verifyCode'),     verifyResetCode);
router.post('/reset-password',  otpLimiter,  validate('resetPassword'),  resetPassword);

// ─── Protected Route ──────────────────────────────────────────────────────────
router.post('/change-password', authMiddleware, validate('changePassword'), changePassword);

module.exports = router;
