/**
 * userRoutes.js — Secure User Routes
 *
 * Authorization:
 *  - /me requires authentication
 *  - Public list uses optionalAuth (unauthenticated gets results without block-filter)
 *  - Validation applied on all mutating routes
 */

const express = require('express');
const router  = express.Router();

const {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getOnlineStatus,
  getUserAnalytics,
  getGlobalAnalytics,
  rateUser,
  deleteMyAccount,
} = require('../controllers/userController');

const { blockUser, unblockUser, getBlockedUsers } = require('../controllers/blockController');

const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth   = require('../middleware/optionalAuth');
const { validate }   = require('../middleware/validation');

// ─── Own-data (worker + company) — requires auth ──────────────────────────────
router.route('/me')
  .get(authMiddleware, getUserProfile)
  .put(authMiddleware, updateUserProfile)  // validation conditionally in controller (userType-specific)
  .delete(authMiddleware, deleteMyAccount);

// ─── Analytics — requires auth ────────────────────────────────────────────────
router.get('/analytics',        authMiddleware, getUserAnalytics);
router.get('/global-analytics', authMiddleware, getGlobalAnalytics);

// ─── Rating — requires auth ───────────────────────────────────────────────────
router.post('/rate', authMiddleware, validate('rateUser'), rateUser);

// ─── Block system — requires auth ─────────────────────────────────────────────
router.post('/block',         authMiddleware, blockUser);
router.post('/unblock',       authMiddleware, unblockUser);
router.get('/blocked-users',  authMiddleware, getBlockedUsers);

// ─── Online status — optional auth ────────────────────────────────────────────
router.get('/status', optionalAuth, getOnlineStatus);

// ─── Public user list — optional auth (block filter when logged in) ────────────
router.get('/', optionalAuth, getAllUsers);

module.exports = router;
