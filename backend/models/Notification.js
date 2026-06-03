const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userType: {
    type: DataTypes.ENUM('worker', 'company'),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false, // e.g., 'message', 'application', 'system'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true, // Optional link to redirect on click
  }
}, {
  timestamps: true,
});

module.exports = Notification;
