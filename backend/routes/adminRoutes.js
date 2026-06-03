/**
 * adminRoutes.js — Hardened Admin Routes
 *
 * Security:
 *  - Separate ADMIN_JWT_SECRET (admin tokens != user tokens)
 *  - adminAuth middleware validates token + sets req.adminId
 *  - authLimiter applied on /login
 *  - All admin actions logged via securityLogger
 */

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const securityLog = require('../utils/securityLogger');

const {
  adminLogin,
  getMe,
  listAdmins,
  createAdmin,
  deactivateAdmin,
  getPlatformStats,
  listWorkers,
  listCompanies,
  listAllJobs,
  deleteWorker,
  deleteCompany,
  deleteJob,
  suspendUser,
  getAdminLogs,
  getReports,
  dispatchMission,
  updateMissionStatus,
  createReport,
  sendPardonMessage,
  listApplications,
  listCategories,
  createCategory,
  deleteCategory,
  verifyUser,
  getGlobalSettings,
  updateGlobalSettings,
  listTransactions,
  listBroadcasts,
  sendBroadcast,
  listSupportTickets,
} = require('../controllers/adminController');

const { authLimiter } = require('../middleware/security');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || (process.env.JWT_SECRET + '_admin_chamber');

// ─── Admin Authentication Middleware ─────────────────────────────────────────
const adminAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Admin token required.' });
  }

  try {
    const decoded = jwt.verify(authHeader.slice(7), ADMIN_JWT_SECRET);
    if (decoded.role !== 'admin') {
      securityLog.roleDenied(decoded.id, 'unknown', 'admin', req.originalUrl);
      throw new Error('Not an admin token.');
    }
    req.adminId = decoded.id;
    next();
  } catch (err) {
    securityLog.roleDenied('unknown', 'unknown', 'admin', req.originalUrl);
    res.status(401).json({ success: false, error: 'Invalid or expired admin token.' });
  }
};

// ─── Routes ───────────────────────────────────────────────────────────────────

// Login (rate-limited)
router.post('/login', authLimiter, adminLogin);

// Session
router.get('/me',    adminAuth, getMe);
router.get('/stats', adminAuth, getPlatformStats);
router.get('/logs',  adminAuth, getAdminLogs);

// Admin management (superadmin only — enforced in controller)
router.get('/admins',       adminAuth, listAdmins);
router.post('/admins',      adminAuth, createAdmin);
router.patch('/admins/:id', adminAuth, deactivateAdmin);

// User management
router.get('/workers',              adminAuth, listWorkers);
router.delete('/workers/:id',       adminAuth, deleteWorker);
router.patch('/suspend/:type/:id',  adminAuth, suspendUser);

router.get('/companies',            adminAuth, listCompanies);
router.delete('/companies/:id',     adminAuth, deleteCompany);

router.get('/jobs',                 adminAuth, listAllJobs);
router.delete('/jobs/:id',          adminAuth, deleteJob);

// Reports / Missions
router.get('/reports',                  adminAuth, getReports);
router.post('/reports',                 adminAuth, createReport);
router.patch('/reports/:id/dispatch',   adminAuth, dispatchMission);
router.patch('/reports/:id/status',     adminAuth, updateMissionStatus);

// Pardon
router.post('/pardon/:type/:id',        adminAuth, sendPardonMessage);

// Applications
router.get('/applications',             adminAuth, listApplications);

// Categories
router.get('/categories',               adminAuth, listCategories);
router.post('/categories',              adminAuth, createCategory);
router.delete('/categories/:id',        adminAuth, deleteCategory);

// Verification
router.patch('/verify/:type/:id',       adminAuth, verifyUser);

// Settings
router.get('/settings',                 adminAuth, getGlobalSettings);
router.patch('/settings',               adminAuth, updateGlobalSettings);

// Payments / Broadcasts / Support
router.get('/transactions',             adminAuth, listTransactions);
router.get('/broadcasts',               adminAuth, listBroadcasts);
router.post('/broadcasts',              adminAuth, sendBroadcast);
router.get('/support',                  adminAuth, listSupportTickets);

module.exports = router;
