const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fromId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  toId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fromType: {
    type: DataTypes.ENUM('worker', 'company'),
    allowNull: false,
  },
  toType: {
    type: DataTypes.ENUM('worker', 'company'),
    allowNull: false,
  },
  stars: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['fromId', 'toId', 'fromType', 'toType'] // One rating per pair
    }
  ]
});

module.exports = Rating;
