const Block = require('../models/Block');
const Worker = require('../models/Worker');
const Company = require('../models/Company');

exports.blockUser = async (req, res) => {
  try {
    const { blockedId, blockedType } = req.body;
    const blockerId = req.user.id;
    const blockerType = req.user.userType;
    const Conversation = require('../models/Conversation');

    if (blockerId === blockedId && blockerType === blockedType) {
      return res.status(400).json({ message: "You can't block yourself" });
    }

    const [block, created] = await Block.findOrCreate({
      where: { blockerId, blockerType, blockedId, blockedType }
    });

    // Also set conversation-level block if it exists
    const conversationWhere = blockerType === 'worker'
      ? { workerId: blockerId, companyId: blockedId }
      : { workerId: blockedId, companyId: blockerId };

    const conversation = await Conversation.findOne({ where: conversationWhere });
    if (conversation) {
      if (blockerType === 'worker') {
        conversation.blockedByWorker = true;
      } else {
        conversation.blockedByCompany = true;
      }
      await conversation.save();
    }

    res.json({ message: 'User blocked successfully', block });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { blockedId, blockedType } = req.body;
    const blockerId = req.user.id;
    const blockerType = req.user.userType;
    const Conversation = require('../models/Conversation');

    // Remove global block record
    await Block.destroy({
      where: { blockerId, blockerType, blockedId, blockedType }
    });

    // Also clear conversation-level block if it exists
    const conversationWhere = blockerType === 'worker'
      ? { workerId: blockerId, companyId: blockedId }
      : { workerId: blockedId, companyId: blockerId };

    const conversation = await Conversation.findOne({ where: conversationWhere });
    if (conversation) {
      if (blockerType === 'worker') {
        conversation.blockedByWorker = false;
      } else {
        conversation.blockedByCompany = false;
      }
      await conversation.save();
    }

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBlockedUsers = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockerType = req.user.userType;

    const blockedList = await Block.findAll({
      where: { blockerId, blockerType }
    });

    // Fetch profile details for each blocked user
    const detailedList = await Promise.all(blockedList.map(async (b) => {
      let profile = null;
      if (b.blockedType === 'worker') {
        profile = await Worker.findByPk(b.blockedId, { attributes: ['id', 'fullName', 'avatar', 'jobTitle'] });
      } else {
        profile = await Company.findByPk(b.blockedId, { attributes: ['id', 'companyName', 'logo', 'industry'] });
      }
      return {
        id: b.blockedId,
        type: b.blockedType,
        profile
      };
    }));

    res.json(detailedList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkBlockStatus = async (blockerId, blockerType, blockedId, blockedType) => {
  const block = await Block.findOne({
    where: { blockerId, blockerType, blockedId, blockedType }
  });
  return !!block;
};
