// ============================================================
// FILE: models/Endorsement.js
// An Endorsement is when one researcher verifies that
// another researcher actually has a specific skill.
//
// ResearchConnect context:
// Prof. Hassan worked with Mansora and can confirm she
// is genuinely skilled at SHAP explainability.
// He clicks "+ Endorse" next to that skill on her profile.
// This creates an Endorsement document linking him to her
// for that specific skill.
//
// Why this matters:
// Anyone can write "Python" on their profile.
// An endorsement from a verified supervisor means something.
// It is evidence, not just a claim.
// ============================================================

const mongoose = require('mongoose');

const endorsementSchema = new mongoose.Schema(
  {
    // Who is giving the endorsement
    endorser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Who is receiving the endorsement
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Which skill is being endorsed
    skill: {
      type: String,
      required: true,
      trim: true
    },

    // Optional note about why they are endorsing this skill
    // e.g. "Mansora demonstrated excellent SHAP analysis
    // in our collaboration on the UWE ranking project"
    note: { type: String, default: '' },

    // Feature W5: Research Karma
    // How much karma did this endorsement earn the recipient?
    karmaAwarded: { type: Number, default: 2 }
  },
  {
    timestamps: true
  }
);

// Prevent someone from endorsing the same skill twice
// One person can only endorse your Python skill once
endorsementSchema.index(
  { endorser: 1, recipient: 1, skill: 1 },
  { unique: true }
);

module.exports = mongoose.model('Endorsement', endorsementSchema);