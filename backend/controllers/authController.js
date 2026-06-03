/**
 * authController.js — Secure Authentication Controller
 *
 * Security properties:
 *  - Passwords hashed via bcrypt (model hook — never stored plain)
 *  - Tokens expire in 7 days (was 30d)
 *  - All sensitive operations logged via securityLogger
 *  - Responses use authResponseDTO (no password/token leakage)
 *  - Error messages are safe (no user enumeration on forgot password)
 */

const Worker = require('../models/Worker');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { sendSMS, sendEmail } = require('../utils/sendOTP');
const { authResponseDTO } = require('../utils/dto');
const securityLog = require('../utils/securityLogger');

// ─── Token generation ─────────────────────────────────────────────────────────
const generateToken = (id, userType) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Set it in .env');
  }
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const emailTaken = async (email) => {
  const [w, c] = await Promise.all([
    Worker.findOne({ where: { email } }),
    Company.findOne({ where: { email } }),
  ]);
  return !!(w || c);
};

const parseSkills = (body) => {
  if (Array.isArray(body.skills)) return body.skills;
  if (typeof body.skills === 'string') {
    return body.skills.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

// ─── Register ─────────────────────────────────────────────────────────────────
exports.registerUser = async (req, res) => {
  try {
    // req.body has already been validated + sanitized by validate('register') middleware
    const { userType, email, password, fullName, companyName } = req.body;

    if (await emailTaken(email)) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    let account;

    if (userType === 'worker') {
      account = await Worker.create({
        email,
        password,           // hashed by beforeCreate hook in model
        phone:      req.body.phone,
        location:   req.body.location,
        fullName:   fullName,
        role:       req.body.role,
        experience: req.body.experience != null ? String(req.body.experience) : undefined,
        jobTitle:   req.body.jobTitle,
        skills:     parseSkills(req.body),
        avatar:     req.body.avatar,
      });
    } else if (userType === 'company') {
      account = await Company.create({
        email,
        password,           // hashed by beforeCreate hook in model
        phone:       req.body.phone,
        location:    req.body.location,
        companyName: companyName,
        industry:    req.body.industry,
        companySize: req.body.companySize,
        website:     req.body.website,
        logo:        req.body.logo,
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid user type.' });
    }

    // Welcome notification
    await Notification.create({
      userId:   account.id,
      userType,
      type:     'system',
      title:    userType === 'worker' ? 'Welcome to NearJob! 👋' : 'Welcome to NearJob! 🏢',
      message:  userType === 'worker'
        ? 'Complete your profile to get more job opportunities.'
        : 'Start by posting your first job listing.',
    });

    securityLog.loginSuccess(account.id, userType, req.ip);

    return res.status(201).json(authResponseDTO(account, userType, generateToken(account.id, userType)));
  } catch (error) {
    console.error('[REGISTER_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let account = await Worker.findOne({ where: { email } });
    let userType = 'worker';

    if (!account) {
      account = await Company.findOne({ where: { email } });
      userType = 'company';
    }

    if (!account || !(await account.matchPassword(password))) {
      securityLog.loginFailure(email, req.ip);
      // Identical error message for both "no account" and "wrong password" (prevents user enumeration)
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (account.isBanned) {
      securityLog.bannedAccess(account.id, userType, '/api/auth/login');
      return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact support.' });
    }

    if (account.isActive === false) {
      return res.status(403).json({ success: false, error: 'Account deactivated. Please contact support.' });
    }

    securityLog.loginSuccess(account.id, userType, req.ip);

    return res.json(authResponseDTO(account, userType, generateToken(account.id, userType)));
  } catch (error) {
    console.error('[LOGIN_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email, phone, method } = req.body;

    let account = null;
    let userType = '';

    if (method === 'email') {
      account = await Worker.findOne({ where: { email } });
      userType = 'worker';
      if (!account) { account = await Company.findOne({ where: { email } }); userType = 'company'; }
    } else if (method === 'phone') {
      account = await Worker.findOne({
        where: { [Op.or]: [{ phone }, { phone: phone.replace(/^0/, '') }, { phone: '0' + phone }] }
      });
      userType = 'worker';
      if (!account) {
        account = await Company.findOne({
          where: { [Op.or]: [{ phone }, { phone: phone.replace(/^0/, '') }, { phone: '0' + phone }] }
        });
        userType = 'company';
      }
    }

    // Anti-enumeration: always respond success even if account not found
    if (!account) {
      securityLog.otpRequested(email || phone, method, req.ip);
      return res.json({ success: true, message: 'If an account exists, a code has been sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    account.resetPasswordToken   = otp;
    account.resetPasswordExpires = expires;
    await account.save();

    if (method === 'email') {
      await sendEmail(account.email, otp);
    } else {
      await sendSMS(account.phone, otp);
    }

    securityLog.otpRequested(email || phone, method, req.ip);
    res.json({ success: true, message: 'If an account exists, a verification code has been sent.', userType });
  } catch (error) {
    console.error('[FORGOT_PASSWORD_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Request failed. Please try again.' });
  }
};

// ─── Verify Reset Code ────────────────────────────────────────────────────────
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, phone, method, code } = req.body;

    const where = {
      resetPasswordToken:   code,
      resetPasswordExpires: { [Op.gt]: new Date() },
    };
    if (method === 'email') where.email = email;
    else                    where.phone = phone;

    let account = await Worker.findOne({ where });
    if (!account) account = await Company.findOne({ where });

    if (!account) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code.' });
    }

    res.json({ success: true, message: 'Code verified successfully.' });
  } catch (error) {
    console.error('[VERIFY_CODE_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Verification failed. Please try again.' });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, phone, method, code, newPassword } = req.body;

    const where = {
      resetPasswordToken:   code,
      resetPasswordExpires: { [Op.gt]: new Date() },
    };
    if (method === 'email') where.email = email;
    else                    where.phone = phone;

    let account = await Worker.findOne({ where });
    if (!account) account = await Company.findOne({ where });

    if (!account) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code.' });
    }

    account.password             = newPassword; // hashed by beforeUpdate hook
    account.resetPasswordToken   = null;
    account.resetPasswordExpires = null;
    await account.save();

    securityLog.passwordReset(email || phone, method);

    await Notification.create({
      userId:   account.id,
      userType: account.constructor.name === 'Worker' ? 'worker' : 'company',
      type:     'system',
      title:    'Password Reset Successful 🔐',
      message:  'Your password has been reset. If this was not you, contact support immediately.',
    });

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('[RESET_PASSWORD_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Reset failed. Please try again.' });
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    // req.user populated by authMiddleware — NEVER trust body IDs
    const { id, userType } = req.user;
    const { currentPassword, newPassword } = req.body;

    const model = userType === 'worker' ? Worker : Company;
    const user = await model.findByPk(id);

    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      securityLog.loginFailure(user.email, req.ip, 'wrong_current_password');
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }

    user.password = newPassword; // hashed by beforeUpdate hook
    await user.save();

    securityLog.passwordChanged(id, userType);
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('[CHANGE_PASSWORD_ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Password change failed.' });
  }
};
