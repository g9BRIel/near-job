const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');
const Company = require('../models/Company');
const Job = require('../models/Job');
const AdminLog = require('../models/AdminLog');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const Application = require('../models/Application');
const Category = require('../models/Category');
const GlobalSettings = require('../models/GlobalSettings');
const Transaction = require('../models/Transaction');
const Broadcast = require('../models/Broadcast');
const { Op } = require('sequelize');


const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET + '_admin_chamber';

// Utility for logging
const logAdminAction = async (adminId, name, action, targetId, type, details) => {
  try {
    await AdminLog.create({ adminId, adminName: name, action, targetId: String(targetId), targetType: type, details });
  } catch (err) {
    console.error('LOG_ERROR:', err);
  }
};

const generateAdminToken = (id) => {
  return jwt.sign({ id, role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '8h' });
};

// POST /api/admin/login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ where: { email, isActive: true } });

    if (!admin) {
      return res.status(401).json({ message: 'Access denied. Invalid credentials.' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Access denied. Invalid credentials.' });
    }

    await admin.update({ lastLoginAt: new Date() });

    const adminData = admin.toJSON();
    delete adminData.password;

    await logAdminAction(admin.id, admin.name, 'LOGIN', admin.id, 'admin', 'System access authorized');

    return res.json({
      token: generateAdminToken(admin.id),
      admin: adminData,
    });
  } catch (error) {
    console.error('ADMIN_LOGIN_ERROR:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/admin/me
exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.adminId, {
      attributes: { exclude: ['password'] },
    });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/admins — list all admins
exports.listAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/admins — create a new admin (superadmin only)
exports.createAdmin = async (req, res) => {
  try {
    const self = await Admin.findByPk(req.adminId);
    if (!self || !self.isSuperAdmin) {
      return res.status(403).json({ message: 'Only super-admins can add new administrators.' });
    }

    const { email, password, name, adminType } = req.body;
    if (!email || !password || !name || !adminType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newAdmin = await Admin.create({
      email, password, name, adminType,
      isSuperAdmin: false,
      createdBy: req.adminId,
    });

    const result = newAdmin.toJSON();
    delete result.password;
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/admins/:id — toggle admin activity
exports.deactivateAdmin = async (req, res) => {
  try {
    const self = await Admin.findByPk(req.adminId);
    if (!self || !self.isSuperAdmin) {
      return res.status(403).json({ message: 'Only super-admins can manage administrators.' });
    }

    const target = await Admin.findByPk(req.params.id);
    if (!target) return res.status(404).json({ message: 'Admin not found' });
    if (target.id === req.adminId) return res.status(400).json({ message: 'Cannot deactivate yourself' });

    target.isActive = !target.isActive;
    await target.save();
    res.json({ message: 'Status updated', isActive: target.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/stats
exports.getPlatformStats = async (req, res) => {
  try {
    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');

    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);

    const [workers, companies, jobs, convs, messages, admins, newWorkers, newCompanies] = await Promise.all([
      Worker.count(),
      Company.count(),
      Job.count(),
      Conversation.count(),
      Message.count(),
      Admin.count({ where: { isActive: true } }),
      Worker.count({ where: { createdAt: { [Op.gte]: oneWeekAgo } } }),
      Company.count({ where: { createdAt: { [Op.gte]: oneWeekAgo } } }),
    ]);

    res.json({ 
      workers, 
      companies, 
      jobs, 
      conversations: convs, 
      messages, 
      activeAdmins: admins,
      newUsersLastWeek: newWorkers + newCompanies,
      newWorkersLastWeek: newWorkers,
      newCompaniesLastWeek: newCompanies
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- DATA MANAGEMENT ---

exports.listWorkers = async (req, res) => {
  try {
    const workers = await Worker.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.listAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      include: [{ model: Company, as: 'companyUser', attributes: ['companyName', 'logo'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByPk(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    await worker.destroy();
    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    await company.destroy();
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    await job.destroy();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { message } = req.body; // New field for pardon message
    const model = type === 'worker' ? Worker : Company;
    const user = await model.findByPk(id);
    const self = await Admin.findByPk(req.adminId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const wasBanned = user.isBanned;
    user.isBanned = !user.isBanned;
    await user.save();
    
    // If we are lifting a ban and a message is provided, send a pardon notification
    if (wasBanned && !user.isBanned && message) {
       await Notification.create({
         userId: user.id,
         userType: type,
         type: 'pardon',
         title: 'Administrative Account Reinstatement',
         message: message,
         link: '/dashboard'
       });
    }
    
    await logAdminAction(req.adminId, self.name, user.isBanned ? 'BAN_USER' : 'REINSTATE_USER', id, type, `Status toggled for ${user.email || id}`);

    res.json({ message: `User ${user.isBanned ? 'suspended' : 'reinstated'}`, isBanned: user.isBanned });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.adminId);
    let where = {};
    if (!admin.isSuperAdmin) {
      where = { assignedToType: admin.adminType };
    }
    const reports = await Report.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.dispatchMission = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, notes } = req.body;
    const report = await Report.findByPk(id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    report.assignedToType = type;
    report.status = 'assigned';
    if (notes) report.notes = notes;
    await report.save();
    const self = await Admin.findByPk(req.adminId);
    await logAdminAction(req.adminId, self.name, 'DISPATCH_MISSION', id, 'mission', `Assigned to ${type}`);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const report = await Report.findByPk(id);
    if (!report) return res.status(404).json({ message: 'Mission not found' });
    report.status = status;
    if (notes) report.notes = notes;
    await report.save();
    const self = await Admin.findByPk(req.adminId);
    await logAdminAction(req.adminId, self.name, 'UPDATE_MISSION', id, 'mission', `Status: ${status}`);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createReport = async (req, res) => {
  try {
    const { title, description, reporterId, priority, category } = req.body;
    const report = await Report.create({ title, description, reporterId, priority });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/admin/pardon/:type/:id — send a custom reinstatement message as notification
exports.sendPardonMessage = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { message, title } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });
    const model = type === 'worker' ? Worker : Company;
    const user = await model.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const self = await Admin.findByPk(req.adminId);
    const notification = await Notification.create({
      userId: user.id,
      userType: type,
      type: 'pardon',
      title: title || 'Administrative Message',
      message,
      link: '/dashboard'
    });
    await logAdminAction(req.adminId, self.name, 'SEND_PARDON_MSG', id, type, `Message sent to ${user.email || id}`);
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- APPLICATION MANAGEMENT ---
exports.listApplications = async (req, res) => {
  try {
    const apps = await Application.findAll({
      include: [
        { model: Worker, as: 'worker', attributes: ['fullName', 'email', 'avatar'] },
        { model: Job, as: 'job', attributes: ['title', 'companyId'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- CATEGORY MANAGEMENT ---
exports.listCategories = async (req, res) => {
  try {
    const cats = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(cats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const cat = await Category.create({ name, icon, description });
    const self = await Admin.findByPk(req.adminId);
    await logAdminAction(req.adminId, self.name, 'CREATE_CATEGORY', cat.id, 'category', `Created ${name}`);
    res.status(201).json(cat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    await cat.destroy();
    const self = await Admin.findByPk(req.adminId);
    await logAdminAction(req.adminId, self.name, 'DELETE_CATEGORY', req.params.id, 'category', `Deleted ${cat.name}`);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- VERIFICATION SYSTEM ---
exports.verifyUser = async (req, res) => {
  try {
    const { type, id } = req.params;
    const model = type === 'worker' ? Worker : Company;
    const user = await model.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = true;
    await user.save();

    const self = await Admin.findByPk(req.adminId);
    await logAdminAction(req.adminId, self.name, 'VERIFY_USER', id, type, `Verified ${user.email}`);

    // Notify user
    await Notification.create({
      userId: user.id,
      userType: type,
      type: 'verification',
      title: 'Success! Your account is verified',
      message: 'The administrative council has approved your credentials. You now have full access.',
      link: '/dashboard'
    });

    res.json({ success: true, message: 'User verified' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- SETTINGS ---
exports.getGlobalSettings = async (req, res) => {
  try {
    const settings = await GlobalSettings.findAll();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGlobalSettings = async (req, res) => {
  try {
    const { settings } = req.body; // Array of {key, value}
    for (const s of settings) {
      await GlobalSettings.upsert({ key: s.key, value: s.value, group: s.group || 'general' });
    }
    const self = await Admin.findByPk(req.adminId);
    await logAdminAction(req.adminId, self.name, 'UPDATE_SETTINGS', self.id, 'settings', 'Platform settings updated');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- PAYMENTS & TRANSACTIONS ---
exports.listTransactions = async (req, res) => {
  try {
    const txs = await Transaction.findAll({ order: [['createdAt', 'DESC']] });
    res.json(txs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- BROADCASTS & NOTIFICATIONS ---
exports.listBroadcasts = async (req, res) => {
  try {
    const list = await Broadcast.findAll({ order: [['createdAt', 'DESC']] });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendBroadcast = async (req, res) => {
  try {
    const { title, body, target, type } = req.body;
    const b = await Broadcast.create({ adminId: req.adminId, title, body, target, type });
    
    // Logic to create individual notifications for users would go here
    // for now we just record the broadcast
    
    const self = await Admin.findByPk(req.adminId);
    await logAdminAction(req.adminId, self.name, 'SEND_BROADCAST', b.id, 'broadcast', `Dispatched: ${title}`);
    
    res.json({ success: true, broadcast: b });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- SUPPORT TICKETS ---
exports.listSupportTickets = async (req, res) => {
  try {
    const tickets = await Report.findAll({ order: [['createdAt', 'DESC']] });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

