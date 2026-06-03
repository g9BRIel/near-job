/**
 * userController.js — Secure User Profile & Analytics Controller
 *
 * Security properties:
 *  - ALL operations use req.user.id (never trust body/param IDs for own-resource ops)
 *  - Responses use DTO layer (no password/token leakage)
 *  - getAllUsers excludes sensitive fields and respects block lists
 *  - Mass-assignment prevented — only whitelisted fields are updated
 */

const Worker  = require('../models/Worker');
const Company = require('../models/Company');
const Block   = require('../models/Block');
const { Op }  = require('sequelize');
const {
  workerPrivateDTO,
  workerPublicDTO,
  companyPrivateDTO,
  companyPublicDTO,
} = require('../utils/dto');
const securityLog = require('../utils/securityLogger');

// ─── Whitelisted update fields (mass-assignment prevention) ─────────────────
const WORKER_ALLOWED_FIELDS = [
  'fullName', 'phone', 'location', 'latitude', 'longitude',
  'role', 'experience', 'jobTitle', 'skills', 'bio', 'avatar', 'cv', 'settings',
];

const COMPANY_ALLOWED_FIELDS = [
  'companyName', 'phone', 'location', 'latitude', 'longitude',
  'industry', 'companySize', 'website', 'logo', 'bio', 'settings',
];

const pickFields = (obj, allowed) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => allowed.includes(k)));

// ─── GET /api/users/me ────────────────────────────────────────────────────────
exports.getUserProfile = async (req, res) => {
  try {
    const { id, userType } = req.user; // Always from token — never from body

    if (userType === 'worker') {
      const worker = await Worker.findByPk(id, { attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] } });
      if (!worker) return res.status(404).json({ success: false, error: 'User not found.' });
      return res.json({ success: true, data: workerPrivateDTO(worker) });
    }

    const company = await Company.findByPk(id, { attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] } });
    if (!company) return res.status(404).json({ success: false, error: 'User not found.' });
    return res.json({ success: true, data: companyPrivateDTO(company) });
  } catch (error) {
    console.error('[GET_PROFILE_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch profile.' });
  }
};

// ─── PUT /api/users/me ────────────────────────────────────────────────────────
exports.updateUserProfile = async (req, res) => {
  try {
    const { id, userType } = req.user; // From token

    // Strip any fields not in whitelist (mass-assignment prevention)
    const safeBody = userType === 'worker'
      ? pickFields(req.body, WORKER_ALLOWED_FIELDS)
      : pickFields(req.body, COMPANY_ALLOWED_FIELDS);

    if (userType === 'worker') {
      const worker = await Worker.findByPk(id);
      if (!worker) return res.status(404).json({ success: false, error: 'User not found.' });
      await worker.update(safeBody);
      return res.json({ success: true, data: workerPrivateDTO(worker) });
    }

    const company = await Company.findByPk(id);
    if (!company) return res.status(404).json({ success: false, error: 'User not found.' });
    await company.update(safeBody);
    return res.json({ success: true, data: companyPrivateDTO(company) });
  } catch (error) {
    console.error('[UPDATE_PROFILE_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
};

// ─── DELETE /api/users/me ─────────────────────────────────────────────────────
exports.deleteMyAccount = async (req, res) => {
  try {
    const { id, userType } = req.user; // From token
    const model = userType === 'worker' ? Worker : Company;
    const user = await model.findByPk(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    await user.destroy();
    securityLog.accountDeleted(id, userType);
    res.json({ success: true, message: 'Account and all associated data deleted.' });
  } catch (error) {
    console.error('[DELETE_ACCOUNT_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete account.' });
  }
};

// ─── GET /api/users?userType=worker|company ───────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { userType } = req.query;
    if (!['worker', 'company'].includes(userType)) {
      return res.status(400).json({ success: false, error: 'Query ?userType=worker or ?userType=company is required.' });
    }

    const currentUserId   = req.user?.id;
    const currentUserType = req.user?.userType;

    let blockedIds = [];
    if (currentUserId) {
      const [iBlocked, blockedMe] = await Promise.all([
        Block.findAll({ where: { blockerId: currentUserId, blockerType: currentUserType, blockedType: userType } }),
        Block.findAll({ where: { blockedId: currentUserId, blockedType: currentUserType, blockerType: userType } }),
      ]);
      blockedIds = [
        ...iBlocked.map((b) => b.blockedId),
        ...blockedMe.map((b) => b.blockerId),
      ];
    }

    const where = {
      isBanned: false, // Never expose banned accounts to regular users
      id:       { [Op.notIn]: blockedIds.length ? blockedIds : [-1] },
    };

    if (userType === 'worker') {
      const rows = await Worker.findAll({ where, attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'cv', 'phone', 'email'] } });
      // Public list: use public DTO (no email/phone/cv)
      return res.json({ success: true, data: rows.map(workerPublicDTO) });
    }

    const rows = await Company.findAll({ where, attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'phone', 'email'] } });
    return res.json({ success: true, data: rows.map(companyPublicDTO) });
  } catch (error) {
    console.error('[GET_ALL_USERS_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch users.' });
  }
};

