const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Settings = sequelize.define('Settings', {
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
  theme: {
    type: DataTypes.ENUM('dark', 'light'),
    defaultValue: 'dark'
  },
  // Notification settings
  notifications_email: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notifications_inApp: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notifications_messages: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notifications_jobs: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Privacy settings
  privacy_profileVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  privacy_allowMessages: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  privacy_searchable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Preferences
  preferences_language: {
    type: DataTypes.STRING,
    defaultValue: 'en'
  },
  preferences_emailFrequency: {
    type: DataTypes.ENUM('instant', 'daily', 'weekly', 'monthly'),
    defaultValue: 'weekly'
  }
}, {
  tableName: 'user_settings',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'userType']
    }
  ]
});

module.exports = Settings;