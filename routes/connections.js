// ============================================================
// FILE: routes/connections.js
// Connection routes — researcher network
//
// ResearchConnect context:
// Connections are like LinkedIn connections but for research.
// When two researchers connect, they can message each other
// and see each other's full profiles.
// Connection requests go through an accept/decline flow
// so people are not spammed.
// ============================================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// ── ROUTE 1: POST /api/connections/request/:id ───────────
// Send a connection request to another researcher
// Used by: Follow button on profile, suggested connections
router.post('/request/:id', protect, async (req, res) => {
  try {
    const targetId = req.params.id;

    // Cannot connect with yourself
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot connect with yourself'
      });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    if (req.user.following.includes(targetId)) {
      return res.status(400).json({
        message: 'You are already connected with this researcher'
      });
    }

    // Add to following/followers
    // When Mansora follows Dr. Sarah:
    // - Mansora's following array gets Dr. Sarah's ID
    // - Dr. Sarah's followers array gets Mansora's ID
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { following: targetId }
      // $addToSet adds to array only if not already there
      // prevents duplicates
    });

    await User.findByIdAndUpdate(targetId, {
      $addToSet: { followers: req.user._id }
    });

    // Create notification for the target user
    await Notification.create({
      recipient: targetId,
      type: 'connection_request',
      title: `${req.user.username} started following you`,
      body: `${req.user.username} from ${req.user.university || 'ResearchConnect'} is now following you. They are interested in your research.`,
      actionPath: `/profile/${req.user._id}`,
      triggeredBy: req.user._id
    });

    res.status(200).json({
      message: `You are now following ${targetUser.username}`
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 2: DELETE /api/connections/unfollow/:id ────────
// Unfollow a researcher
router.delete('/unfollow/:id', protect, async (req, res) => {
  try {
    const targetId = req.params.id;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: targetId }
      // $pull removes an item from an array
    });

    await User.findByIdAndUpdate(targetId, {
      $pull: { followers: req.user._id }
    });

    res.status(200).json({ message: 'Unfollowed successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: GET /api/connections ────────────────────────
// Get my connections (who I follow)
// Used by: Connections page
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('following', 'username university role profilePhoto researchInterests status')
      .populate('followers', 'username university role profilePhoto researchInterests status');

    res.status(200).json({
      following: user.following,
      followers: user.followers,
      followingCount: user.following.length,
      followersCount: user.followers.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 4: GET /api/connections/suggestions ────────────
// Get suggested researchers to connect with
// Used by: Right sidebar on Home Feed, Connections page
//
// ResearchConnect context:
// Suggests researchers who share research interests
// with the logged in user but are not already followed
router.get('/suggestions', protect, async (req, res) => {
  try {
    // Find researchers with overlapping research interests
    // who are not already followed and are not the current user
    const suggestions = await User.find({
      _id: {
        $ne: req.user._id,        // not the current user
        $nin: req.user.following  // not already following
      },
      researchInterests: {
        $in: req.user.researchInterests  // shares at least one interest
      }
    })
      .select('username university role profilePhoto researchInterests status')
      .limit(5);

    res.status(200).json({ suggestions });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;