// ─── GET /api/users/status ────────────────────────────────────────────────────
exports.getOnlineStatus = async (req, res) => {
  try {
    const { userId, userType } = req.query;
    if (!userId || !['worker', 'company'].includes(userType)) {
      return res.status(400).json({ success: false, error: 'userId and valid userType are required.' });
    }

    const currentUserId   = req.user?.id;
    const currentUserType = req.user?.userType;

    if (currentUserId) {
      const isBlocked = await Block.findOne({
        where: {
          [Op.or]: [
            { blockerId: currentUserId, blockerType: currentUserType, blockedId: userId,      blockedType: userType },
            { blockerId: userId,        blockerType: userType,        blockedId: currentUserId, blockedType: currentUserType },
          ],
        },
      });
      if (isBlocked) {
        return res.json({ success: true, data: { userId, userType, isOnline: false, lastActiveAt: null, isBlocked: true } });
      }
    }

    const model = userType === 'worker' ? Worker : Company;
    const user  = await model.findByPk(userId, { attributes: ['id', 'lastActiveAt'] });
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const minutesAgo = (Date.now() - new Date(user.lastActiveAt)) / 60000;
    res.json({
      success: true,
      data: {
        userId: user.id,
        userType,
        isOnline:     minutesAgo < 5,
        lastActiveAt: user.lastActiveAt,
        minutesSinceActive: Math.floor(minutesAgo),
      },
    });
  } catch (error) {
    console.error('[ONLINE_STATUS_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch status.' });
  }
};

// ─── GET /api/users/analytics ────────────────────────────────────────────────
const fs   = require('fs');
const path = require('path');
const ANALYTICS_DIR  = path.join(__dirname, '../data');
const ANALYTICS_FILE = path.join(ANALYTICS_DIR, 'user_analytics.json');

const getPersistentAnalytics = (userId) => {
  try {
    if (!fs.existsSync(ANALYTICS_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8') || '{}');
    const lastReset = new Date(data.lastReset || 0);
    if ((Date.now() - lastReset) > 7 * 86400000) {
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify({ lastReset: new Date(), users: {} }));
      return null;
    }
    return data.users?.[userId] || null;
  } catch { return null; }
};

const savePersistentAnalytics = (userId, userData) => {
  try {
    if (!fs.existsSync(ANALYTICS_DIR)) fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
    let data = { lastReset: new Date(), users: {} };
    if (fs.existsSync(ANALYTICS_FILE)) {
      try { data = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8')); } catch { /**/ }
    }
    if (!data.users) data.users = {};
    data.users[userId] = userData;
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
  } catch (e) { console.error('[ANALYTICS_WRITE_ERROR]', e.message); }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const { id, userType } = req.user; // Always from token
    const { Op, fn, col }  = require('sequelize');
    const Message          = require('../models/Message');

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const activityData = await Message.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: {
        [Op.or]: [
          { senderWorkerId:  userType === 'worker'  ? id : null },
          { senderCompanyId: userType === 'company' ? id : null },
        ],
        createdAt: { [Op.gte]: new Date(Date.now() - 7 * 86400000) },
      },
      group: [fn('DATE', col('createdAt'))],
      raw: true,
    });

    const weeklyStats = last7Days.map((date) => {
      const found = activityData.find((d) => d.date === date);
      return found ? parseInt(found.count) : 0;
    });

    const result = { weeklyStats, totalActivity: weeklyStats.reduce((a, b) => a + b, 0), label: 'Messages Sent', updatedAt: new Date() };
    savePersistentAnalytics(id, result);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[ANALYTICS_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics.' });
  }
};

