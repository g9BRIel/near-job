/**
 * jobController.js — Secure Job Controller
 *
 * Security properties:
 *  - createJob: enforces company role, assigns companyId from req.user.id (NOT body)
 *  - applyToJob: enforces worker role, workerId from req.user.id
 *  - getJobApplications: validates job ownership via DB (companyId === req.user.id)
 *  - updateApplicationStatus: validates job ownership at DB level
 *  - Removed manual JWT parsing (use req.user from authMiddleware instead)
 *  - Outputs filtered through DTO
 */

const Job         = require('../models/Job');
const Company     = require('../models/Company');
const Application = require('../models/Application');
const Worker      = require('../models/Worker');
const Block       = require('../models/Block');
const { Op }      = require('sequelize');
const { jobDTO, workerPublicDTO, applicationDTO } = require('../utils/dto');

// ─── GET /api/jobs ────────────────────────────────────────────────────────────
exports.getJobs = async (req, res) => {
  try {
    const filters = {};
    if (req.query.companyId) {
      filters.companyId = parseInt(req.query.companyId, 10);
    }

    // req.user is optionally populated by optionalAuth middleware
    const workerId = (req.user?.userType === 'worker') ? req.user.id : null;

    const jobs = await Job.findAll({
      where: filters,
      include: [{
        model: Company,
        as: 'companyUser',
        attributes: ['id', 'companyName', 'logo', 'location', 'isBanned'],
      }],
      order: [['createdAt', 'DESC']],
    });

    if (workerId) {
      const [applications, blocks] = await Promise.all([
        Application.findAll({ where: { workerId }, attributes: ['jobId'] }),
        Block.findAll({
          where: {
            [Op.or]: [
              { blockerId: workerId, blockerType: 'worker',  blockedType: 'company' },
              { blockedId: workerId, blockedType: 'worker',  blockerType: 'company' },
            ],
          },
        }),
      ]);

      const appliedJobIds      = new Set(applications.map((a) => a.jobId));
      const blockedCompanyIds  = new Set(
        blocks.map((b) => (b.blockerType === 'company' ? b.blockerId : b.blockedId))
      );

      const result = jobs
        .filter((job) => !blockedCompanyIds.has(job.companyId) && !job.companyUser?.isBanned)
        .map((job) => jobDTO(job, { isApplied: appliedJobIds.has(job.id) }));

      return res.json({ success: true, data: result });
    }

    const filteredJobs = jobs.filter((j) => !j.companyUser?.isBanned);
    return res.json({ success: true, data: filteredJobs.map((j) => jobDTO(j)) });
  } catch (error) {
    console.error('[GET_JOBS_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch jobs.' });
  }
};

// ─── GET /api/jobs/:id ────────────────────────────────────────────────────────
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{
        model: Company,
        as: 'companyUser',
        attributes: ['id', 'companyName', 'logo', 'location', 'isBanned'],
      }],
    });

    if (!job) return res.status(404).json({ success: false, error: 'Job not found.' });
    if (job.companyUser?.isBanned) return res.status(404).json({ success: false, error: 'Job not found.' });

    // Block check (optional auth populated by optionalAuth)
    if (req.user) {
      const isBlocked = await Block.findOne({
        where: {
          [Op.or]: [
            { blockerId: req.user.id, blockerType: req.user.userType, blockedId: job.companyId, blockedType: 'company' },
            { blockerId: job.companyId, blockerType: 'company', blockedId: req.user.id, blockedType: req.user.userType },
          ],
        },
      });
      if (isBlocked) return res.status(404).json({ success: false, error: 'Job not found.' });
    }

    res.json({ success: true, data: jobDTO(job) });
  } catch (error) {
    console.error('[GET_JOB_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch job.' });
  }
};

// ─── POST /api/jobs (company only) ───────────────────────────────────────────
exports.createJob = async (req, res) => {
  try {
    if (req.user.userType !== 'company') {
      return res.status(403).json({ success: false, error: 'Only companies can post jobs.' });
    }

    const company = await Company.findByPk(req.user.id);
    const safeBody = {
      title:       req.body.title,
      description: req.body.description,
      location:    req.body.location,
      salary:      req.body.salary,
      type:        req.body.type,
      category:    req.body.category,
      skills:      req.body.skills,
      // companyId is ALWAYS from req.user.id — never from body
      companyId:   req.user.id,
      companyName: company?.companyName || 'Company',
      logo:        req.body.logo || company?.logo || null,
    };

    const job = await Job.create(safeBody);
    res.status(201).json({ success: true, data: jobDTO(job) });
  } catch (error) {
    console.error('[CREATE_JOB_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to create job.' });
  }
};

