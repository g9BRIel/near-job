const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Bookmark = sequelize.define('Bookmark', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID of the job or user being bookmarked',
  },
  targetType: {
    type: DataTypes.ENUM('job', 'worker', 'company'),
    allowNull: false,
  }
});

module.exports = Bookmark;
