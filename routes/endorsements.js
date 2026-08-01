// ============================================================
// FILE: routes/endorsements.js
// Endorsement routes — skill verification between researchers
// ============================================================

const express = require('express');
const router = express.Router();
const Endorsement = require('../models/Endorsement');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// ── ROUTE 1: POST /api/endorsements ──────────────────────
// Endorse someone's skill
// Used by: "+ Endorse" button on profile page
//
// ResearchConnect context:
// Prof. Hassan clicks "+ Endorse" next to "SHAP" on
// Mansora's profile. This route creates an endorsement
// linking Prof. Hassan to Mansora for SHAP.
// Mansora's karma goes up by 2 points.
// She gets a notification.
router.post('/', protect, async (req, res) => {
  try {
    const { recipientId, skill, note } = req.body;

    // Cannot endorse yourself
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot endorse your own skills'
      });
    }

    // Check recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check the skill exists on their profile
    if (!recipient.skills.includes(skill)) {
      return res.status(400).json({
        message: 'This skill is not on their profile'
      });
    }

    // Create endorsement
    const endorsement = await Endorsement.create({
      endorser: req.user._id,
      recipient: recipientId,
      skill,
      note
    });

    // Award karma to the recipient
    // Feature W5: Research Karma System
    await User.findByIdAndUpdate(recipientId, {
      $inc: { karmaScore: 2, impactScore: 5 }
    });

    // Create notification for recipient
    await Notification.create({
      recipient: recipientId,
      type: 'endorsement',
      title: `${req.user.username} endorsed your ${skill} skill`,
      body: note
        ? `"${note}"`
        : `${req.user.username} from ${req.user.university || 'ResearchConnect'} verified your ${skill} skill.`,
      actionPath: `/profile/${req.user._id}`,
      triggeredBy: req.user._id,
      relatedId: endorsement._id.toString()
    });

    await endorsement.populate('endorser', 'username profilePhoto role university');

    res.status(201).json({
      message: `Successfully endorsed ${recipient.username} for ${skill}`,
      endorsement
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You have already endorsed this skill'
      });
    }
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 2: GET /api/endorsements/:userId ────────────────
// Get all endorsements for a user
// Used by: Profile page — Skill Endorsements section
//
// ResearchConnect context:
// Shows Mansora's profile with:
// Deep Learning — 5 endorsements (Prof. Hassan, Dr. Chen...)
// SHAP — 3 endorsements
// Medical Imaging — 4 endorsements
router.get('/:userId', protect, async (req, res) => {
  try {
    const endorsements = await Endorsement.find({
      recipient: req.params.userId
    })
      .populate('endorser', 'username profilePhoto role university isVerified')
      .sort({ createdAt: -1 });

    // Group endorsements by skill
    // Result: { "Python": [...endorsers], "SHAP": [...endorsers] }
    const grouped = {};
    endorsements.forEach(e => {
      if (!grouped[e.skill]) {
        grouped[e.skill] = {
          skill: e.skill,
          count: 0,
          endorsers: []
        };
      }
      grouped[e.skill].count++;
      grouped[e.skill].endorsers.push(e.endorser);
    });

    res.status(200).json({
      endorsements: Object.values(grouped),
      totalEndorsements: endorsements.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: DELETE /api/endorsements ────────────────────
// Remove an endorsement
// Used by: If endorser changes their mind
router.delete('/', protect, async (req, res) => {
  try {
    const { recipientId, skill } = req.body;

    const endorsement = await Endorsement.findOneAndDelete({
      endorser: req.user._id,
      recipient: recipientId,
      skill
    });

    if (!endorsement) {
      return res.status(404).json({ message: 'Endorsement not found' });
    }

    // Remove karma that was awarded
    await User.findByIdAndUpdate(recipientId, {
      $inc: { karmaScore: -2, impactScore: -5 }
    });

    res.status(200).json({ message: 'Endorsement removed' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;