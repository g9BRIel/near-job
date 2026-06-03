const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for user registration
const validateRegister = [
  body('userType')
    .isIn(['worker', 'company'])
    .withMessage('User type must be either worker or company'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .if(body('userType').equals('worker'))
    .notEmpty()
    .withMessage('Full name is required for workers'),
  body('companyName')
    .if(body('userType').equals('company'))
    .notEmpty()
    .withMessage('Company name is required for companies'),
  handleValidationErrors
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Validation for sending message
const validateSendMessage = [
  body('receiverId')
    .toInt()
    .isInt({ min: 1 })
    .withMessage('Receiver ID must be a valid integer'),
  body('receiverType')
    .isIn(['worker', 'company'])
    .withMessage('receiverType must be worker or company'),
  body('text')
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message text is required and must be less than 1000 characters'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateSendMessage
};