const { body, validationResult } = require('express-validator');

/**
 * Middleware: run express-validator and return 400 if errors found
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

// ─── Auth Validators ──────────────────────────────────────────────────────────
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// ─── Folder Validators ────────────────────────────────────────────────────────
const createFolderValidator = [
  body('name').trim().notEmpty().withMessage('Folder name is required').isLength({ max: 100 }).withMessage('Folder name too long'),
  validate,
];

module.exports = { registerValidator, loginValidator, createFolderValidator };
