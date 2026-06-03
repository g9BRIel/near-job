const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: console.log,
  }
);

async function check() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const [results, metadata] = await sequelize.query("SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'nearjob' AND COLUMN_KEY = 'PRI';");
    
    console.log('Primary Keys in DB:');
    const tablePKs = {};
    results.forEach(row => {
      if (!tablePKs[row.TABLE_NAME]) tablePKs[row.TABLE_NAME] = [];
      tablePKs[row.TABLE_NAME].push(row.COLUMN_NAME);
    });
    
    console.table(tablePKs);
    
    for (const [table, pks] of Object.entries(tablePKs)) {
      if (pks.length > 1) {
        console.error(`ALERT: Table ${table} has MULTIPLE primary keys: ${pks.join(', ')}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
}

check();
