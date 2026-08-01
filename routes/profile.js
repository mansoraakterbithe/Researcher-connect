// ============================================================
// FILE: routes/profile.js
// Profile routes — get and update researcher profiles
//
// ResearchConnect context:
// When Dr. Sarah Chen opens her profile page, the frontend
// calls GET /api/profile/me to get her data.
// When she edits and saves, it calls PUT /api/profile/me.
// When a student clicks her name on the feed, it calls
// GET /api/profile/:id to see her public profile.
// ============================================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ── ROUTE 1: GET /api/profile/me ─────────────────────────
// Get MY own profile — requires login
// Used by: Profile page, Edit Profile page, Navbar avatar
//
// How it works:
// 1. protect middleware checks JWT token — who is this?
// 2. req.user is already set by protect middleware
// 3. We just send it back
//
// Why separate from /auth/me?
// /auth/me returns basic auth info
// /profile/me will later return richer data
// including posts count, papers count, match scores
router.get('/me', protect, async (req, res) => {
  try {
    // req.user was set by the protect middleware
    // It already has the full user object without password
    res.status(200).json({ profile: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 2: PUT /api/profile/me ─────────────────────────
// Update MY profile — requires login
// Used by: Edit Profile page save button
//
// How it works:
// 1. Student/supervisor fills in Edit Profile form
// 2. Clicks Save Changes
// 3. Frontend sends all changed fields here
// 4. We update only the fields they sent
// 5. Return the updated profile
//
// What fields can be updated:
// - Basic: bio, university, department, location, remote
// - Research: skills, researchInterests
// - Status: status, openTo
// - Student: seekingSupervisor, targetDegree, fundingNeeded, availableFrom
// - Supervisor: availability
// - Social: socialLinks
//
// What CANNOT be updated here:
// - email (security — needs separate verification)
// - password (security — needs separate change password route)
// - role (needs admin approval)
// - karmaScore, impactScore (calculated automatically)
router.put('/me', protect, async (req, res) => {
  try {
    // These are the only fields allowed to be updated
    // This is called a whitelist — we explicitly allow only these
    // If someone tries to send karmaScore: 9999, we ignore it
    const allowedFields = [
      'bio',
      'university',
      'department',
      'location',
      'remote',
      'skills',
      'researchInterests',
      'status',
      'openTo',
      'seekingSupervisor',
      'targetDegree',
      'fundingNeeded',
      'availableFrom',
      'availability',
      'socialLinks',
      'profilePhoto',
      'coverPhoto'
    ];

    // Build update object — only include fields that were sent
    // and are in our allowed list
    const updateData = {};
    allowedFields.forEach(field => {
      // req.body[field] !== undefined means: did they send this field?
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // findByIdAndUpdate finds the user and updates them in one step
    // { new: true } means: return the UPDATED document not the old one
    // { runValidators: true } means: check the rules in our schema
    //   e.g. status must be 'active', 'passive', or 'closed'
    const updatedProfile = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: GET /api/profile/:id ────────────────────────
// Get ANY user's public profile by their ID
// Used by: When a student clicks a supervisor's name on the feed
//          When viewing search results
//          When clicking "View Profile" on a connection card
//
// How it works:
// 1. Frontend sends the user's MongoDB ID in the URL
//    e.g. GET /api/profile/6a6e5e379eb7dbabe43e1ca7
// 2. We find that user in MongoDB
// 3. We return their PUBLIC profile — not everything
//    (we hide email, password, private settings)
//
// Why hide email?
// Email is private. If someone wants to contact them,
// they use ResearchConnect's messaging system —
// not cold email. This is the Cold Email Killer feature.
router.get('/:id', protect, async (req, res) => {
  try {
    // req.params.id = the ID from the URL
    const profile = await User.findById(req.params.id)
      .select('-password -email -matchScoreCache');
    // We hide: password, email, internal match cache

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ profile });

  } catch (error) {
    // If the ID format is wrong, MongoDB throws a CastError
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 4: GET /api/profile/search ─────────────────────
// Search for researchers by name, university, or research area
// Used by: Search Results page
router.get('/search', protect, async (req, res) => {
  try {
    const { q, role, university, field } = req.query;
    // req.query contains URL parameters like ?q=AI&role=supervisor

    // Build search filter
    const filter = {};

    if (q) {
      // $or means: match ANY of these conditions
      // $regex means: search for this text pattern
      // $options: 'i' means: case insensitive
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { university: { $regex: q, $options: 'i' } },
        { researchInterests: { $regex: q, $options: 'i' } }
      ];
    }

    if (role) filter.role = role;
    if (university) filter.university = { $regex: university, $options: 'i' };
    if (field) filter.researchInterests = { $in: [field] };

    const profiles = await User.find(filter)
      .select('-password -email -matchScoreCache')
      .limit(20); // never return more than 20 at once

    res.status(200).json({ profiles, count: profiles.length });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;