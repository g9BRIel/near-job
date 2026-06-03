const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Company = require('./Company');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  companyName: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  salary: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'Full-time',
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  logo: {
    type: DataTypes.TEXT('long'),
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  applicants: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

Job.belongsTo(Company, { as: 'companyUser', foreignKey: 'companyId' });
Company.hasMany(Job, { foreignKey: 'companyId' });

module.exports = Job;
