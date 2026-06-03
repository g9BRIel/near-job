const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Worker = require('../models/Worker');
const Company = require('../models/Company');
const Block = require('../models/Block');
const { Op } = require('sequelize');

// Fetch all active conversations for the logged in user
exports.getConversations = async (req, res) => {
  try {
    const { id, userType } = req.user;
    const where = userType === 'worker' ? { workerId: id } : { companyId: id };

    // Find all users who have blocked me OR I have blocked
    const blocks = await Block.findAll({
      where: {
        [Op.or]: [
          { blockerId: id, blockerType: userType },
          { blockedId: id, blockedType: userType }
        ]
      }
    });

    const conversations = await Conversation.findAll({
      where: {
        ...where,
      },
      include: [
        { model: Company, attributes: ['id', 'companyName', 'location', 'logo', 'isBanned'] },
        { model: Worker, attributes: ['id', 'fullName', 'role', 'avatar', 'jobTitle', 'isBanned'] },
        { model: Message, as: 'messages', limit: 1, order: [['createdAt', 'DESC']] }
      ],
      order: [['updatedAt', 'DESC']]
    });

    const results = await Promise.all(conversations.map(async (c) => {
      const otherId = userType === 'worker' ? c.companyId : c.workerId;
      const otherType = userType === 'worker' ? 'company' : 'worker';
      const other = userType === 'worker' ? c.Company : c.Worker;

      const block = await Block.findOne({
        where: {
          [Op.or]: [
            { blockerId: id, blockerType: userType, blockedId: otherId, blockedType: otherType },
            { blockerId: otherId, blockerType: otherType, blockedId: id, blockedType: userType }
          ]
        }
      });

      const unreadCount = await Message.count({
        where: {
          conversationId: c.id,
          isRead: false,
          senderWorkerId: userType === 'worker' ? null : { [require('sequelize').Op.not]: null },
          senderCompanyId: userType === 'company' ? null : { [require('sequelize').Op.not]: null }
        }
      });

      return {
        ...c.get({ plain: true }),
        unreadCount,
        blockedByMe: block ? (block.blockerId === id && block.blockerType === userType) : false,
        blockedByThem: block ? (block.blockedId === id && block.blockedType === userType) : false,
        otherIsBanned: other ? !!other.isBanned : false,
      };
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch messages for a specific conversation
exports.getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findByPk(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const { id, userType } = req.user;
    if ((userType === 'worker' && conversation.workerId !== id) ||
        (userType === 'company' && conversation.companyId !== id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.findAll({
      where: { conversationId: req.params.id },
      order: [['createdAt', 'ASC']]
    });

    // Mark messages as read if the current user is NOT the sender
    const isWorker = userType === 'worker';
    await Message.update({ isRead: true }, {
      where: {
        conversationId: req.params.id,
        isRead: false,
        [isWorker ? 'senderCompanyId' : 'senderWorkerId']: { [require('sequelize').Op.not]: null }
      }
    });

    const formattedMessages = messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      text: m.text,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      senderId: m.senderWorkerId || m.senderCompanyId,
      senderUserType: m.senderWorkerId ? 'worker' : 'company',
      isRead: m.isRead,
    }));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a new message (and create conversation if none exists)
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverType, text } = req.body;
    const senderId = req.user.id;
    const senderType = req.user.userType;

    if (!['worker', 'company'].includes(receiverType)) {
      return res.status(400).json({ message: 'Receiver type is required and must be worker or company' });
    }

    if (receiverType === senderType) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    const isWorkerSender = senderType === 'worker';
    const isWorkerReceiver = receiverType === 'worker';
    const receiverModel = isWorkerReceiver ? Worker : Company;

    const receiver = await receiverModel.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Check for global block
    const isBlocked = await Block.findOne({
      where: {
        [Op.or]: [
          { blockerId: senderId, blockerType: senderType, blockedId: receiverId, blockedType: receiverType },
          { blockerId: receiverId, blockerType: receiverType, blockedId: senderId, blockedType: senderType }
        ]
      }
    });

    if (isBlocked) {
      return res.status(403).json({ message: 'You cannot message this user because one of you has blocked the other.' });
    }

    const conversationWhere = isWorkerSender
      ? { workerId: senderId, companyId: receiverId }
      : { workerId: receiverId, companyId: senderId };

    let conversation = await Conversation.findOne({ where: conversationWhere });
    
    if (conversation && (conversation.blockedByWorker === true || conversation.blockedByCompany === true)) {
      return res.status(403).json({ message: 'This conversation is blocked.' });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        workerId: isWorkerSender ? senderId : receiverId,
        companyId: isWorkerSender ? receiverId : senderId
      });
    }

    const messageData = {
      conversationId: conversation.id,
      text,
    };
    if (isWorkerSender) {
      messageData.senderWorkerId = senderId;
    } else {
      messageData.senderCompanyId = senderId;
    }

    const created = await Message.create(messageData);
    res.status(201).json({
      id: created.id,
      conversationId: created.conversationId,
      text: created.text,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      senderId: created.senderWorkerId || created.senderCompanyId,
      senderUserType: created.senderWorkerId ? 'worker' : 'company',
    });
  } catch (error) {
    console.error('[sendMessage ERROR]', error.message, error.stack);
    res.status(500).json({ message: error.message });
  }
};

exports.toggleBlock = async (req, res) => {
  try {
    const { id, userType } = req.user;
    const conversation = await Conversation.findByPk(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const otherId = userType === 'worker' ? conversation.companyId : conversation.workerId;
    const otherType = userType === 'worker' ? 'company' : 'worker';

    let currentlyBlocked = false;
    if (userType === 'worker') {
      if (conversation.workerId !== id) return res.status(403).json({ message: 'Unauthorized' });
      conversation.blockedByWorker = !conversation.blockedByWorker;
      currentlyBlocked = conversation.blockedByWorker;
    } else {
      if (conversation.companyId !== id) return res.status(403).json({ message: 'Unauthorized' });
      conversation.blockedByCompany = !conversation.blockedByCompany;
      currentlyBlocked = conversation.blockedByCompany;
    }

    // Synchronize with global Block table
    if (currentlyBlocked) {
      await Block.findOrCreate({
        where: { blockerId: id, blockerType: userType, blockedId: otherId, blockedType: otherType }
      });
    } else {
      await Block.destroy({
        where: { blockerId: id, blockerType: userType, blockedId: otherId, blockedType: otherType }
      });
    }

    await conversation.save();
    res.json({ 
      blockedByWorker: conversation.blockedByWorker, 
      blockedByCompany: conversation.blockedByCompany,
      isBlocked: conversation.blockedByWorker || conversation.blockedByCompany,
      blockedByMe: currentlyBlocked
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
