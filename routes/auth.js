const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validate');

// ── ROUTE 1: POST /api/auth/signup ───────────────────────
// Create a new ResearchConnect account
// validateSignup runs first and checks all inputs are valid
// If validation fails it returns errors immediately
// If validation passes it runs the async function
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Scramble password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in MongoDB
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'student'
    });

    // Create session token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 2: POST /api/auth/login ────────────────────────
// Login to ResearchConnect
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password matches scrambled version in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create session token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: GET /api/auth/me ─────────────────────────────
// Get currently logged in user
// protect middleware checks JWT token first
router.get('/me', protect, async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 4: POST /api/auth/logout ───────────────────────
// Logout — frontend deletes token from localStorage
router.post('/logout', protect, async (req, res) => {
  try {
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 5: POST /api/auth/forgot-password ──────────────
// Send password reset link
// ResearchConnect context:
// User clicks "Forgot Password" on login page
// Types their email — we send them a reset link
// In development: reset token prints to console
// In production: sends real email via nodemailer
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    // Always return the same message whether email exists or not
    // This prevents revealing which emails are registered
    if (!user) {
      return res.status(200).json({
        message: 'If this email is registered you will receive a reset link'
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before saving — never store raw tokens
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token and expiry (1 hour) to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save();

    // In development — print to console instead of sending email
    console.log('\n📧 Password Reset (Development):');
    console.log('To:', user.email);
    console.log('Token:', resetToken);
    console.log('URL: http://localhost:5173/reset-password?token=' + resetToken);
    console.log('Expires in: 1 hour\n');

    res.status(200).json({
      message: 'If this email is registered you will receive a reset link'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 6: POST /api/auth/reset-password ───────────────
// Reset password using token from email
// ResearchConnect context:
// User clicks the link in their email
// Frontend sends the token + new password here
// We verify the token and update their password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: 'Token and new password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    // Hash the token from the request to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with matching token that has not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired reset token. Please request a new one.'
      });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      message: 'Password reset successful. You can now log in with your new password.'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;