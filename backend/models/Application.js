const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Worker = require('./Worker');
const Job = require('./Job');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
  coverLetter: {
    type: DataTypes.TEXT,
  },
  resume: {
    type: DataTypes.TEXT('long'), // Path to file, URL, or base64
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: true,
});

Application.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });
Worker.hasMany(Application, { foreignKey: 'workerId' });

Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(Application, { foreignKey: 'jobId' });

module.exports = Application;
