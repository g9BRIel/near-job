/**
 * validation.js — Centralized Input Validation with Joi
 *
 * Security properties:
 *  - Strips unknown fields (mass-assignment prevention)
 *  - Enforces min lengths, types, and formats
 *  - Returns structured 400 errors without leaking internals
 *  - Password strength enforced at registration
 */

const Joi = require('joi');

// ─── Reusable field schemas ───────────────────────────────────────────────────
const email    = Joi.string().email().max(255).lowercase().trim().required();
const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
    'string.min': 'Password must be at least 8 characters.',
  });

const passwordLoose = Joi.string().min(6).max(128).required(); // for login (don't penalize old accounts)
const id = Joi.number().integer().positive().required();

// ─── Schema Definitions ───────────────────────────────────────────────────────
const schemas = {
  // Auth
  register: Joi.object({
    userType:    Joi.string().valid('worker', 'company').required(),
    email,
    password,
    fullName:    Joi.string().max(100).when('userType', { is: 'worker',  then: Joi.required(), otherwise: Joi.optional() }),
    companyName: Joi.string().max(100).when('userType', { is: 'company', then: Joi.required(), otherwise: Joi.optional() }),
    phone:       Joi.string().max(20).optional().allow('', null),
    location:    Joi.string().max(200).optional().allow('', null),
    // Extra worker fields
    role:        Joi.string().max(100).optional().allow('', null),
    experience:  Joi.alternatives().try(Joi.string(), Joi.number()).optional().allow('', null),
    jobTitle:    Joi.string().max(100).optional().allow('', null),
    skills:      Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    avatar:      Joi.string().max(500000).optional().allow('', null), // base64 or URL
    // Extra company fields
    industry:    Joi.string().max(100).optional().allow('', null),
    companySize: Joi.string().max(50).optional().allow('', null),
    website:     Joi.string().uri().max(300).optional().allow('', null),
    logo:        Joi.string().max(500000).optional().allow('', null),
  }),

  login: Joi.object({
    email,
    password: passwordLoose,
  }),

  forgotPassword: Joi.object({
    method: Joi.string().valid('email', 'phone').required(),
    email:  Joi.string().email().when('method', { is: 'email', then: Joi.required(), otherwise: Joi.optional() }),
    phone:  Joi.string().max(20).when('method', { is: 'phone', then: Joi.required(), otherwise: Joi.optional() }),
  }),

  verifyCode: Joi.object({
    method: Joi.string().valid('email', 'phone').required(),
    email:  Joi.string().email().optional(),
    phone:  Joi.string().max(20).optional(),
    code:   Joi.string().length(6).pattern(/^\d+$/).required().messages({
      'string.pattern.base': 'OTP must be 6 digits.',
    }),
  }),

  resetPassword: Joi.object({
    method:      Joi.string().valid('email', 'phone').required(),
    email:       Joi.string().email().optional(),
    phone:       Joi.string().max(20).optional(),
    code:        Joi.string().length(6).pattern(/^\d+$/).required(),
    newPassword: password,
  }),

  changePassword: Joi.object({
    currentPassword: passwordLoose,
    newPassword:     password,
  }),

  // Profile update — whitelist only safe fields
  updateWorkerProfile: Joi.object({
    fullName:   Joi.string().max(100).optional(),
    phone:      Joi.string().max(20).optional().allow('', null),
    location:   Joi.string().max(200).optional().allow('', null),
    latitude:   Joi.number().min(-90).max(90).optional().allow(null),
    longitude:  Joi.number().min(-180).max(180).optional().allow(null),
    role:       Joi.string().max(100).optional().allow('', null),
    experience: Joi.alternatives().try(Joi.string(), Joi.number()).optional().allow('', null),
    jobTitle:   Joi.string().max(100).optional().allow('', null),
    skills:     Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    bio:        Joi.string().max(2000).optional().allow('', null),
    avatar:     Joi.string().max(500000).optional().allow('', null),
    cv:         Joi.string().max(2000000).optional().allow('', null),
    settings:   Joi.object().optional(),
  }),

  updateCompanyProfile: Joi.object({
    companyName: Joi.string().max(100).optional(),
    phone:       Joi.string().max(20).optional().allow('', null),
    location:    Joi.string().max(200).optional().allow('', null),
    latitude:    Joi.number().min(-90).max(90).optional().allow(null),
    longitude:   Joi.number().min(-180).max(180).optional().allow(null),
    industry:    Joi.string().max(100).optional().allow('', null),
    companySize: Joi.string().max(50).optional().allow('', null),
    website:     Joi.string().uri().max(300).optional().allow('', null),
    logo:        Joi.string().max(500000).optional().allow('', null),
    bio:         Joi.string().max(2000).optional().allow('', null),
    settings:    Joi.object().optional(),
  }),

  // Jobs
  createJob: Joi.object({
    title:       Joi.string().max(200).required(),
    description: Joi.string().max(5000).required(),
    location:    Joi.string().max(200).optional().allow('', null),
    salary:      Joi.alternatives().try(Joi.string(), Joi.number()).optional().allow('', null),
    type:        Joi.string().valid('full-time', 'part-time', 'contract', 'freelance', 'internship').optional(),
    category:    Joi.string().max(100).optional().allow('', null),
    skills:      Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
    logo:        Joi.string().max(500000).optional().allow('', null),
    companyName: Joi.string().max(100).optional().allow('', null),
  }),

  applyToJob: Joi.object({
    coverLetter: Joi.string().max(3000).optional().allow('', null),
    resume:      Joi.string().max(2000000).optional().allow('', null),
  }),

  // Messaging
  sendMessage: Joi.object({
    conversationId: Joi.number().integer().positive().required(),
    text:           Joi.string().min(1).max(1000).required(),
  }),

  // Rating
  rateUser: Joi.object({
    toId:    id,
    toType:  Joi.string().valid('worker', 'company').required(),
    stars:   Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(500).optional().allow('', null),
  }),

  // Report
  submitReport: Joi.object({
    reportedId:   id,
    reportedType: Joi.string().valid('worker', 'company').required(),
    reason:       Joi.string().max(100).required(),
    details:      Joi.string().max(2000).optional().allow('', null),
  }),
};

// ─── Generic validate middleware factory ──────────────────────────────────────
/**
 * Usage: validate('login')  or  validate('register')
 * Strips unknown fields automatically.
 */
const validate = (schemaName) => (req, res, next) => {
  const schema = schemas[schemaName];
  if (!schema) {
    console.error(`[VALIDATION] Unknown schema: "${schemaName}"`);
    return res.status(500).json({ success: false, error: 'Validation misconfiguration.' });
  }

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,     // collect ALL errors at once
    stripUnknown: true,    // OWASP: prevent mass assignment
    allowUnknown: false,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field:   d.path.join('.'),
      message: d.message,
    }));
    return res.status(400).json({ success: false, error: 'Validation failed.', details });
  }

  req.body = value; // replace with sanitized + stripped body
  next();
};

module.exports = { validate, schemas };
