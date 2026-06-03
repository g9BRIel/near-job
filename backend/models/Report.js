const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  reporterId: {
    type: DataTypes.STRING, // Can be user email or ID
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'resolved', 'closed'),
    defaultValue: 'pending',
  },
  assignedToType: {
    type: DataTypes.ENUM('superadmin', 'hacker', 'developer', 'tester', 'editor'),
    defaultValue: 'superadmin',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  notes: {
    type: DataTypes.TEXT, // Internal admin notes
  }
}, {
  timestamps: true,
});

module.exports = Report;
