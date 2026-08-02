// ============================================================
// FILE: middleware/validate.js
// Input validation rules for all routes
//
// ResearchConnect context:
// Before saving anything to MongoDB, we check that
// the data makes sense. This prevents:
// - Empty passwords being saved
// - Invalid email formats
// - 10,000 character bios
// - Roles that do not exist
//
// We use express-validator which gives us clean,
// readable validation rules.
// ============================================================

const { body, validationResult } = require('express-validator');

// ── MIDDLEWARE: Check validation results ──────────────────
// This runs AFTER the validation rules
// If there are errors, it sends them back immediately
// If no errors, it calls next() to continue
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// ── SIGNUP VALIDATION RULES ───────────────────────────────
const validateSignup = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 100 }).withMessage('Password cannot exceed 100 characters'),

  body('role')
    .optional()
    .isIn(['student', 'supervisor', 'researcher'])
    .withMessage('Role must be student, supervisor or researcher'),

  handleValidationErrors
];

// ── LOGIN VALIDATION RULES ────────────────────────────────
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors
];

// ── PROFILE UPDATE VALIDATION RULES ──────────────────────
const validateProfileUpdate = [
  body('bio')
    .optional()
    .isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters'),

  body('university')
    .optional()
    .isLength({ max: 100 }).withMessage('University name too long'),

  body('department')
    .optional()
    .isLength({ max: 100 }).withMessage('Department name too long'),

  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array')
    .custom(skills => skills.length <= 50).withMessage('Maximum 50 skills allowed'),

  body('researchInterests')
    .optional()
    .isArray().withMessage('Research interests must be an array')
    .custom(interests => interests.length <= 30).withMessage('Maximum 30 research interests allowed'),

  handleValidationErrors
];

// ── POST VALIDATION RULES ─────────────────────────────────
const validatePost = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),

  body('type')
    .optional()
    .isIn(['post', 'paper', 'question', 'need', 'opportunity'])
    .withMessage('Invalid post type'),

  body('content')
    .optional()
    .isLength({ max: 5000 }).withMessage('Content cannot exceed 5000 characters'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom(tags => tags.length <= 10).withMessage('Maximum 10 tags allowed'),

  handleValidationErrors
];

// ── APPLICATION VALIDATION RULES ──────────────────────────
const validateApplication = [
  body('supervisorId')
    .notEmpty().withMessage('Supervisor ID is required')
    .isMongoId().withMessage('Invalid supervisor ID'),

  body('why')
    .trim()
    .notEmpty().withMessage('Please explain why you want to work with this supervisor')
    .isLength({ min: 50, max: 2000 }).withMessage('Why field must be 50-2000 characters'),

  body('background')
    .trim()
    .notEmpty().withMessage('Please describe your research background')
    .isLength({ min: 50, max: 2000 }).withMessage('Background must be 50-2000 characters'),

  handleValidationErrors
];

// ── MESSAGE VALIDATION RULES ──────────────────────────────
const validateMessage = [
  body('content')
    .trim()
    .notEmpty().withMessage('Message cannot be empty')
    .isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),

  handleValidationErrors
];

// ── PASSWORD RESET VALIDATION ─────────────────────────────
const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address'),

  handleValidationErrors
];

const validateResetPassword = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('token')
    .notEmpty().withMessage('Reset token is required'),

  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateLogin,
  validateProfileUpdate,
  validatePost,
  validateApplication,
  validateMessage,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors
};