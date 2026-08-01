// ============================================================
// FILE: models/Post.js
// Defines what a post looks like in MongoDB
//
// ResearchConnect context:
// Every card on the home feed is a Post document.
// A post has a type — paper, question, opportunity etc.
// Each type has different fields but shares the same base.
// ============================================================

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema(
  {
    // Who wrote this post
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // What kind of post is this?
    type: {
      type: String,
      enum: ['post', 'paper', 'question', 'need', 'opportunity'],
      default: 'post'
    },

    // ── SHARED FIELDS (all post types) ───────────────────
    title: { type: String, required: true },
    content: { type: String, default: '' },
    tags: { type: [String], default: [] },

    // ── PAPER SPECIFIC ───────────────────────────────────
    // Used when type === 'paper'
    abstract: { type: String, default: '' },
    venue: { type: String, default: '' },    // e.g. IEEE ICCIT 2024
    year: { type: Number },
    link: { type: String, default: '' },     // DOI or URL

    // ── NEED HELP SPECIFIC ───────────────────────────────
    // Used when type === 'need'
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', ''],
      default: ''
    },

    // ── OPPORTUNITY SPECIFIC ─────────────────────────────
    // Used when type === 'opportunity'
    // Only supervisors can create these
    deadline: { type: Date },
    funding: { type: String, default: '' },
    requirements: { type: String, default: '' },
    duration: { type: String, default: '' },
    location: { type: String, default: '' },

    // ── ENGAGEMENT ───────────────────────────────────────
    // Array of User IDs who liked this post
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],

    // Array of comment objects
    comments: [commentSchema],

    // ── UNIQUE FEATURES ──────────────────────────────────
    // Feature W5: Research Karma
    // How much karma did this post earn its author?
    karmaEarned: { type: Number, default: 0 },

    // Feature M3: Feed Ranking
    // Pre-calculated relevance score for ranking
    relevanceScore: { type: Number, default: 0 }
  },
  {
    timestamps: true
    // Automatically adds createdAt and updatedAt
  }
);

// Index for faster searching
// When we search posts by tags or type, MongoDB uses these indexes
// Without indexes, MongoDB reads every document — very slow
// With indexes, it jumps directly to matching documents — very fast
postSchema.index({ tags: 1 });
postSchema.index({ type: 1 });
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);