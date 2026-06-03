const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Conversation = require('./Conversation');
const Worker = require('./Worker');
const Company = require('./Company');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  senderWorkerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  senderCompanyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

Message.belongsTo(Conversation, { foreignKey: 'conversationId' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });

Message.belongsTo(Worker, { as: 'senderWorker', foreignKey: 'senderWorkerId' });
Message.belongsTo(Company, { as: 'senderCompany', foreignKey: 'senderCompanyId' });

module.exports = Message;
