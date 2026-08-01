// ============================================================
// FILE: routes/search.js
// Search routes — find researchers, posts, opportunities
//
// ResearchConnect context:
// When someone types in the search bar on ResearchConnect,
// this route handles it. They can search for:
// - A researcher by name or university
// - A post by keyword or tag
// - An opportunity by field or funding type
// - A supervisor by research area
// ============================================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const { calculateMatchScore } = require('../utils/matchScore');

// ── ROUTE 1: GET /api/search ──────────────────────────────
// Global search across users and posts
// Used by: Search bar — search results page
//
// Query parameters:
// ?q=medical imaging     — search term
// ?type=supervisor       — filter by role
// ?field=AI              — filter by research field
// ?page=1                — pagination
router.get('/', protect, async (req, res) => {
  try {
    const { q, type, field, funding, page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    const results = {
      users: [],
      posts: [],
      totalUsers: 0,
      totalPosts: 0
    };

    if (!q && !type && !field) {
      return res.status(400).json({
        message: 'Please provide a search term'
      });
    }

    // ── SEARCH USERS ─────────────────────────────────────
    const userFilter = {};

    if (q) {
      userFilter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { university: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } },
        { researchInterests: { $regex: q, $options: 'i' } },
        { skills: { $regex: q, $options: 'i' } }
      ];
    }

    if (type) userFilter.role = type;
    if (field) userFilter.researchInterests = { $in: [field] };

    const users = await User.find(userFilter)
      .select('-password -email -matchScoreCache')
      .limit(limit)
      .skip(skip);

    results.totalUsers = await User.countDocuments(userFilter);

    // Add match score to each user result
    results.users = users.map(user => {
      const matchResult = calculateMatchScore(req.user, user);
      return {
        ...user.toObject(),
        matchScore: matchResult.score
      };
    });

    // Sort users by match score
    results.users.sort((a, b) => b.matchScore - a.matchScore);

    // ── SEARCH POSTS ──────────────────────────────────────
    const postFilter = {};

    if (q) {
      postFilter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { abstract: { $regex: q, $options: 'i' } }
      ];
    }

    if (field) postFilter.tags = { $in: [field] };
    if (funding) postFilter.funding = { $regex: funding, $options: 'i' };

    const posts = await Post.find(postFilter)
      .populate('author', 'username university role profilePhoto isVerified')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    results.totalPosts = await Post.countDocuments(postFilter);
    results.posts = posts;

    res.status(200).json({
      ...results,
      query: q,
      currentPage: parseInt(page)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 2: GET /api/search/supervisors ─────────────────
// Search specifically for supervisors with filters
// Used by: Smart Match Feed filters
router.get('/supervisors', protect, async (req, res) => {
  try {
    const { field, university, funding, status, q } = req.query;

    const filter = { role: 'supervisor' };

    if (status) filter['availability.status'] = status;
    if (field) filter.researchInterests = { $in: [field] };
    if (university) filter.university = { $regex: university, $options: 'i' };
    if (funding === 'true') filter['availability.fundedSlots'] = { $gt: 0 };
    if (q) {
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { researchInterests: { $regex: q, $options: 'i' } }
      ];
    }

    const supervisors = await User.find(filter)
      .select('-password -email -matchScoreCache')
      .sort({ responseRate: -1 });
    // Sort by response rate — Cold Email Killer feature
    // Best responders appear first

    // Add match scores
    const withScores = supervisors.map(sup => {
      const matchResult = calculateMatchScore(req.user, sup);
      return {
        ...sup.toObject(),
        matchScore: matchResult.score
      };
    });

    withScores.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      supervisors: withScores,
      total: withScores.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;