// ─── GET /api/users/global-analytics ─────────────────────────────────────────
exports.getGlobalAnalytics = async (req, res) => {
  try {
    const { Op, fn, col } = require('sequelize');
    const Job             = require('../models/Job');
    const Conversation    = require('../models/Conversation');

    const jobStats = await Job.findAll({
      attributes: [[fn('MONTH', col('createdAt')), 'month'], [fn('COUNT', col('id')), 'count']],
      where: { createdAt: { [Op.gte]: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } },
      group: [fn('MONTH', col('createdAt'))],
      raw: true,
    });

    const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
      const found = jobStats.find((s) => parseInt(s.month) === i + 1);
      return found ? parseInt(found.count) : 0;
    });

    const allWorkers = await Worker.findAll({ attributes: ['skills'], raw: true });
    const skillCounts = {};
    allWorkers.forEach((w) => {
      let skills = [];
      try { skills = Array.isArray(w.skills) ? w.skills : JSON.parse(w.skills || '[]'); } catch { skills = []; }
      skills.forEach((s) => { if (s) skillCounts[s] = (skillCounts[s] || 0) + 1; });
    });
    const topSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, demand: Math.min(Math.round((count / Math.max(allWorkers.length, 1)) * 100), 100) }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 5);

    const [totalWorkers, totalCompanies, totalMatches] = await Promise.all([
      Worker.count(),
      Company.count(),
      Conversation.count(),
    ]);

    res.json({
      success: true,
      data: {
        monthlyTrends,
        topSkills: topSkills.length ? topSkills : [{ skill: 'React', demand: 90 }],
        stats: {
          totalMatches:  totalMatches > 1000 ? `${(totalMatches / 1000).toFixed(1)}K` : totalMatches,
          avgResponse:   '1.2h',
          successRate:   '85%',
          activeUsers:   (totalWorkers + totalCompanies) > 1000
            ? `${((totalWorkers + totalCompanies) / 1000).toFixed(1)}K`
            : (totalWorkers + totalCompanies),
        },
      },
    });
  } catch (error) {
    console.error('[GLOBAL_ANALYTICS_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics.' });
  }
};

// ─── POST /api/users/rate ─────────────────────────────────────────────────────
exports.rateUser = async (req, res) => {
  try {
    const { toId, toType, stars, comment } = req.body;
    const fromId   = req.user.id;   // Always from token
    const fromType = req.user.userType;
    const Rating   = require('../models/Rating');

    if (Number(toId) === Number(fromId) && toType === fromType) {
      return res.status(400).json({ success: false, error: 'You cannot rate yourself.' });
    }

    const targetModel = toType === 'worker' ? Worker : Company;
    const target = await targetModel.findByPk(toId);
    if (!target) return res.status(404).json({ success: false, error: 'Target user not found.' });

    let ratingRecord = await Rating.findOne({ where: { fromId, toId, fromType, toType } });
    if (ratingRecord) {
      ratingRecord.stars   = stars;
      ratingRecord.comment = comment;
      await ratingRecord.save();
    } else {
      await Rating.create({ fromId, toId, fromType, toType, stars, comment });
    }

    const allRatings = await Rating.findAll({ where: { toId, toType } });
    const avgRating  = allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length;
    target.rating      = parseFloat(avgRating.toFixed(1));
    target.ratingCount = allRatings.length;
    await target.save();

    res.json({ success: true, message: 'Rating submitted.', newRating: target.rating });
  } catch (error) {
    console.error('[RATING_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Failed to submit rating.' });
  }
};
