const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

// Get all notifications for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        userId: req.user.id,
        userType: req.user.userType,
      },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        userType: req.user.userType,
      }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all as read
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.update({ isRead: true }, {
      where: {
        userId: req.user.id,
        userType: req.user.userType,
        isRead: false,
      }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
