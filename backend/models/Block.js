const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Block = sequelize.define('Block', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  blockerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  blockerType: {
    type: DataTypes.STRING, // 'worker' or 'company'
    allowNull: false,
  },
  blockedId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  blockedType: {
    type: DataTypes.STRING, // 'worker' or 'company'
    allowNull: false,
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['blockerId', 'blockerType', 'blockedId', 'blockedType']
    }
  ]
});

module.exports = Block;
