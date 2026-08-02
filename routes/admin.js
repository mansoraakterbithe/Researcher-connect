// ============================================================
// FILE: routes/admin.js
// Admin routes — platform management
//
// ResearchConnect context:
// When a supervisor signs up with an .ac.uk email,
// an admin needs to verify them before they can post
// opportunities or appear as verified on the platform.
//
// Admin routes are protected by both:
// 1. protect middleware — must be logged in
// 2. adminAuth middleware — must be admin
// ============================================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Application = require('../models/Application');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
// TEMPORARY — make a user admin for testing
// DELETE THIS BEFORE GOING TO PRODUCTION
router.put('/make-admin/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin: true },
      { new: true }
    );
    res.status(200).json({ message: 'Admin access granted', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// All admin routes require login + admin role
router.use(protect);
router.use(adminAuth);

// ── ROUTE 1: GET /api/admin/stats ────────────────────────
// Platform statistics dashboard
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalSupervisors,
      totalPosts,
      totalApplications,
      pendingApplications,
      unverifiedSupervisors
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'supervisor' }),
      Post.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'supervisor', isVerified: false })
    ]);

    res.status(200).json({
      stats: {
        totalUsers,
        totalStudents,
        totalSupervisors,
        totalPosts,
        totalApplications,
        pendingApplications,
        unverifiedSupervisors
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 2: GET /api/admin/supervisors/unverified ───────
// List all unverified supervisors
// Used by: Admin dashboard — verify supervisors
router.get('/supervisors/unverified', async (req, res) => {
  try {
    const supervisors = await User.find({
      role: 'supervisor',
      isVerified: false
    }).select('-password').sort({ createdAt: -1 });

    res.status(200).json({ supervisors });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: PUT /api/admin/verify/:id ───────────────────
// Verify a supervisor
// Used by: Admin dashboard — clicking Verify button
router.put('/verify/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'supervisor') {
      return res.status(400).json({ message: 'Can only verify supervisors' });
    }

    user.isVerified = true;
    user.verifiedAt = new Date();
    await user.save();

    res.status(200).json({
      message: `${user.username} has been verified as a supervisor`,
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 4: DELETE /api/admin/users/:id ─────────────────
// Delete a user account
// Used by: Admin dashboard — remove spam or fake accounts
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot delete another admin
    if (user.isAdmin) {
      return res.status(403).json({ message: 'Cannot delete admin accounts' });
    }

    await user.deleteOne();

    res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 5: DELETE /api/admin/posts/:id ─────────────────
// Delete any post (moderating content)
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted by admin' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;