// ─── POST /api/jobs/:id/apply (worker only) ───────────────────────────────────
exports.applyToJob = async (req, res) => {
  try {
    if (req.user.userType !== 'worker') {
      return res.status(403).json({ success: false, error: 'Only workers can apply to jobs.' });
    }

    const jobId   = parseInt(req.params.id, 10);
    const workerId = req.user.id; // Always from token

    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found.' });

    const isBlocked = await Block.findOne({
      where: {
        [Op.or]: [
          { blockerId: workerId, blockerType: 'worker', blockedId: job.companyId, blockedType: 'company' },
          { blockerId: job.companyId, blockerType: 'company', blockedId: workerId, blockedType: 'worker' },
        ],
      },
    });
    if (isBlocked) {
      return res.status(403).json({ success: false, error: 'Cannot apply to this job.' });
    }

    const existing = await Application.findOne({ where: { jobId, workerId } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'You have already applied for this job.' });
    }

    const worker = await Worker.findByPk(workerId, { attributes: ['cv'] });

    const application = await Application.create({
      jobId,
      workerId,
      coverLetter: req.body.coverLetter || '',
      resume:      req.body.resume || worker?.cv || null,
      status:      'pending',
    });

    await job.increment('applicants', { by: 1 });

    res.status(201).json({ success: true, message: 'Application submitted.', data: { id: application.id, status: application.status } });
  } catch (error) {
    console.error('[APPLY_JOB_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to submit application.' });
  }
};

// ─── GET /api/jobs/my-applications (worker only) ──────────────────────────────
exports.getWorkerApplications = async (req, res) => {
  try {
    if (req.user.userType !== 'worker') {
      return res.status(403).json({ success: false, error: 'Only workers can access this.' });
    }

    const workerId = req.user.id; // Always from token — IDOR prevented
    const applications = await Application.findAll({
      where: { workerId },
      include: [{
        model: Job,
        as: 'job',
        required: false,
        include: [{ model: Company, as: 'companyUser', attributes: ['id', 'companyName', 'logo'], required: false }],
      }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: applications.map(applicationDTO) });
  } catch (error) {
    console.error('[WORKER_APPS_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch applications.' });
  }
};

// ─── GET /api/jobs/:id/applications (company only, OWNS the job) ──────────────
exports.getJobApplications = async (req, res) => {
  try {
    if (req.user.userType !== 'company') {
      return res.status(403).json({ success: false, error: 'Only companies can access this.' });
    }

    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, error: 'Job not found.' });

    // Ownership check at DB level
    if (Number(job.companyId) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, error: 'Access denied. You do not own this job.' });
    }

    const applications = await Application.findAll({
      where: { jobId: req.params.id },
      include: [{
        model: Worker,
        as: 'worker',
        attributes: ['id', 'fullName', 'email', 'location', 'jobTitle', 'skills', 'avatar', 'bio', 'isBanned'],
      }],
      order: [['createdAt', 'DESC']],
    });
    
    // Anonymize banned workers
    const sanitizedApps = applications.map(app => {
      const plain = app.get({ plain: true });
      if (plain.worker && plain.worker.isBanned) {
        plain.worker = {
          id: plain.worker.id,
          fullName: 'NearJob User',
          email: null,
          location: null,
          jobTitle: null,
          skills: null,
          avatar: null,
          bio: null,
          isBanned: true
        };
      }
      return plain;
    });

    res.json({ success: true, data: sanitizedApps });
  } catch (error) {
    console.error('[JOB_APPS_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch applications.' });
  }
};

// ─── GET /api/jobs/company-applications (company, all their jobs) ─────────────
exports.getCompanyAllApplications = async (req, res) => {
  try {
    if (req.user.userType !== 'company') {
      return res.status(403).json({ success: false, error: 'Only companies can access this.' });
    }

    const companyId = req.user.id; // Always from token — IDOR prevented
    const companyJobs = await Job.findAll({ where: { companyId }, attributes: ['id'] });
    const jobIds      = companyJobs.map((j) => j.id);

    const applications = await Application.findAll({
      where: { jobId: jobIds },
      include: [
        {
          model: Job,
          as: 'job',
          required: false,
          include: [{ model: Company, as: 'companyUser', attributes: ['id', 'companyName', 'logo'], required: false }],
        },
        {
          model: Worker,
          as: 'worker',
          required: false,
          attributes: ['id', 'fullName', 'email', 'location', 'jobTitle', 'skills', 'avatar', 'bio', 'isBanned'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const sanitizedApps = applications.map(app => {
      const plain = (typeof app.get === 'function') ? app.get({ plain: true }) : app;
      if (plain.worker && plain.worker.isBanned) {
        plain.worker = {
          id: plain.worker.id,
          fullName: 'NearJob User',
          email: null,
          location: null,
          jobTitle: null,
          skills: null,
          avatar: null,
          bio: null,
          isBanned: true
        };
      }
      return applicationDTO(plain);
    });

    res.json({ success: true, data: sanitizedApps });
  } catch (error) {
    console.error('[COMPANY_APPS_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch applications.' });
  }
};

// ─── PUT /api/jobs/applications/:id/status (company, OWNS the job) ────────────
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value.' });
    }

    const application = await Application.findByPk(req.params.id, {
      include: [{ model: Job, as: 'job' }],
    });

    if (!application) return res.status(404).json({ success: false, error: 'Application not found.' });

    // DB-level ownership check
    if (Number(application.job.companyId) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    application.status = status;
    await application.save();

    res.json({ success: true, message: `Application ${status}.`, data: { id: application.id, status } });
  } catch (error) {
    console.error('[UPDATE_APP_STATUS_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
};
