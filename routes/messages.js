const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { validateMessage } = require('../middleware/validate');

// Helper — generate consistent conversation ID
function getConversationId(userId1, userId2) {
  return [userId1.toString(), userId2.toString()]
    .sort()
    .join('_');
}

// ── ROUTE 1: GET /api/messages ────────────────────────────
// Get list of all conversations for current user
router.get('/', protect, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
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
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    const populated = await Message.populate(conversations, [
      { path: 'lastMessage.sender', select: 'username profilePhoto role university' },
      { path: 'lastMessage.recipient', select: 'username profilePhoto role university' }
    ]);

    res.status(200).json({ conversations: populated });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 2: GET /api/messages/:userId ───────────────────
// Get full conversation with a specific user
router.get('/:userId', protect, async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const otherUser = await User.findById(otherUserId)
      .select('username profilePhoto role university');
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const conversationId = getConversationId(req.user._id, otherUserId);

    const messages = await Message.find({ conversationId })
      .populate('sender', 'username profilePhoto role')
      .populate('recipient', 'username profilePhoto role')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { conversationId, recipient: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.status(200).json({ messages, otherUser, conversationId });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── ROUTE 3: POST /api/messages/:userId ──────────────────
// Send a text message
router.post('/:userId', protect, validateMessage, async (req, res) => {
  try {
    const recipientId = req.params.userId;
    const { content } = req.body;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const conversationId = getConversationId(req.user._id, recipientId);

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      conversationId,
      content: content.trim(),
      type: 'text'
    });

    await message.populate('sender', 'username profilePhoto role');
    await message.populate('recipient', 'username profilePhoto role');

    // Notify recipient
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
// Send a document
// Used by: Document exchange — supervisor sends offer letter
// student sends signed agreement
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
// Delete a message — only sender can delete
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