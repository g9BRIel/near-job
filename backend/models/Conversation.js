const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Worker = require('./Worker');
const Company = require('./Company');

const Conversation = sequelize.define(
  'Conversation',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    workerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    blockedByWorker: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    blockedByCompany: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['workerId', 'companyId'],
      },
    ],
  }
);

Conversation.belongsTo(Worker, { foreignKey: 'workerId' });
Conversation.belongsTo(Company, { foreignKey: 'companyId' });
Worker.hasMany(Conversation, { foreignKey: 'workerId' });
Company.hasMany(Conversation, { foreignKey: 'companyId' });

module.exports = Conversation;
