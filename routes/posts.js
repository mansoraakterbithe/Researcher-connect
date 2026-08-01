// ============================================================
// FILE: routes/posts.js
// Posts routes — the ResearchConnect feed
//
// ResearchConnect context:
// Every card on the home feed is a post.
// Posts can be: a research update, a paper, a question,
// a need help request, or an opportunity.
// Supervisors post opportunities. Students post questions.
// Everyone can like and comment.
// ============================================================

const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ── ROUTE 1: GET /api/posts ───────────────────────────────
// Get all posts for the home feed
// Used by: Home Feed page when it loads
//
// How it works:
// 1. Get the most recent posts from MongoDB
// 2. For each post, also get the author's name and photo
//    (this is called "populating" a reference)
// 3. Return them newest first
//
// Pagination:
// We cannot send ALL posts at once — could be thousands.
// We send 10 at a time. The frontend asks for page 1, page 2 etc.
// Like Instagram — scroll down to load more.
router.get('/', protect, async (req, res) => {
  try {
    // req.query.page = which page? default is 1
    // req.query.type = filter by post type? (paper, question etc.)
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // 10 posts per page
    const skip = (page - 1) * limit;
    // page 1: skip 0, take 10
    // page 2: skip 10, take 10
    // page 3: skip 20, take 10

    // Build filter
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.field) filter.tags = { $in: [req.query.field] };

    const posts = await Post.find(filter)
      .populate('author', 'username university role profilePhoto isVerified')
      // populate means: instead of just storing the author's ID,
      // go get their name, university, role and photo from User collection
      // ResearchConnect context: this is how the post card shows
      // "Dr. Sarah Chen — UCL" with her verified badge
      .sort({ createdAt: -1 })
      // sort by createdAt descending = newest first
      .skip(skip)
      .limit(limit);

    // Count total posts for pagination
    const total = await Post.countDocuments(filter);

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 2: POST /api/posts ──────────────────────────────
// Create a new post
// Used by: Create Post Modal when user clicks "Post"
//
// ResearchConnect context:
// When Mansora fills in the Create Post modal and clicks Post,
// the frontend sends all the form data here.
// We save it to MongoDB and it appears on the feed.
router.post('/', protect, async (req, res) => {
  try {
    const {
      type, title, content, tags,
      // Paper specific
      abstract, venue, year, link,
      // Need Help specific
      urgency,
      // Opportunity specific
      deadline, funding, requirements, duration, location
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Check if student is trying to post an opportunity
    // Only supervisors can post opportunities
    if (type === 'opportunity' && req.user.role === 'student') {
      return res.status(403).json({
        message: 'Only verified supervisors can post opportunities'
      });
      // 403 means: Forbidden — you are authenticated but not allowed
    }

    const post = await Post.create({
      author: req.user._id,
      // req.user._id = the logged in user's MongoDB ID
      type: type || 'post',
      title,
      content,
      tags: tags || [],
      abstract,
      venue,
      year,
      link,
      urgency,
      deadline,
      funding,
      requirements,
      duration,
      location
    });

    // Populate author info before sending back
    // so the frontend can immediately show the post card
    await post.populate('author', 'username university role profilePhoto isVerified');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: GET /api/posts/:id ───────────────────────────
// Get a single post by ID
// Used by: Post Detail page
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username university role profilePhoto isVerified')
      .populate('comments.author', 'username profilePhoto role');
    // Also populate comment authors so we can show who commented

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ post });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 4: DELETE /api/posts/:id ────────────────────────
// Delete a post
// Used by: Post options menu — "Delete Post"
// Only the author can delete their own post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership — is the logged in user the author?
    // post.author is the MongoDB ObjectId of the author
    // req.user._id is the MongoDB ObjectId of the logged in user
    // .toString() converts both to strings for comparison
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorised — you can only delete your own posts'
      });
    }

    await post.deleteOne();

    res.status(200).json({ message: 'Post deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 5: PUT /api/posts/:id/like ─────────────────────
// Like or unlike a post (toggle)
// Used by: Like button on post cards
//
// ResearchConnect context:
// When Prof. Ahmed Hassan clicks like on Mansora's paper,
// his ID gets added to the post's likes array.
// If he clicks again, it gets removed (unlike).
// The frontend shows the current like count from likes.length
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked
    // .some() returns true if ANY element matches the condition
    const alreadyLiked = post.likes.some(
      id => id.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      // Unlike — remove their ID from likes array
      // .filter() keeps everything EXCEPT their ID
      post.likes = post.likes.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      // Like — add their ID to likes array
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      liked: !alreadyLiked
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 6: POST /api/posts/:id/comment ─────────────────
// Add a comment to a post
// Used by: Answer button on question posts, Chat button on papers
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add comment to the post's comments array
    const comment = {
      author: req.user._id,
      content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    // Populate the new comment's author before sending back
    await post.populate('comments.author', 'username profilePhoto role');

    res.status(201).json({
      message: 'Comment added',
      comment: post.comments[post.comments.length - 1]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;