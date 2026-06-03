const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AdminLog = sequelize.define('AdminLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  adminName: {
    type: DataTypes.STRING,
  },
  action: {
    type: DataTypes.STRING, // e.g., 'SUSPEND_USER', 'DELETE_JOB'
  },
  details: {
    type: DataTypes.TEXT,
  },
  targetId: {
    type: DataTypes.STRING, // The ID of the user/job affected
  },
  targetType: {
    type: DataTypes.STRING,
  }
}, {
  timestamps: true,
});

module.exports = AdminLog;
