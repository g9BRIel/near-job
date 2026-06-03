const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GlobalSettings = sequelize.define('GlobalSettings', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  group: {
    type: DataTypes.STRING,
    defaultValue: 'general'
  }
}, {
  tableName: 'global_settings',
  timestamps: true
});

module.exports = GlobalSettings;
