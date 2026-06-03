const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const Job = require('../models/Job');
const Worker = require('../models/Worker');
const Company = require('../models/Company');
const { Op } = require('sequelize');
// We require auth middleware
const authMiddleware = require('../middleware/authMiddleware');

// Get all bookmarks for a user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const rawBookmarks = await Bookmark.findAll({
      where: {
        userId: req.user.id,
        userType: req.user.userType,
      },
      order: [['createdAt', 'DESC']]
    });

    const jobIds = rawBookmarks.filter(b => b.targetType === 'job').map(b => b.targetId);
    const workerIds = rawBookmarks.filter(b => b.targetType === 'worker').map(b => b.targetId);
    const companyIds = rawBookmarks.filter(b => b.targetType === 'company').map(b => b.targetId);
    
    const [jobs, workers, companies] = await Promise.all([
      jobIds.length > 0 ? Job.findAll({ where: { id: { [Op.in]: jobIds } }, include: [{ model: Company, as: 'companyUser', attributes: ['companyName', 'logo'] }] }) : [],
      workerIds.length > 0 ? Worker.findAll({ where: { id: { [Op.in]: workerIds } }, attributes: ['id', 'fullName', 'jobTitle', 'avatar', 'location', 'role'] }) : [],
      companyIds.length > 0 ? Company.findAll({ where: { id: { [Op.in]: companyIds } }, attributes: ['id', 'companyName', 'logo', 'industry', 'location'] }) : []
    ]);

    const jobMap = new Map(jobs.map(j => [j.id, j]));
    const workerMap = new Map(workers.map(w => [w.id, w]));
    const companyMap = new Map(companies.map(c => [c.id, c]));

    const populatedBookmarks = rawBookmarks.map(bm => {
      const data = bm.toJSON();
      if (bm.targetType === 'job') {
        data.job = jobMap.get(bm.targetId);
      } else if (bm.targetType === 'worker') {
        data.worker = workerMap.get(bm.targetId);
      } else if (bm.targetType === 'company') {
        data.company = companyMap.get(bm.targetId);
      }
      return data;
    }).filter(bm => bm.job || bm.worker || bm.company); // Only return bookmarks that still have valid target children

    res.json(populatedBookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle bookmark (add if missing, remove if exists)
router.post('/toggle', authMiddleware, async (req, res) => {
  try {
    const { targetId, targetType } = req.body;
    
    if (!targetId || !targetType) {
      return res.status(400).json({ message: 'targetId and targetType required' });
    }

    const existing = await Bookmark.findOne({
      where: {
        userId: req.user.id,
        userType: req.user.userType,
        targetId,
        targetType
      }
    });

    if (existing) {
      await existing.destroy();
      return res.json({ action: 'removed' });
    } else {
      const created = await Bookmark.create({
        userId: req.user.id,
        userType: req.user.userType,
        targetId,
        targetType
      });
      return res.json({ action: 'added', bookmark: created });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
