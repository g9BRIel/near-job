const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, toggleBlock } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateSendMessage } = require('../middleware/validationMiddleware');

router.route('/')
  .get(authMiddleware, getConversations)
  .post(authMiddleware, validateSendMessage, sendMessage);

router.route('/:id/messages')
  .get(authMiddleware, getMessages);

router.put('/:id/toggle-block', authMiddleware, toggleBlock);

module.exports = router;
