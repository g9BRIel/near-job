const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const Company = sequelize.define(
  'Company',
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
    companyName: { type: DataTypes.STRING },
    industry: { type: DataTypes.STRING },
    companySize: { type: DataTypes.STRING },
    website: { type: DataTypes.STRING },
    about: { type: DataTypes.TEXT },
    logo: { type: DataTypes.TEXT('long') },
    lastActiveAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 5.0,
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
      defaultValue: 'company',
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
      beforeCreate: async (company) => {
        if (company.password) {
          const salt = await bcrypt.genSalt(10);
          company.password = await bcrypt.hash(company.password, salt);
        }
      },
      beforeUpdate: async (company) => {
        if (company.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          company.password = await bcrypt.hash(company.password, salt);
        }
      },
    },
  }
);

Company.prototype.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = Company;
