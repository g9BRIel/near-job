const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Broadcast = sequelize.define('Broadcast', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  target: {
    type: DataTypes.ENUM('all', 'workers', 'companies'),
    defaultValue: 'all'
  },
  type: {
    type: DataTypes.STRING, // info, alert, promo
    defaultValue: 'info'
  },
  readCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

module.exports = Broadcast;
