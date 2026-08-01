// ============================================================
// FILE: routes/messages.js
// Message routes — direct messaging between researchers
//
// ResearchConnect context:
// After a supervisor accepts a student's application,
// they can message each other directly.
// No email. No WhatsApp. Everything inside ResearchConnect.
// Documents like offer letters and CVs are exchanged here.
//
// How conversations work:
// A conversation between Mansora and Dr. Sarah is identified
// by a conversationId — the two user IDs sorted and joined.
// This means the same conversation ID is used whether
// Mansora messages Dr. Sarah or Dr. Sarah messages Mansora.
// ============================================================

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// ── HELPER: Generate conversation ID ─────────────────────
// Takes two user IDs and creates a consistent conversation ID
// Sorting ensures the same ID regardless of who sends first
// e.g. user A and user B always get "idA_idB" not sometimes "idB_idA"
function getConversationId(userId1, userId2) {
  return [userId1.toString(), userId2.toString()]
    .sort()
    .join('_');
}

// ── ROUTE 1: GET /api/messages ────────────────────────────
// Get list of all conversations for current user
// Used by: Messages page sidebar — shows all conversations
//
// ResearchConnect context:
// Mansora opens Messages page and sees:
// - Dr. Sarah Chen — "Great background Mansora..." — 2h ago
// - Prof. Hassan — "I saw your IEEE paper..." — Yesterday
router.get('/', protect, async (req, res) => {
  try {
    // Find all messages where current user is sender or recipient
    // Group by conversationId to get unique conversations
    const conversations = await Message.aggregate([
      {
        // Match messages involving the current user
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      {
        // Sort newest first before grouping
        $sort: { createdAt: -1 }
      },
      {
        // Group by conversation — keep the most recent message
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          // Count unread messages in this conversation
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$read', false] },
                    { $eq: ['$recipient', req.user._id] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        // Sort conversations by most recent message
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Populate sender and recipient details for each conversation
    const populatedConversations = await Message.populate(conversations, [
      { path: 'lastMessage.sender', select: 'username profilePhoto role university' },
      { path: 'lastMessage.recipient', select: 'username profilePhoto role university' }
    ]);

    res.status(200).json({ conversations: populatedConversations });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 2: GET /api/messages/:userId ───────────────────
// Get full conversation with a specific user
// Used by: Messages page — clicking a conversation
//
// ResearchConnect context:
// Mansora clicks on her conversation with Dr. Sarah Chen.
// All messages between them appear in order.
// Older messages at top, newest at bottom.
router.get('/:userId', protect, async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    // Verify the other user exists
    const otherUser = await User.findById(otherUserId)
      .select('username profilePhoto role university');
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate the conversation ID for these two users
    const conversationId = getConversationId(req.user._id, otherUserId);

    // Get all messages in this conversation
    const messages = await Message.find({ conversationId })
      .populate('sender', 'username profilePhoto role')
      .populate('recipient', 'username profilePhoto role')
      .sort({ createdAt: 1 });
    // sort ascending = oldest first, newest last
    // like WhatsApp — scroll down to see newer messages

    // Mark all unread messages as read
    // When Mansora opens the conversation, all of Dr. Sarah's
    // messages get marked as read automatically
    await Message.updateMany(
      {
        conversationId,
        recipient: req.user._id,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      messages,
      otherUser,
      conversationId
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: POST /api/messages/:userId ──────────────────
// Send a text message to a user
// Used by: Message input box — send button
//
// ResearchConnect context:
// Dr. Sarah Chen types "Great background Mansora, let us
// schedule a call" and clicks send.
// Mansora receives it instantly and gets a notification.
router.post('/:userId', protect, async (req, res) => {
  try {
    const recipientId = req.params.userId;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    // Check recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Generate consistent conversation ID
    const conversationId = getConversationId(req.user._id, recipientId);

    // Create the message
    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      conversationId,
      content: content.trim(),
      type: 'text'
    });

    // Populate sender info for the response
    await message.populate('sender', 'username profilePhoto role');
    await message.populate('recipient', 'username profilePhoto role');

    // Create notification for recipient
    await Notification.create({
      recipient: recipientId,
      type: 'message',
      title: `New message from ${req.user.username}`,
      body: content.length > 60 ? content.substring(0, 60) + '...' : content,
      actionPath: `/messages/${req.user._id}`,
      triggeredBy: req.user._id
    });

    res.status(201).json({ message });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 4: POST /api/messages/:userId/document ─────────
// Send a document to a user
// Used by: Document exchange — attach and send file
//
// ResearchConnect context:
// After Dr. Sarah accepts Mansora's application,
// she sends an offer letter PDF.
// Mansora can then send her signed agreement back.
// This is the document exchange feature.
//
// Note: In production, files would be uploaded to
// AWS S3 or Cloudinary first, then the URL sent here.
// For now we accept the URL directly.
router.post('/:userId/document', protect, async (req, res) => {
  try {
    const recipientId = req.params.userId;
    const { name, filename, url, size, mimeType } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'Document URL is required' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const conversationId = getConversationId(req.user._id, recipientId);

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      conversationId,
      type: 'document',
      content: `Sent a document: ${name || filename}`,
      document: { name, filename, url, size, mimeType }
    });

    await message.populate('sender', 'username profilePhoto role');

    // Notify recipient
    await Notification.create({
      recipient: recipientId,
      type: 'message',
      title: `${req.user.username} sent you a document`,
      body: `Document: ${name || filename}`,
      actionPath: `/messages/${req.user._id}`,
      triggeredBy: req.user._id
    });

    res.status(201).json({ message });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 5: DELETE /api/messages/:messageId ─────────────
// Delete a message
// Can only delete your own messages
router.delete('/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You can only delete your own messages'
      });
    }

    await message.deleteOne();

    res.status(200).json({ message: 'Message deleted' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;