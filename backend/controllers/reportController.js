const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const reporterId = req.user ? (req.user.email || req.user.id) : 'Anonymous';

    const report = await Report.create({
      title,
      description,
      priority: priority || 'medium',
      reporterId,
      status: 'pending',
      assignedToType: 'superadmin'
    });

    res.status(201).json({ 
      message: 'Report submitted successfully. Our safety team will review it.', 
      report 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit report', error: err.message });
  }
};
