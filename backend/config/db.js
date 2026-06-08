const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false, // Disabled now that DB is in sync
    pool: {
      max: 10,        // Max 10 concurrent DB connections
      min: 0,
      acquire: 30000, // Throw error after 30s if can't get connection
      idle: 10000,    // Release idle connections after 10s
    },
    retry: {
      max: 3,         // Retry failed queries up to 3 times
    },
  }
);

module.exports = sequelize;
