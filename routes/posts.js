const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validatePost } = require('../middleware/validate');

// ── ROUTE 1: GET /api/posts ───────────────────────────────
// Get all posts for the home feed — newest first
// Supports pagination and filtering by type or tag
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.field) filter.tags = { $in: [req.query.field] };

    const posts = await Post.find(filter)
      .populate('author', 'username university role profilePhoto isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

// ── ROUTE 2: GET /api/posts/debt ─────────────────────────
// Get Research Debt posts — Feature W17
// Must be before /:id route or Express catches it as an ID
router.get('/debt', protect, async (req, res) => {
  try {
    const { field } = req.query;

    const filter = { type: 'need' };
    if (field) filter.tags = { $in: [field] };

    const posts = await Post.find(filter)
      .populate('author', 'username university role profilePhoto isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({ posts, count: posts.length });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: GET /api/posts/:id ───────────────────────────
// Get a single post by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username university role profilePhoto isVerified')
      .populate('comments.author', 'username profilePhoto role');

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

// ── ROUTE 4: POST /api/posts ──────────────────────────────
// Create a new post
// validatePost checks title exists and is correct length
router.post('/', protect, validatePost, async (req, res) => {
  try {
    const {
      type, title, content, tags,
      abstract, venue, year, link,
      urgency,
      deadline, funding, requirements, duration, location
    } = req.body;

    // Only supervisors can post opportunities
    if (type === 'opportunity' && req.user.role === 'student') {
      return res.status(403).json({
        message: 'Only verified supervisors can post opportunities'
      });
    }

    const post = await Post.create({
      author: req.user._id,
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

    await post.populate('author', 'username university role profilePhoto isVerified');

    // Award karma for posting
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { karmaScore: 5 }
    });

    res.status(201).json({
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 5: PUT /api/posts/:id ──────────────────────────
// Edit a post — only author can edit
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorised — you can only edit your own posts'
      });
    }

    const allowedUpdates = ['title', 'content', 'tags', 'abstract', 'venue', 'year', 'link', 'urgency', 'deadline', 'funding', 'requirements', 'duration', 'location'];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    await post.save();
    await post.populate('author', 'username university role profilePhoto isVerified');

    res.status(200).json({
      message: 'Post updated successfully',
      post
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 6: DELETE /api/posts/:id ────────────────────────
// Delete a post — only author can delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

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

// ── ROUTE 7: PUT /api/posts/:id/like ─────────────────────
// Like or unlike a post — toggles
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = post.likes.some(
      id => id.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push(req.user._id);

      // Award karma to post author when someone likes their post
      if (post.author.toString() !== req.user._id.toString()) {
        await User.findByIdAndUpdate(post.author, {
          $inc: { karmaScore: 1 }
        });
      }
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

// ── ROUTE 8: POST /api/posts/:id/comment ─────────────────
// Add a comment to a post
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: 'Comment cannot exceed 1000 characters' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      author: req.user._id,
      content: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('comments.author', 'username profilePhoto role');

    // Award karma to post author for getting a comment
    if (post.author.toString() !== req.user._id.toString()) {
      await User.findByIdAndUpdate(post.author, {
        $inc: { karmaScore: 2 }
      });
    }

    res.status(201).json({
      message: 'Comment added',
      comment: post.comments[post.comments.length - 1]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 9: DELETE /api/posts/:id/comment/:commentId ────
// Delete a comment — only comment author can delete
router.delete('/:id/comment/:commentId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorised — you can only delete your own comments'
      });
    }

    comment.deleteOne();
    await post.save();

    res.status(200).json({ message: 'Comment deleted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;