// ============================================================
// FILE: models/Message.js
// A Message is a direct message between two researchers.
//
// ResearchConnect context:
// After Dr. Sarah Chen accepts Mansora's application,
// they can message each other directly inside the platform.
// No email needed. Messages can include text and documents.
// This is where document exchange happens —
// supervisor sends offer letter, student sends signed agreement.
// ============================================================

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // Who sent this message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Who receives this message
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // The conversation this message belongs to
    // A conversation is identified by sorting both user IDs
    // and joining them with an underscore
    // e.g. "6a6e5e37_6a6e60e9" — always the same regardless
    // of who sends first
    conversationId: {
      type: String,
      required: true,
      index: true
    },

    // Message text content
    content: { type: String, default: '' },

    // Type of message
    type: {
      type: String,
      enum: ['text', 'document', 'system'],
      default: 'text'
    },

    // Document attachment — used when type is 'document'
    // ResearchConnect context:
    // Supervisor sends offer letter PDF
    // Student sends signed agreement
    // Student sends additional CV or transcript
    document: {
      name: { type: String },        // display name e.g. "Offer Letter"
      filename: { type: String },    // original filename
      url: { type: String },         // storage URL
      size: { type: Number },        // file size in bytes
      mimeType: { type: String }     // e.g. "application/pdf"
    },

    // Has the recipient read this message?
    read: { type: Boolean, default: false },

    // When was it read?
    readAt: { type: Date }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Message', messageSchema);