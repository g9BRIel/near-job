/**
 * jobRoutes.js — Secure Job Routes
 *
 * GET /api/jobs  and  GET /api/jobs/:id  use optionalAuth so block-filtering
 * works for logged-in users while remaining accessible to unauthenticated clients.
 */

const express = require('express');
const router  = express.Router();

const {
  getJobs,
  getJobById,
  createJob,
  applyToJob,
  getWorkerApplications,
  getCompanyAllApplications,
  getJobApplications,
  updateApplicationStatus,
} = require('../controllers/jobController');

const authMiddleware = require('../middleware/authMiddleware');
const optionalAuth   = require('../middleware/optionalAuth');
const { validate }   = require('../middleware/validation');

// ─── Public / Optionally-authenticated ────────────────────────────────────────
router.get('/',    optionalAuth, getJobs);
router.get('/:id', optionalAuth, getJobById);

// ─── Company-only ─────────────────────────────────────────────────────────────
router.post('/', authMiddleware, validate('createJob'), createJob);

// ─── Application management ───────────────────────────────────────────────────
router.get('/my-applications',          authMiddleware, getWorkerApplications);
router.get('/company-applications',     authMiddleware, getCompanyAllApplications);
router.get('/:id/applications',         authMiddleware, getJobApplications);
router.put('/applications/:id/status',  authMiddleware, updateApplicationStatus);

// ─── Worker-only ──────────────────────────────────────────────────────────────
router.post('/:id/apply', authMiddleware, validate('applyToJob'), applyToJob);

module.exports = router;
