const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const Worker = sequelize.define(
  'Worker',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    latitude: { type: DataTypes.FLOAT, allowNull: true },
    longitude: { type: DataTypes.FLOAT, allowNull: true },
    fullName: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    experience: { type: DataTypes.STRING },
    jobTitle: { type: DataTypes.STRING },
    skills: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    avatar: { type: DataTypes.TEXT('long') },
    bio: { type: DataTypes.TEXT },
    cv: { type: DataTypes.TEXT('long') }, // Path to CV file or base64
    lastActiveAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 5.0, // Everyone starts with 5 stars
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isBanned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userType: {
      type: DataTypes.STRING,
      defaultValue: 'worker',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {
        theme: 'dark',
        notifications: {
          email: true,
          inApp: true,
          messages: true,
          jobs: true,
        },
        privacy: {
          profileVisible: true,
          allowMessages: true,
          searchable: true,
        },
        preferences: {
          language: 'en',
          emailFrequency: 'weekly',
        },
      },
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (worker) => {
        if (worker.password) {
          const salt = await bcrypt.genSalt(10);
          worker.password = await bcrypt.hash(worker.password, salt);
        }
      },
      beforeUpdate: async (worker) => {
        if (worker.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          worker.password = await bcrypt.hash(worker.password, salt);
        }
      },
    },
  }
);

Worker.prototype.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = Worker;
